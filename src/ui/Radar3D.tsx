'use client';

// 魔法陣ホログラム3Dレーダー。座標の決定は radar3dGeometry.ts（純関数）が行い、
// ここはthreeオブジェクトへの反映と入力（ドラッグ回転）だけを担う。
// 毎フレームのReact state更新はせず、refとuseFrameのみで動かす。
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, type MutableRefObject, type PointerEvent } from 'react';
import { AXIS_KEYS, AXIS_LABELS, type AxisKey, type AxisVector } from '../domain/axes';
import { axisPoint, labelPoint, ringPoints } from '../lib/radar3dGeometry';
import { mulberry32 } from '../hero/rng';

const N = AXIS_KEYS.length;
const R = 1.5; // 最大半径（value=+1）
const POLY_Y = 0.52; // ポリゴン浮遊高さ
const POLY_H = 0.09; // ポリゴンの厚み
const LABEL_Y = 0.98;
const LABEL_SCALE = 1.34;
const AUTO_SPEED = (Math.PI * 2) / 14; // 自動回転 約14秒/周
const GOLD = '#d4b060';
const GOLD_DEEP = '#b8923f';
const PARTICLE_COUNT = 60;

/** 差し替え用アセット。public/ に置けば自動でプロシージャル魔法陣から置き換わる */
const MAGIC_CIRCLE_URL = '/magic-circle.png';

interface Spin {
  rot: number;
  vel: number;
  dragging: boolean;
  lastX: number;
  lastT: number;
}

