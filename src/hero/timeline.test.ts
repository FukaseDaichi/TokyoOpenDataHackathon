import { describe, it, expect } from 'vitest';
import { cameraPose, scenePhases, cardPose, floatOffset } from './timeline';
import { HERO_CARDS } from './manifest';

const finite = (xs: number[]) => xs.every((x) => Number.isFinite(x));

describe('cameraPose', () => {
  it('is deterministic (same t -> identical pose, so reverse scroll replays exactly)', () => {
    for (const t of [0, 0.123, 0.5, 0.87, 1]) {
      expect(cameraPose(t)).toEqual(cameraPose(t));
    }
  });

  it('moves monotonically forward (z decreasing) through the corridor (0.15..0.8)', () => {
    let prev = cameraPose(0.15).pos[2];
    for (let t = 0.16; t <= 0.8; t += 0.01) {
      const z = cameraPose(t).pos[2];
      expect(z).toBeLessThan(prev);
      prev = z;
    }
  });

  it('stays finite and clamps outside [0,1]', () => {
    for (const t of [-0.5, 0, 0.5, 1, 1.5]) {
      const c = cameraPose(t);
      expect(finite([...c.pos, ...c.look])).toBe(true);
    }
    expect(cameraPose(-1)).toEqual(cameraPose(0));
    expect(cameraPose(2)).toEqual(cameraPose(1));
  });

  it('weaves laterally (an S-curve, not a straight line)', () => {
    const xs: number[] = [];
    for (let t = 0.15; t <= 0.8; t += 0.01) xs.push(cameraPose(t).pos[0]);
    expect(Math.max(...xs)).toBeGreaterThan(1.5);
    expect(Math.min(...xs)).toBeLessThan(-1.5);
  });

  it('ends high above the map looking down on landscape screens', () => {
    const c = cameraPose(1, 16 / 9);
    expect(c.pos[1]).toBeGreaterThan(5);
    expect(c.look[1]).toBeLessThan(c.pos[1]);
  });

  it('stays near eye level for the portrait podium', () => {
    const c = cameraPose(1, 0.5);
    expect(c.pos[1]).toBeLessThan(3);
  });
});

describe('scenePhases', () => {
  it('shows the title at start and hides it in the corridor', () => {
    expect(scenePhases(0).title).toBe(1);
    expect(scenePhases(0.3).title).toBe(0);
  });

  it('keeps the CTA hidden mid-scroll and fully visible at the end', () => {
    expect(scenePhases(0.5).cta).toBe(0);
    expect(scenePhases(0.85).cta).toBe(0);
    expect(scenePhases(1).cta).toBe(1);
  });

  it('locks the gathering between 0.8 and 0.95', () => {
    expect(scenePhases(0.8).gather).toBe(0);
    expect(scenePhases(0.95).gather).toBe(1);
  });

  it('fires the opening burst only near the start', () => {
    expect(scenePhases(0.05).burst).toBeGreaterThan(0);
    expect(scenePhases(0.5).burst).toBe(0);
  });
});

describe('cardPose', () => {
  it('is deterministic for every card', () => {
    for (const card of HERO_CARDS) {
      expect(cardPose(card, 0.42)).toEqual(cardPose(card, 0.42));
    }
  });

  it('is finite across the whole timeline for all 23 cards', () => {
    for (let t = 0; t <= 1.0001; t += 0.02) {
      for (const card of HERO_CARDS) {
        const p = cardPose(card, t);
        expect(finite([...p.pos, p.rotY, p.rotZ, p.scale, p.sheen, p.labelOpacity])).toBe(true);
      }
    }
  });

  it('lands every card on its Tokyo-map slot at t=1 on landscape screens', () => {
    for (const card of HERO_CARDS) {
      const p = cardPose(card, 1, 16 / 9);
      expect(Math.abs(p.pos[0] - card.map.x)).toBeLessThan(0.05);
      expect(Math.abs(p.pos[1] - card.map.y)).toBeLessThan(0.05);
      expect(Math.abs(p.pos[2] - card.map.z)).toBeLessThan(0.05);
      expect(Math.abs(p.scale - card.map.scale)).toBeLessThan(0.05);
      expect(Math.abs(p.rotZ)).toBeLessThan(0.02);
      expect(p.labelOpacity).toBeGreaterThan(0.5);
    }
  });

  it('lands every card on its podium tier at t=1 on portrait screens, labels hidden', () => {
    for (const card of HERO_CARDS) {
      const p = cardPose(card, 1, 0.5);
      expect(Math.abs(p.pos[0] - card.podium.x)).toBeLessThan(0.05);
      expect(Math.abs(p.pos[1] - card.podium.y)).toBeLessThan(0.05);
      expect(Math.abs(p.pos[2] - card.podium.z)).toBeLessThan(0.05);
      expect(Math.abs(p.scale - card.podium.scale)).toBeLessThan(0.05);
      expect(p.labelOpacity).toBeLessThan(0.05);
    }
  });

  it('raises sheen when a closeup card approaches the camera', () => {
    const card = HERO_CARDS.find((c) => c.closeupAt !== null)!;
    const atPeak = cardPose(card, card.closeupAt!);
    const far = cardPose(card, Math.max(0.16, card.closeupAt! - 0.2));
    expect(atPeak.sheen).toBeGreaterThan(far.sheen);
    expect(atPeak.labelOpacity).toBeGreaterThan(0.5);
  });
});

