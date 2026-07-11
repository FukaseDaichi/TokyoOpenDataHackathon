'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { loadWardGeo, type WardGeo } from '../data/geo';
import { wardTheme } from './wardTheme';
import type { QualityTier } from '../hero/quality';

const BASE_DEPTH = 0.12; // 通常区の厚み(km相当の scene 単位)
const TARGET_DEPTH = 0.9; // 当該区の厚み
const PARCHMENT = '#e9d9b4'; // 通常区の面
const GOLD = '#b8923f';

function wardShapes(w: WardGeo): THREE.Shape[] {
  return w.rings.map((ring) => {
    const shape = new THREE.Shape();
    ring.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
    shape.closePath();
    return shape;
  });
}

function WardMesh({ ward, selected }: { ward: WardGeo; selected: boolean }) {
  const color = selected ? wardTheme(ward.code).color : PARCHMENT;
  const geom = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(wardShapes(ward), {
      depth: selected ? TARGET_DEPTH : BASE_DEPTH,
      bevelEnabled: false,
    });
    return g;
  }, [ward, selected]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geom, 30), [geom]);
  return (
    <group>
      <mesh geometry={geom}>
        <meshStandardMaterial
          color={color}
          emissive={selected ? wardTheme(ward.code).color : '#000000'}
          emissiveIntensity={selected ? 0.35 : 0}
          roughness={0.85}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={GOLD} transparent opacity={selected ? 0.9 : 0.5} />
      </lineSegments>
    </group>
  );
}

function Pin({ ward }: { ward: WardGeo }) {
  const [cx, cy] = ward.center;
  const color = wardTheme(ward.code).color;
  return (
    <group position={[cx, cy, TARGET_DEPTH]}>
      <mesh position={[0, 0, 0.55]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.16, 0.5, 12]} />
        <meshStandardMaterial color="#4a3418" />
      </mesh>
    </group>
  );
}

function Scene({ code }: { code: string }) {
  const all = loadWardGeo();
  const target = all.find((w) => w.code === code)!;
  const group = useRef<THREE.Group>(null);
  // 23区の重心平均を原点に寄せて回転中心にする
  const offset = useMemo<[number, number]>(() => {
    const xs = all.map((w) => w.center[0]);
    const ys = all.map((w) => w.center[1]);
    return [-(Math.min(...xs) + Math.max(...xs)) / 2, -(Math.min(...ys) + Math.max(...ys)) / 2];
  }, [all]);

  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.12) * 0.16;
  });

  return (
    <group rotation={[-Math.PI / 2.6, 0, 0]}>
      <group ref={group}>
        <group position={[offset[0], offset[1], 0]}>
          {all.map((w) => (
            <WardMesh key={w.code} ward={w} selected={w.code === code} />
          ))}
          <Pin ward={target} />
        </group>
      </group>
      <ambientLight intensity={0.9} />
      <directionalLight position={[8, 12, 20]} intensity={1.1} />
    </group>
  );
}

export default function WardMap3D({ code, tier }: { code: string; tier: Exclude<QualityTier, 'fallback'> }) {
  return (
    <Canvas
      dpr={[1, tier === 'high' ? 1.5 : 1.2]}
      camera={{ position: [0, 16, 30], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene code={code} />
    </Canvas>
  );
}
