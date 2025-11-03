import { noiseHelpers } from './noise.glsl';

// 電子用の頂点シェーダー
export const electronVertexShader = `
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

// 電子用のフラグメントシェーダー（水面のような効果）
export const electronFragmentShader = `
  uniform float time;        // 時間
  uniform vec3 color1;       // 明るい色（明るい青）
  uniform vec3 color2;       // 中間の色（青）
  uniform vec3 color3;       // 暗い色（暗い青）
  varying vec3 vNormal;      // 法線ベクトル
  varying vec3 vPosition;    // 頂点位置
  varying vec2 vUv;          // UV座標

  ${noiseHelpers}

  void main() {
    // 複数のノイズレイヤーで水面のような効果
    vec3 pos = vPosition * 4.0;
    float noise1 = snoise(pos + time * 0.8);
    float noise2 = snoise(pos * 2.5 - time * 0.5);
    float noise3 = snoise(pos * 5.0 + time * 1.2);

    // ノイズを組み合わせて水の波のような模様を作る
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

    // 反射効果を追加（水面のキラキラ感）
    float shimmer = pattern * 0.4 + 0.6;

    gl_FragColor = vec4(color * dProd * shimmer, 1.0);
  }
`;
