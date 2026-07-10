// SSRカード用シェーダ。
// - ベーステクスチャ + 斜めに走るホログラム光沢（スイープ帯 × エッジマスク × 虹色）
// - 中央のイラストは白飛びさせず、縁と帯の交差部分だけ輝かせる
// - ShaderMaterialはscene.fogを受けないため、距離フォグを自前で計算する
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying float vViewZ;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewZ = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uSheen;
  uniform float uSweep;
  uniform vec3 uTint;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec2 vUv;
  varying float vViewZ;

  void main() {
    vec4 base = texture2D(uMap, vUv);

    // 斜めスイープ帯
    float d = vUv.x * 0.6 + vUv.y * 0.4;
    float band = smoothstep(0.18, 0.0, abs(d - uSweep));

    // エッジマスク: 中央を守る（縁85% / 中央15%）
    vec2 c = abs(vUv - 0.5) * 2.0;
    float edge = smoothstep(0.55, 1.0, max(c.x, c.y));
    float mask = band * (edge * 0.85 + 0.15);

    // 虹色ランプ（金寄りに寄せる）
    vec3 iri = 0.5 + 0.5 * cos(6.2831 * (d * 1.5 + uSweep) + vec3(0.0, 2.09, 4.19));
    vec3 sheenCol = mix(iri, uTint, 0.35);

    vec3 col = base.rgb + sheenCol * mask * uSheen * 0.55;

    float fogF = smoothstep(uFogNear, uFogFar, vViewZ);
    col = mix(col, uFogColor, fogF);
    float alpha = base.a * (1.0 - fogF * 0.35);
    gl_FragColor = vec4(col, alpha);
  }
`;

export interface CardUniforms {
  uMap: { value: THREE.Texture };
  uSheen: { value: number };
  uSweep: { value: number };
  uTint: { value: THREE.Color };
  uFogColor: { value: THREE.Color };
  uFogNear: { value: number };
  uFogFar: { value: number };
}

export function createCardMaterial(map: THREE.Texture, tint: string, fogColor: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: map },
      uSheen: { value: 0.12 },
      uSweep: { value: 0 },
      uTint: { value: new THREE.Color(tint) },
      uFogColor: { value: new THREE.Color(fogColor) },
      uFogNear: { value: 28 },
      uFogFar: { value: 85 },
    } satisfies CardUniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
  });
}
