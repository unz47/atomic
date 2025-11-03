import { noiseHelpers } from './noise.glsl';

// 陽子用の頂点シェーダー
export const protonVertexShader = `
  varying vec3 vNormal;      // 法線ベクトル
  varying vec3 vPosition;    // 頂点位置
  varying vec2 vUv;          // UV座標

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 陽子用のフラグメントシェーダー（太陽の表面のような効果）
export const protonFragmentShader = `
  uniform float time;        // 時間
  uniform vec3 color1;       // 明るい色（オレンジ）
  uniform vec3 color2;       // 中間の色（赤）
  uniform vec3 color3;       // 暗い色（暗い赤）
  varying vec3 vNormal;      // 法線ベクトル
  varying vec3 vPosition;    // 頂点位置
  varying vec2 vUv;          // UV座標

  ${noiseHelpers}

  void main() {
    // 複数のノイズレイヤーで太陽の表面のような効果
    vec3 pos = vPosition * 3.0;
    float noise1 = snoise(pos + time * 0.5);
    float noise2 = snoise(pos * 2.0 - time * 0.3);
    float noise3 = snoise(pos * 4.0 + time * 0.7);

    // ノイズを組み合わせて複雑な模様を作る
    float pattern = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
    pattern = pattern * 0.5 + 0.5; // 0.0-1.0に正規化

    // 3色のグラデーション
    vec3 color;
    if (pattern < 0.4) {
      color = mix(color3, color2, pattern / 0.4);
    } else {
      color = mix(color2, color1, (pattern - 0.4) / 0.6);
    }

    // ライティング効果を追加
    vec3 light = normalize(vec3(1.0, 1.0, 1.0));
    float dProd = max(0.3, dot(vNormal, light));

    // 発光効果を追加
    float glow = pattern * 0.3 + 0.7;

    gl_FragColor = vec4(color * dProd * glow, 1.0);
  }
`;
