import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { protonVertexShader, protonFragmentShader } from './shaders/protonShader';
import { electronVertexShader, electronFragmentShader } from './shaders/electronShader';
import { neutronVertexShader, neutronFragmentShader } from './shaders/neutronShader';

// 球状にランダムな位置を生成
function generateSpherePositions(count: number, radius: number): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.cbrt(Math.random()) * radius; // 立方根で球内に均等分布

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions.push(new THREE.Vector3(x, y, z));
  }
  return positions;
}

// 粒子データ型
interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

// 電子殻の設定
interface ElectronShell {
  electrons: number;
  radius: number;
}

// AtomModelのプロパティ
interface AtomModelProps {
  protonCount: number;
  neutronCount: number;
  electronShells: ElectronShell[];
  nucleusRadius?: number;
  particleRadius?: number;
  repulsionForce?: number;
  attractionForce?: number;
  dampening?: number;
  centerForce?: number;
  rotationSpeed?: number;
}

export function AtomModel({
  protonCount,
  neutronCount,
  electronShells,
  nucleusRadius = 0.3,
  particleRadius = 0.1,
  repulsionForce = 0.000009,
  attractionForce = 0.000003,
  dampening = 0.9,
  centerForce = 0.000001,
  rotationSpeed = 1.0,
}: AtomModelProps) {
  // 陽子と中性子の位置と速度を管理
  const particlesRef = useRef<{
    protons: Particle[];
    neutrons: Particle[];
  } | null>(null);

  // 初期化（一度だけ）
  if (!particlesRef.current) {
    const protonPositions = generateSpherePositions(protonCount, nucleusRadius);
    const neutronPositions = generateSpherePositions(neutronCount, nucleusRadius);

    particlesRef.current = {
      protons: protonPositions.map(pos => ({
        position: pos.clone(),
        velocity: new THREE.Vector3(0, 0, 0),
      })),
      neutrons: neutronPositions.map(pos => ({
        position: pos.clone(),
        velocity: new THREE.Vector3(0, 0, 0),
      })),
    };
  }

  // 表示用の陽子と中性子のref
  const protonMeshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const neutronMeshRefs = useRef<(THREE.Mesh | null)[]>([]);

  // 各軌道のグループと電子のref
  const orbitRefs = useRef<(THREE.Group | null)[]>([]);
  const electronRefs = useRef<(THREE.Mesh | null)[][]>([]);
  const angleRefs = useRef<number[][]>([]);

  // 初期化
  if (angleRefs.current.length === 0) {
    electronShells.forEach((shell) => {
      const angles = Array(shell.electrons).fill(0).map((_, i) => (i / shell.electrons) * Math.PI * 2);
      angleRefs.current.push(angles);
      electronRefs.current.push([]);
    });
  }

  // 陽子用のグラデーションシェーダーマテリアル
  const protonMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#ffaa44') },
        color2: { value: new THREE.Color('#ff3300') },
        color3: { value: new THREE.Color('#dd0000') },
      },
      vertexShader: protonVertexShader,
      fragmentShader: protonFragmentShader,
    });
  }, []);

  // 電子用のグラデーションシェーダーマテリアル
  const electronMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#88ddff') },
        color2: { value: new THREE.Color('#0088ff') },
        color3: { value: new THREE.Color('#0044aa') },
      },
      vertexShader: electronVertexShader,
      fragmentShader: electronFragmentShader,
    });
  }, []);

  // 中性子用のグラデーションシェーダーマテリアル（黄緑色）
  const neutronMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#ccff66') }, // 明るい黄緑
        color2: { value: new THREE.Color('#88cc00') }, // 中間の黄緑
        color3: { value: new THREE.Color('#558800') }, // 暗い黄緑
      },
      vertexShader: neutronVertexShader,
      fragmentShader: neutronFragmentShader,
    });
  }, []);

  // アニメーション
  useFrame((state, delta) => {
    const particles = particlesRef.current;
    if (!particles) return;

    // 物理シミュレーション定数
    const minDistance = particleRadius * 1.35; // 最小距離（重ならないように）

    const allProtons = particles.protons;
    const allNeutrons = particles.neutrons;

    // 陽子の力を計算
    allProtons.forEach((proton, i) => {
      const force = new THREE.Vector3(0, 0, 0);

      // 他の陽子との反発力
      allProtons.forEach((other, j) => {
        if (i === j) return;
        const diff = new THREE.Vector3().subVectors(proton.position, other.position);
        const distance = diff.length();
        if (distance < minDistance) {
          diff.normalize().multiplyScalar(repulsionForce / (distance * distance + 0.01));
          force.add(diff);
        }
      });

      // 中性子との引力
      allNeutrons.forEach(neutron => {
        const diff = new THREE.Vector3().subVectors(neutron.position, proton.position);
        const distance = diff.length();
        if (distance > minDistance && distance < 0.5) {
          diff.normalize().multiplyScalar(attractionForce);
          force.add(diff);
        }
      });

      // 中心への引力
      const toCenter = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), proton.position);
      force.add(toCenter.multiplyScalar(centerForce));

      // 速度と位置を更新
      proton.velocity.add(force);
      proton.velocity.multiplyScalar(dampening);
      proton.position.add(proton.velocity);

      // 境界制限（半径nucleusRadiusの球内に制限）
      const distanceFromCenter = proton.position.length();
      if (distanceFromCenter > nucleusRadius) {
        // 位置を球面上に戻す
        proton.position.normalize().multiplyScalar(nucleusRadius);
        // 速度の法線成分を反転（壁との衝突）
        const normal = proton.position.clone().normalize();
        const normalVelocity = normal.clone().multiplyScalar(proton.velocity.dot(normal));
        proton.velocity.sub(normalVelocity.multiplyScalar(1.5)); // 反発を少し強めに
      }
    });

    // 中性子の力を計算
    allNeutrons.forEach((neutron, i) => {
      const force = new THREE.Vector3(0, 0, 0);

      // 他の中性子との反発力
      allNeutrons.forEach((other, j) => {
        if (i === j) return;
        const diff = new THREE.Vector3().subVectors(neutron.position, other.position);
        const distance = diff.length();
        if (distance < minDistance) {
          diff.normalize().multiplyScalar(repulsionForce / (distance * distance + 0.01));
          force.add(diff);
        }
      });

      // 陽子との引力
      allProtons.forEach(proton => {
        const diff = new THREE.Vector3().subVectors(proton.position, neutron.position);
        const distance = diff.length();
        if (distance > minDistance && distance < 0.5) {
          diff.normalize().multiplyScalar(attractionForce);
          force.add(diff);
        }
      });

      // 中心への引力
      const toCenter = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), neutron.position);
      force.add(toCenter.multiplyScalar(centerForce));

      // 速度と位置を更新
      neutron.velocity.add(force);
      neutron.velocity.multiplyScalar(dampening);
      neutron.position.add(neutron.velocity);

      // 境界制限（半径nucleusRadiusの球内に制限）
      const distanceFromCenter = neutron.position.length();
      if (distanceFromCenter > nucleusRadius) {
        // 位置を球面上に戻す
        neutron.position.normalize().multiplyScalar(nucleusRadius);
        // 速度の法線成分を反転（壁との衝突）
        const normal = neutron.position.clone().normalize();
        const normalVelocity = normal.clone().multiplyScalar(neutron.velocity.dot(normal));
        neutron.velocity.sub(normalVelocity.multiplyScalar(1.5)); // 反発を少し強めに
      }
    });

    // メッシュの位置を更新
    protonMeshRefs.current.forEach((mesh, i) => {
      if (mesh && allProtons[i]) {
        mesh.position.copy(allProtons[i].position);
      }
    });

    neutronMeshRefs.current.forEach((mesh, i) => {
      if (mesh && allNeutrons[i]) {
        mesh.position.copy(allNeutrons[i].position);
      }
    });

    // 各軌道を回転（rotationSpeedを適用）
    electronShells.forEach((_, shellIndex) => {
      const orbitGroup = orbitRefs.current[shellIndex];
      if (orbitGroup) {
        orbitGroup.rotation.x += delta * (0.3 + shellIndex * 0.1) * rotationSpeed;
        orbitGroup.rotation.y += delta * (0.2 + shellIndex * 0.05) * rotationSpeed;
        orbitGroup.rotation.z += delta * (0.15 + shellIndex * 0.08) * rotationSpeed;
      }

      // 各電子を軌道上で移動（rotationSpeedを適用）
      const electrons = electronRefs.current[shellIndex];
      const angles = angleRefs.current[shellIndex];
      const radius = electronShells[shellIndex].radius;

      electrons.forEach((electron, electronIndex) => {
        if (electron && angles) {
          angles[electronIndex] += delta * (1.0 - shellIndex * 0.1) * rotationSpeed;
          electron.position.x = Math.cos(angles[electronIndex]) * radius;
          electron.position.z = Math.sin(angles[electronIndex]) * radius;
        }
      });
    });

    // シェーダーのtimeを更新
    protonMaterial.uniforms.time.value = state.clock.elapsedTime;
    electronMaterial.uniforms.time.value = state.clock.elapsedTime;
    neutronMaterial.uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <group>
      {/* 原子核: 陽子（赤） */}
      {particlesRef.current?.protons.map((particle, index) => (
        <Sphere
          key={`proton-${index}`}
          ref={el => {
            protonMeshRefs.current[index] = el;
          }}
          args={[particleRadius, 8, 8]}
          position={particle.position}
        >
          <primitive object={protonMaterial.clone()} attach="material" />
        </Sphere>
      ))}

      {/* 原子核: 中性子（黄緑） */}
      {particlesRef.current?.neutrons.map((particle, index) => (
        <Sphere
          key={`neutron-${index}`}
          ref={el => {
            neutronMeshRefs.current[index] = el;
          }}
          args={[particleRadius, 8, 8]}
          position={particle.position}
        >
          <primitive object={neutronMaterial.clone()} attach="material" />
        </Sphere>
      ))}

      {/* 原子核の発光（赤と黄緑の中間色） */}
      <pointLight position={[0, 0, 0]} intensity={1.8} color="#ff9933" distance={3} />

      {/* 各電子殻 */}
      {electronShells.map((shell, shellIndex) => (
        <group
          key={shellIndex}
          ref={(el) => {
            orbitRefs.current[shellIndex] = el;
          }}
        >
          {/* 軌道（トーラス） */}
          <Torus args={[shell.radius, 0.015, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </Torus>

          {/* 電子 */}
          {Array(shell.electrons)
            .fill(0)
            .map((_, electronIndex) => {
              const angle = (electronIndex / shell.electrons) * Math.PI * 2;
              return (
                <Sphere
                  key={electronIndex}
                  ref={(el) => {
                    if (!electronRefs.current[shellIndex]) {
                      electronRefs.current[shellIndex] = [];
                    }
                    electronRefs.current[shellIndex][electronIndex] = el;
                  }}
                  args={[0.1, 16, 16]}
                  position={[Math.cos(angle) * shell.radius, 0, Math.sin(angle) * shell.radius]}
                >
                  <primitive object={electronMaterial.clone()} attach="material" />
                </Sphere>
              );
            })}
        </group>
      ))}
    </group>
  );
}