// HeroCanvasのPerspectiveCamera(fov=50)と同じ投影でNDC座標を求める
function projectToNdc(
  p: [number, number, number],
  cam: { pos: [number, number, number]; look: [number, number, number] },
  aspect: number,
): { x: number; y: number } {
  const sub = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const norm = (v: number[]) => {
    const l = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  const cross = (a: number[], b: number[]) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const zAxis = norm(sub(cam.pos, cam.look));
  const xAxis = norm(cross([0, 1, 0], zAxis));
  const yAxis = cross(zAxis, xAxis);
  const d = sub(p, cam.pos);
  const cx = d[0] * xAxis[0] + d[1] * xAxis[1] + d[2] * xAxis[2];
  const cy = d[0] * yAxis[0] + d[1] * yAxis[1] + d[2] * yAxis[2];
  const cz = d[0] * zAxis[0] + d[1] * zAxis[1] + d[2] * zAxis[2];
  const f = 1 / Math.tan((50 * Math.PI) / 180 / 2);
  return { x: ((f / aspect) * cx) / -cz, y: (f * cy) / -cz };
}

describe('final scene framing (every card fully inside the viewport)', () => {
  const check = (aspect: number) => {
    const cam = cameraPose(1, aspect);
    for (const card of HERO_CARDS) {
      const p = cardPose(card, 1, aspect);
      // カードの四隅（幅2s×高さ3s、rotY=0）を投影して画面内を確認
      for (const [dx, dy] of [[-1, -1.5], [1, -1.5], [-1, 1.5], [1, 1.5]] as const) {
        const ndc = projectToNdc(
          [p.pos[0] + dx * p.scale, p.pos[1] + dy * p.scale, p.pos[2]],
          cam,
          aspect,
        );
        expect(Math.abs(ndc.x), `${card.name} x aspect=${aspect}`).toBeLessThan(1);
        expect(Math.abs(ndc.y), `${card.name} y aspect=${aspect}`).toBeLessThan(1);
      }
    }
  };

  it('fits the Tokyo map on landscape screens (16:9 and 4:3)', () => {
    check(16 / 9);
    check(4 / 3);
  });

  it('fits the podium on portrait phones (tall and short)', () => {
    check(375 / 812);
    check(375 / 667);
  });
});

describe('peek cards (t=0 first-view teaser)', () => {
  const peekCards = HERO_CARDS.filter((c) => c.peek !== null);

  it('has exactly two peek cards on opposite sides', () => {
    expect(peekCards).toHaveLength(2);
    expect(peekCards.map((c) => c.peek!.side).sort()).toEqual([-1, 1]);
  });

  it('floats peek cards near the screen edges in front of the camera at t=0', () => {
    for (const aspect of [16 / 9, 375 / 812]) {
      const cam = cameraPose(0, aspect);
      for (const card of peekCards) {
        const p = cardPose(card, 0, aspect);
        expect(p.peek).toBe(1);
        // カメラ前方の近距離（回廊の定位置ではない）
        const dz = cam.pos[2] - p.pos[2];
        expect(dz).toBeGreaterThan(2.5);
        expect(dz).toBeLessThan(9);
        // 左右の画面端: NDCのxが端寄り（中央を塞がない）で符号が side と一致
        const ndc = projectToNdc(p.pos, cam, aspect);
        expect(Math.sign(ndc.x), `${card.name} aspect=${aspect}`).toBe(card.peek!.side);
        expect(Math.abs(ndc.x), `${card.name} aspect=${aspect}`).toBeGreaterThan(0.45);
        // カードの内側の縁は必ず画面内（完全に見切れない）
        const inner = projectToNdc(
          [p.pos[0] - card.peek!.side * p.scale, p.pos[1], p.pos[2]],
          cam,
          aspect,
        );
        expect(Math.abs(inner.x), `${card.name} inner aspect=${aspect}`).toBeLessThan(0.97);
      }
    }
  });

  it('boosts sheen while peeking', () => {
    for (const card of peekCards) {
      expect(cardPose(card, 0).sheen).toBeGreaterThan(0.4);
    }
  });

  it('matches normal corridor behavior once scrolling passes the blend window', () => {
    for (const card of peekCards) {
      const plain = { ...card, peek: null };
      for (const t of [0.1, 0.3, card.closeupAt!, 1]) {
        const withPeek = cardPose(card, t, 16 / 9);
        expect(withPeek.peek).toBe(0);
        expect(withPeek).toEqual(cardPose(plain, t, 16 / 9));
      }
    }
  });

  it('leaves non-peek cards untouched at t=0', () => {
    for (const card of HERO_CARDS.filter((c) => c.peek === null)) {
      const p = cardPose(card, 0);
      expect(p.peek).toBe(0);
      expect(p.pos[0]).toBeCloseTo(card.corridor.x, 5);
      expect(p.pos[2]).toBeCloseTo(card.corridor.z, 5);
    }
  });
});

describe('floatOffset', () => {
  it('is a pure function of time and phase (no hidden state)', () => {
    const card = HERO_CARDS[0];
    expect(floatOffset(card, 12.5, 1)).toEqual(floatOffset(card, 12.5, 1));
  });

  it('is zero when the motion factor is zero (reduced motion)', () => {
    const [dx, dy] = floatOffset(HERO_CARDS[3], 99.9, 0);
    expect(dx).toBe(0);
    expect(dy).toBe(0);
  });

  it('differs between cards at the same time (phase variety)', () => {
    const a = floatOffset(HERO_CARDS[0], 5, 1);
    const b = floatOffset(HERO_CARDS[1], 5, 1);
    expect(a).not.toEqual(b);
  });
});
