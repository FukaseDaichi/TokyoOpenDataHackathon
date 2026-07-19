'use client';

// 3Dヒーローの描画層。演出の「決定」はすべて timeline.ts / manifest.ts（純関数）が行い、
// ここは毎フレームその結果をthreeオブジェクトへ反映するだけに保つ。
// React stateの毎フレーム更新はせず、refとuseFrameのみで動かす。
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { GROUND_Y, HERO_CARDS, MAP_CENTER_Z } from './manifest';
import { cameraPose, scenePhases, cardPose, floatOffset, smoothstep } from './timeline';
import { createTextureStore } from './textures';
import { createCardMaterial } from './CardMaterial';
import { mulberry32 } from './rng';
import { QUALITY_SETTINGS, type QualityTier } from './quality';
import type { HudState } from './hud';

const BG_COLOR = '#1d140c';
const GOLD = '#c9a24a';

// 東京23区の隣接関係を地面に描く金のラインにする（HERO_CARDS = 区コード順のindex）
const EDGES: Array<[number, number]> = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 7], [2, 12], [2, 8],
  [3, 12], [3, 13], [3, 15], [4, 15], [4, 5], [5, 17], [5, 6], [6, 7], [6, 21],
  [7, 22], [8, 9], [8, 10], [9, 11], [9, 12], [10, 11], [11, 14], [13, 14],
  [14, 19], [15, 16], [15, 18], [16, 17], [16, 18], [17, 20], [18, 19],
  [20, 21], [21, 22],
];