function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,236,180,1)');
  g.addColorStop(1, 'rgba(255,236,180,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** プロシージャル魔法陣（金の線画・透過）。生成画像が届くまでの既定テクスチャ */
function makeMagicCircleTexture(): THREE.CanvasTexture {
  const S = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d')!;
  ctx.translate(S / 2, S / 2);
  const line = (alpha: number, width: number) => {
    ctx.strokeStyle = `rgba(216,180,95,${alpha})`;
    ctx.lineWidth = width;
  };

  // 中心の淡い光だまり
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 470);
  glow.addColorStop(0, 'rgba(230,195,110,0.16)');
  glow.addColorStop(0.75, 'rgba(230,195,110,0.05)');
  glow.addColorStop(1, 'rgba(230,195,110,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 470, 0, Math.PI * 2);
  ctx.fill();

  // 外周の二重リング
  line(0.95, 5);
  ctx.beginPath();
  ctx.arc(0, 0, 486, 0, Math.PI * 2);
  ctx.stroke();
  line(0.7, 2);
  ctx.beginPath();
  ctx.arc(0, 0, 458, 0, Math.PI * 2);
  ctx.stroke();

  // 外周の目盛り（72本）
  line(0.65, 2);
  for (let i = 0; i < 72; i++) {
    const a = (Math.PI * 2 * i) / 72;
    const r1 = i % 6 === 0 ? 430 : 444;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
    ctx.lineTo(Math.cos(a) * 456, Math.sin(a) * 456);
    ctx.stroke();
  }

  // 中間の破線リング
  line(0.55, 2.5);
  ctx.setLineDash([26, 14]);
  ctx.beginPath();
  ctx.arc(0, 0, 360, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 五芒星（頂点を上に）
  const starPt = (i: number, r: number): [number, number] => {
    const a = -Math.PI / 2 + (Math.PI * 2 * i) / 5;
    return [Math.cos(a) * r, Math.sin(a) * r];
  };
  line(0.75, 3);
  ctx.beginPath();
  for (let i = 0; i <= 5; i++) {
    const [x, y] = starPt((i * 2) % 5, 330);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // 五角形
  line(0.5, 2);
  ctx.beginPath();
  for (let i = 0; i <= 5; i++) {
    const [x, y] = starPt(i % 5, 330);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 頂点の小円
  for (let i = 0; i < 5; i++) {
    const [x, y] = starPt(i, 330);
    line(0.8, 3);
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(216,180,95,0.35)';
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // 内周リング
  line(0.7, 3);
  ctx.beginPath();
  ctx.arc(0, 0, 128, 0, Math.PI * 2);
  ctx.stroke();
  line(0.45, 1.5);
  ctx.beginPath();
  ctx.arc(0, 0, 104, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** 「賑わい 3位」の羊皮紙チップ風スプライトテクスチャ */
function makeLabelTexture(name: string, rank: number): { tex: THREE.CanvasTexture; aspect: number } {
  const H = 128;
  const pad = 40;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d')!;
  const nameFont = '600 52px "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif';
  const rankFont = '800 62px "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif';
  const suffixFont = '600 40px "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif';
  ctx.font = nameFont;
  const nameW = ctx.measureText(name).width;
  ctx.font = rankFont;
  const rankW = ctx.measureText(String(rank)).width;
  ctx.font = suffixFont;
  const suffixW = ctx.measureText('位').width;
  const gap = 22;
  const W = Math.ceil(pad * 2 + nameW + gap + rankW + 6 + suffixW);
  c.width = W;
  c.height = H;

  // チップ本体（角丸・羊皮紙・金縁）
  const r = H / 2 - 6;
  ctx.beginPath();
  ctx.roundRect(6, 6, W - 12, H - 12, r);
  ctx.fillStyle = 'rgba(255,248,230,0.94)';
  ctx.fill();
  ctx.strokeStyle = GOLD_DEEP;
  ctx.lineWidth = 5;
  ctx.stroke();

  let x = pad;
  const baseline = H / 2;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#4a3418';
  ctx.font = nameFont;
  ctx.fillText(name, x, baseline + 2);
  x += nameW + gap;
  ctx.fillStyle = '#a06a1e';
  ctx.font = rankFont;
  ctx.fillText(String(rank), x, baseline + 2);
  x += rankW + 6;
  ctx.fillStyle = '#6a4f26';
  ctx.font = suffixFont;
  ctx.fillText('位', x, baseline + 8);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { tex, aspect: W / H };
}

function easeOutCubic(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

interface SceneProps {
  vector: AxisVector;
  ranks: Record<AxisKey, number>;
  color: string;
  spin: MutableRefObject<Spin>;
  onReady?: () => void;
}

function Scene({ vector, ranks, color, spin, onReady }: SceneProps) {
  const group = useRef<THREE.Group>(null); // ドラッグ・自動回転するホログラム全体
  const polyGroup = useRef<THREE.Group>(null); // 召喚アニメで浮上するポリゴン層
  const circleRef = useRef<THREE.Mesh>(null);
  const circleMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const polyMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const edgeMatRef = useRef<THREE.LineBasicMaterial>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const startRef = useRef<number | null>(null);

  // ポリゴン頂点（床平面での位置。高さはpolyGroupが持つ）
  const vertices = useMemo(
    () => AXIS_KEYS.map((k, i) => axisPoint(i, N, vector[k], R, 0)),
    [vector],
  );

  // 性格ポリゴン（厚み付き）とその縁
  const polyGeom = useMemo(() => {
    const shape = new THREE.Shape();
    vertices.forEach(([x, , z], i) => {
      // rotateX(-90°)で (x, y, z) → (x, z, -y) になるため、shapeのyには -z を渡す
      if (i === 0) shape.moveTo(x, -z);
      else shape.lineTo(x, -z);
    });
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: POLY_H, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [vertices]);
  const edgeGeom = useMemo(() => new THREE.EdgesGeometry(polyGeom), [polyGeom]);
  useEffect(
    () => () => {
      polyGeom.dispose();
      edgeGeom.dispose();
    },
    [polyGeom, edgeGeom],
  );

  // 目盛りリング（+1 / 0 / -0.5）とスポーク
  const ringGeoms = useMemo(
    () =>
      [
        { v: 1, opacity: 0.6 },
        { v: 0, opacity: 0.3 },
        { v: -0.5, opacity: 0.2 },
      ].map(({ v, opacity }) => ({
        positions: new Float32Array(ringPoints(N, v, R, 0.02).flat()),
        opacity,
      })),
    [],
  );
  const spokePositions = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < N; i++) {
      const [x, , z] = axisPoint(i, N, 1, R, 0);
      arr.push(0, 0.02, 0, x, 0.02, z);
    }
    return new Float32Array(arr);
  }, []);

  // テクスチャ
  const glowTex = useMemo(() => makeGlowTexture(), []);
  const circleFallback = useMemo(() => makeMagicCircleTexture(), []);
  const labels = useMemo(
    () =>
      AXIS_KEYS.map((k, i) => ({
        ...makeLabelTexture(AXIS_LABELS[k].name, ranks[k]),
        pos: labelPoint(i, N, R, LABEL_Y, LABEL_SCALE),
      })),
    [ranks],
  );
  useEffect(
    () => () => {
      glowTex.dispose();
      circleFallback.dispose();
      labels.forEach((l) => l.tex.dispose());
    },
    [glowTex, circleFallback, labels],
  );

  // 生成アセットがあれば魔法陣を差し替え（無ければプロシージャルのまま）
  useEffect(() => {
    let disposed = false;
    let loaded: THREE.Texture | null = null;
    new THREE.TextureLoader().load(
      MAGIC_CIRCLE_URL,
      (tex) => {
        if (disposed) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        loaded = tex;
        if (circleMatRef.current) {
          circleMatRef.current.map = tex;
          circleMatRef.current.needsUpdate = true;
        }
      },
      undefined,
      () => {},
    );
    return () => {
      disposed = true;
      loaded?.dispose();
    };
  }, []);

  // 頂点から立ち昇る光の粒（seed固定）
  const particleSeed = useMemo(() => {
    const rng = mulberry32(2323);
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      vertex: i % N,
      offX: (rng() - 0.5) * 0.24,
      offZ: (rng() - 0.5) * 0.24,
      phase: rng(),
      speed: 0.24 + rng() * 0.3,
    }));
  }, []);
  const particlePositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);

  useEffect(() => {
    onReady?.();
    // onReadyは初回マウント通知のみ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    if (startRef.current === null) startRef.current = t;
    const e = easeOutCubic(Math.min(1, (t - startRef.current) / 0.9));

    // 回転: ドラッグ中はハンドラがrotを進め、離すと慣性→自動回転へ収束
    const s = spin.current;
    if (!s.dragging) {
      s.vel += (AUTO_SPEED - s.vel) * Math.min(1, delta * 1.4);
      s.rot += s.vel * delta;
    }
    if (group.current) group.current.rotation.y = s.rot;

    // 魔法陣: 逆回転＋発光の脈動
    if (circleRef.current) circleRef.current.rotation.z = t * 0.1;
    if (circleMatRef.current) circleMatRef.current.opacity = (0.72 + 0.18 * Math.sin(t * 1.7)) * e;

    // ポリゴン召喚: 魔法陣から浮上＋ゆらぎ
    if (polyGroup.current) {
      polyGroup.current.position.y = POLY_Y * e + Math.sin(t * 1.15) * 0.05 * e;
      const sc = 0.45 + 0.55 * e;
      polyGroup.current.scale.set(sc, 1, sc);
    }
    if (polyMatRef.current) polyMatRef.current.opacity = 0.4 * e;
    if (edgeMatRef.current) edgeMatRef.current.opacity = 0.95 * e;

    // 粒子: 頂点上空へ立ち昇りループ
    if (particlesRef.current) {
      const baseY = polyGroup.current?.position.y ?? POLY_Y;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particleSeed[i];
        const [vx, , vz] = vertices[p.vertex];
        const rise = (p.phase + t * p.speed) % 1;
        particlePositions[i * 3] = vx + p.offX + Math.sin(t * 1.3 + i) * 0.03;
        particlePositions[i * 3 + 1] = baseY + POLY_H + rise * 0.85;
        particlePositions[i * 3 + 2] = vz + p.offZ;
      }
      const attr = particlesRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      attr.needsUpdate = true;
      (particlesRef.current.material as THREE.PointsMaterial).opacity = 0.75 * e;
    }
  });

  return (
    <>
      <group ref={group}>
        {/* 魔法陣（床） */}
        <mesh ref={circleRef} rotation-x={-Math.PI / 2} position={[0, 0.005, 0]}>
          <planeGeometry args={[R * 2.55, R * 2.55]} />
          <meshBasicMaterial
            ref={circleMatRef}
            map={circleFallback}
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 目盛りリング */}
        {ringGeoms.map((ring, i) => (
          <line key={i}>
            {/* eslint-disable-next-line react/no-unknown-property */}
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[ring.positions, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color={GOLD} transparent opacity={ring.opacity} depthWrite={false} />
          </line>
        ))}
        {/* スポーク */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[spokePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={GOLD} transparent opacity={0.22} depthWrite={false} />
        </lineSegments>

        {/* 性格ポリゴン（浮遊ホログラム） */}
        <group ref={polyGroup} position={[0, 0, 0]}>
          <mesh geometry={polyGeom}>
            <meshBasicMaterial
              ref={polyMatRef}
              color={color}
              transparent
              opacity={0}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <lineSegments geometry={edgeGeom}>
            <lineBasicMaterial ref={edgeMatRef} color="#ffe9b0" transparent opacity={0} depthWrite={false} />
          </lineSegments>
          {/* 頂点の光球 */}
          {vertices.map(([x, , z], i) => (
            <sprite key={i} position={[x, POLY_H + 0.02, z]} scale={[0.2, 0.2, 1]}>
              <spriteMaterial
                map={glowTex}
                color="#ffe9b0"
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
          ))}
        </group>

        {/* 軸ラベル（ビルボード: スプライトは常にカメラ目線） */}
        {labels.map((l, i) => (
          <sprite key={i} position={l.pos} scale={[0.36 * l.aspect, 0.36, 1]}>
            <spriteMaterial map={l.tex} transparent depthWrite={false} />
          </sprite>
        ))}

        {/* 光の粒 */}
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.09}
            map={glowTex}
            color="#ffe9b0"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
          />
        </points>
      </group>
    </>
  );
}

export interface Radar3DProps {
  vector: AxisVector;
  ranks: Record<AxisKey, number>;
  /** ポリゴンの色（区のテーマカラー）。既定は金インク */
  color?: string;
  onReady?: () => void;
}

/** 魔法陣ホログラム3Dレーダー。自動回転＋ドラッグ/スワイプで回せる */
export function Radar3D({ vector, ranks, color = GOLD_DEEP, onReady }: Radar3DProps) {
  const spin = useRef<Spin>({ rot: 0, vel: AUTO_SPEED, dragging: false, lastX: 0, lastT: 0 });

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const s = spin.current;
    s.dragging = true;
    s.lastX = e.clientX;
    s.lastT = performance.now();
    s.vel = 0;
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = spin.current;
    if (!s.dragging) return;
    const now = performance.now();
    const dx = e.clientX - s.lastX;
    const dRot = dx * 0.009;
    s.rot += dRot;
    const dt = Math.max(now - s.lastT, 1) / 1000;
    s.vel = THREE.MathUtils.clamp(dRot / dt, -4, 4);
    s.lastX = e.clientX;
    s.lastT = now;
  };
  const endDrag = () => {
    spin.current.dragging = false;
  };

  return (
    <div
      className="radar3d"
      role="img"
      aria-label={`性格レーダー: ${AXIS_KEYS.map((k) => `${AXIS_LABELS[k].name}${vector[k].toFixed(2)}（23区中${ranks[k]}位）`).join('、')}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 38, near: 0.1, far: 30, position: [0, 2.75, 4.5] }}
        onCreated={({ camera }) => camera.lookAt(0, 0.42, 0)}
      >
        <Scene vector={vector} ranks={ranks} color={color} spin={spin} onReady={onReady} />
      </Canvas>
    </div>
  );
}

export default Radar3D;