function makeRadialSprite(inner: string, outer: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

interface SceneProps {
  progressRef: MutableRefObject<number>;
  hud: HudState;
  tier: Exclude<QualityTier, 'fallback'>;
  onSelectWard: (id: string) => void;
}

function SceneInner({ progressRef, hud, tier, onSelectWard }: SceneProps) {
  const settings = QUALITY_SETTINGS[tier];
  const { camera, size } = useThree();

  const groupRefs = useRef<Array<THREE.Group | null>>([]);
  const dustRef = useRef<THREE.Points>(null);
  const burstGoldRef = useRef<THREE.Points>(null);
  const burstPaperRef = useRef<THREE.Points>(null);
  const starsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const groundRef = useRef<THREE.Mesh>(null);

  const store = useMemo(() => createTextureStore(HERO_CARDS, settings.textureWidth), [settings.textureWidth]);
  const materials = useMemo(
    () => HERO_CARDS.map((card) => createCardMaterial(store.get(card.id), card.color, BG_COLOR)),
    [store],
  );

  useEffect(() => {
    store.startLoading((id, tex) => {
      const i = HERO_CARDS.findIndex((c) => c.id === id);
      if (i >= 0) materials[i].uniforms.uMap.value = tex;
    });
    return () => {
      store.dispose();
      materials.forEach((m) => m.dispose());
    };
  }, [store, materials]);

  const glowSprite = useMemo(() => makeRadialSprite('rgba(255,225,160,1)', 'rgba(255,225,160,0)'), []);
  const paperSprite = useMemo(() => makeRadialSprite('rgba(244,232,205,0.9)', 'rgba(244,232,205,0)'), []);

  // 金粉: 回廊全体に漂う（seed固定）
  const dustPositions = useMemo(() => {
    const rng = mulberry32(777);
    const arr = new Float32Array(settings.goldDust * 3);
    for (let i = 0; i < settings.goldDust; i++) {
      arr[i * 3] = (rng() - 0.5) * 30;
      arr[i * 3 + 1] = (rng() - 0.5) * 14 + 1;
      arr[i * 3 + 2] = 24 - rng() * 96;
    }
    return arr;
  }, [settings.goldDust]);

  // 開幕バースト: 紙片と金粉が手前へ流れる
  const burstGoldPositions = useMemo(() => {
    const rng = mulberry32(888);
    const n = tier === 'high' ? 200 : 70;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (rng() - 0.5) * 12;
      arr[i * 3 + 1] = (rng() - 0.5) * 7 + 0.5;
      arr[i * 3 + 2] = 2 + rng() * 22;
    }
    return arr;
  }, [tier]);
  const burstPaperPositions = useMemo(() => {
    const rng = mulberry32(999);
    const arr = new Float32Array(settings.paperBits * 3);
    for (let i = 0; i < settings.paperBits; i++) {
      arr[i * 3] = (rng() - 0.5) * 10;
      arr[i * 3 + 1] = (rng() - 0.5) * 6 + 0.5;
      arr[i * 3 + 2] = 4 + rng() * 20;
    }
    return arr;
  }, [settings.paperBits]);

  // 星屑（遠景ドーム）
  const starPositions = useMemo(() => {
    const rng = mulberry32(555);
    const n = 320;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (rng() - 0.5) * 160;
      arr[i * 3 + 1] = (rng() - 0.5) * 70 + 8;
      arr[i * 3 + 2] = -85 - rng() * 40;
    }
    return arr;
  }, []);

  // 隣接ライン（東京3Dマップの地面に描く道路網の見立て）
  const linePositions = useMemo(() => {
    const arr = new Float32Array(EDGES.length * 6);
    const yLine = GROUND_Y + 0.02;
    EDGES.forEach(([a, b], i) => {
      const pa = HERO_CARDS[a].map;
      const pb = HERO_CARDS[b].map;
      arr.set([pa.x, yLine, pa.z, pb.x, yLine, pb.z], i * 6);
    });
    return arr;
  }, []);

  // 雲レイヤー（多層パララックスの中景）
  const clouds = useMemo(
    () => [
      { pos: [-9, 3.5, -16] as const, scale: 11 },
      { pos: [8.5, -2, -32] as const, scale: 13 },
      { pos: [-7.5, 1.5, -48] as const, scale: 12 },
      { pos: [9, 4, -66] as const, scale: 15 },
    ],
    [],
  );

  const tmpVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = progressRef.current;
    const time = state.clock.elapsedTime;
    const aspect = size.width / size.height;
    const phases = scenePhases(t);
    const cam = cameraPose(t, aspect);
    const pointer = state.pointer;

    camera.position.set(cam.pos[0], cam.pos[1], cam.pos[2]);
    if (settings.mouseTilt) {
      camera.position.x += pointer.x * 0.3;
      camera.position.y += pointer.y * 0.18;
    }
    camera.lookAt(cam.look[0], cam.look[1], cam.look[2]);

    // 開幕は霧を絞って回廊を闇に沈め、チラ見せの2枚だけを浮かび上がらせる。
    // （開幕の暗さをDOMビネットでなくシーン内で作ることで、画面端のpeekカードが隠れない）
    const fogOpen = 1 - phases.vignette;
    const fogNear = 7 + (30 - 7) * fogOpen;
    const fogFar = 20 + (90 - 20) * fogOpen;
    const sceneFog = state.scene.fog as THREE.Fog | null;
    if (sceneFog) {
      sceneFog.near = fogNear;
      sceneFog.far = fogFar;
    }

    // 集結後は浮遊をほぼ止める（地面に立つカードが滑って見えないように）
    const floatFactor = 1 - phases.gather * 0.9;

    for (let i = 0; i < HERO_CARDS.length; i++) {
      const card = HERO_CARDS[i];
      const group = groupRefs.current[i];
      if (!group) continue;

      const pose = cardPose(card, t, aspect);
      const [fx, fy] = floatOffset(card, time, floatFactor);
      group.position.set(pose.pos[0] + fx, pose.pos[1] + fy, pose.pos[2]);

      // マウスに連動した弱いtilt（近いカードほど効く）
      const dz = camera.position.z - pose.pos[2];
      let tiltX = 0;
      let tiltY = 0;
      if (settings.mouseTilt) {
        const prox = Math.max(0, 1 - Math.abs(dz) / 9);
        tiltX = -pointer.y * 0.08 * prox;
        tiltY = pointer.x * 0.1 * prox;
      }
      group.rotation.set(tiltX, pose.rotY + tiltY, pose.rotZ);
      group.scale.setScalar(pose.scale);

      // 可視制御: 通過済み・遠すぎ・低ティアの最遠バンドは描かない
      // （集結では全員登場、t=0のチラ見せ中はバンドカットより優先）
      const inGather = phases.gather > 0.05;
      const behind = dz < -5;
      const tooFar = dz > 92;
      const bandCut = card.depthBand > settings.maxCorridorBand;
      group.visible = inGather || pose.peek > 0.01 || (!behind && !tooFar && !bandCut);

      const mat = materials[i];
      mat.uniforms.uFogNear.value = fogNear;
      mat.uniforms.uFogFar.value = fogFar;
      mat.uniforms.uSheen.value = pose.sheen;
      mat.uniforms.uSweep.value = -0.25 + 1.5 * ((time * 0.18 + card.floatPhase * 0.15) % 1);

      // 区名ラベルのスクリーン座標をHUDへ
      if (pose.labelOpacity > 0.01 && group.visible) {
        tmpVec.set(group.position.x, group.position.y - pose.scale * 1.6, group.position.z).project(camera);
        const behindCam = tmpVec.z > 1;
        const rawX = (tmpVec.x * 0.5 + 0.5) * size.width;
        const rawY = (-tmpVec.y * 0.5 + 0.5) * size.height;
        // ラベルは必ず画面内に収める（カードが近いと足元が画面外に出るため）
        const lx = Math.min(size.width * 0.92, Math.max(size.width * 0.08, rawX));
        const ly = Math.min(size.height * 0.84, Math.max(size.height * 0.06, rawY));
        // 集結シーンでクランプされたラベルは本来画面外＝端に溜まってCTAと重なるため消す
        const clamped = lx !== rawX || ly !== rawY;
        hud.labels[card.id] = {
          x: lx,
          y: ly,
          opacity: behindCam || (clamped && phases.gather > 0.3) ? 0 : pose.labelOpacity,
        };
      } else if (hud.labels[card.id]) {
        hud.labels[card.id].opacity = 0;
      }
    }

    // 金粉はゆっくり呼吸
    if (dustRef.current) {
      dustRef.current.position.y = Math.sin(time * 0.07) * 0.5;
      dustRef.current.rotation.z = Math.sin(time * 0.03) * 0.02;
      (dustRef.current.material as THREE.PointsMaterial).opacity = 0.65 * (1 - phases.vignette * 0.6);
    }

    // 開幕バースト: tから決定的に手前へ流れる（逆スクロールで巻き戻る）
    const burstProg = smoothstep(0.02, 0.2, t);
    for (const ref of [burstGoldRef, burstPaperRef]) {
      const pts = ref.current;
      if (!pts) continue;
      pts.position.z = burstProg * 26;
      pts.visible = phases.burst > 0.01;
      (pts.material as THREE.PointsMaterial).opacity =
        phases.burst * (ref === burstGoldRef ? 0.85 : 0.55);
    }

    if (starsRef.current) {
      (starsRef.current.material as THREE.PointsMaterial).opacity =
        0.35 + phases.gather * 0.45;
    }
    if (linesRef.current) {
      // 地面ラインは3Dマップ（横長）のみ。雛壇（縦長）では出さない
      linesRef.current.visible = phases.gather > 0.01 && aspect >= 1;
      (linesRef.current.material as THREE.LineBasicMaterial).opacity = phases.gather * 0.5;
    }
    if (groundRef.current) {
      groundRef.current.visible = phases.gather > 0.01 && aspect >= 1;
      (groundRef.current.material as THREE.MeshBasicMaterial).opacity = phases.gather * 0.34;
    }
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.12 + phases.gather * 0.22;
    }

    hud.t = t;
    hud.phases = phases;
  });

  return (
    <>
      <color attach="background" args={[BG_COLOR]} />
      <fog attach="fog" args={[BG_COLOR, 30, 90]} />

      {HERO_CARDS.map((card, i) => (
        <group
          key={card.id}
          ref={(g) => {
            groupRefs.current[i] = g;
          }}
        >
          {/* 額縁（金の縁取り） */}
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[2.16, 3.16]} />
            <meshBasicMaterial color={GOLD} />
          </mesh>
          {/* カード本体（2:3固定ジオメトリなので縦横比は崩れない） */}
          <mesh
            material={materials[i]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectWard(card.id);
            }}
            onPointerOver={() => {
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = '';
            }}
          >
            <planeGeometry args={[2, 3]} />
          </mesh>
        </group>
      ))}

      {/* 金粉 */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          map={glowSprite}
          color="#ffd98a"
          transparent
          opacity={0.65}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* 開幕バースト（金の光の筋） */}
      <points ref={burstGoldRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[burstGoldPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.3}
          map={glowSprite}
          color="#ffe9b0"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* 開幕バースト（紙片） */}
      <points ref={burstPaperRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[burstPaperPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.42}
          map={paperSprite}
          color="#f4e8d0"
          transparent
          opacity={0}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* 星屑ドーム */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          map={glowSprite}
          color="#fff3d6"
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* 東京3Dマップの地面（淡い金のグロー床） */}
      <mesh ref={groundRef} visible={false} rotation-x={-Math.PI / 2} position={[0, GROUND_Y, MAP_CENTER_Z]}>
        <planeGeometry args={[70, 44]} />
        <meshBasicMaterial
          map={glowSprite}
          color="#8a6a35"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 隣接ライン（地面に描く金色の道路網） */}
      <lineSegments ref={linesRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={GOLD} transparent opacity={0} depthWrite={false} />
      </lineSegments>

      {/* 最終シーンの背光 */}
      <mesh ref={glowRef} position={[0, 1, -78]}>
        <planeGeometry args={[130, 80]} />
        <meshBasicMaterial
          map={glowSprite}
          color="#8a6a35"
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 雲レイヤー */}
      {clouds.map((c, i) => (
        <mesh key={i} position={[c.pos[0], c.pos[1], c.pos[2]]}>
          <planeGeometry args={[c.scale, c.scale * 0.55]} />
          <meshBasicMaterial
            map={paperSprite}
            color="#d8c49a"
            transparent
            opacity={0.14}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

export default function HeroCanvas(props: SceneProps) {
  const settings = QUALITY_SETTINGS[props.tier];
  return (
    <Canvas
      dpr={[1, settings.dprMax]}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: 50, near: 0.1, far: 160, position: [0, 0.5, 34] }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <SceneInner {...props} />
    </Canvas>
  );
}
