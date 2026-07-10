// テクスチャ管理層。
// - 全23枚は即座に「絵本風プレースホルダー」(Canvas 2D生成)で表示を開始し、
//   実画像13枚を優先度順（クローズアップ→近景→遠景）に非同期ロードして差し替える。
// - 原寸PNGは使わず、Web向けに縮小した webp（512/896幅）のみを読む。
// - クライアント専用（Heroはdynamic import + ssr:falseで読み込む）。
import * as THREE from 'three';
import type { HeroCard } from './manifest';

/** 未生成の区に表示する、区名入りの絵本風プレースホルダー */
export function createPlaceholderTexture(card: HeroCard): THREE.CanvasTexture {
  const W = 512;
  const H = 768;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // 羊皮紙のグラデーション
  const bg = ctx.createRadialGradient(W / 2, H * 0.42, 60, W / 2, H / 2, H * 0.75);
  bg.addColorStop(0, '#f7ecd4');
  bg.addColorStop(0.65, '#eeddb8');
  bg.addColorStop(1, '#d9c290');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 紙の繊維（seedベースの固定パターンで十分なので単純な縞を薄く）
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = '#8a6d3f';
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (i * 37) % H);
    ctx.lineTo(W, ((i * 37) % H) + 14);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // 金の二重罫
  ctx.strokeStyle = '#b8923f';
  ctx.lineWidth = 6;
  ctx.strokeRect(18, 18, W - 36, H - 36);
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, W - 64, H - 64);

  // コーナー装飾
  ctx.strokeStyle = '#a37f33';
  ctx.lineWidth = 3;
  for (const [cx, cy, sx, sy] of [
    [46, 46, 1, 1],
    [W - 46, 46, -1, 1],
    [46, H - 46, 1, -1],
    [W - 46, H - 46, -1, -1],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + 46 * sy);
    ctx.quadraticCurveTo(cx, cy, cx + 46 * sx, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 20 * sx, cy + 20 * sy, 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 中央の紋章円（区のテーマカラー）
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.36, 110, 0, Math.PI * 2);
  const emblem = ctx.createRadialGradient(W / 2, H * 0.36, 20, W / 2, H * 0.36, 110);
  emblem.addColorStop(0, card.color);
  emblem.addColorStop(1, '#00000018');
  ctx.fillStyle = emblem;
  ctx.globalAlpha = 0.45;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#b8923f';
  ctx.lineWidth = 4;
  ctx.stroke();

  // シルエット（フード姿の「まだ出会っていない子」）
  ctx.fillStyle = 'rgba(90, 70, 40, 0.55)';
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.33, 38, 0, Math.PI * 2); // 頭
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(W / 2 - 62, H * 0.47);
  ctx.quadraticCurveTo(W / 2, H * 0.33, W / 2 + 62, H * 0.47);
  ctx.lineTo(W / 2 + 46, H * 0.5);
  ctx.lineTo(W / 2 - 46, H * 0.5);
  ctx.closePath();
  ctx.fill();

  // 区名
  ctx.fillStyle = '#4a3418';
  ctx.font = 'bold 74px "Hiragino Mincho ProN", "Yu Mincho", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(card.name, W / 2, H * 0.62);

  // 小札
  ctx.font = '30px "Hiragino Mincho ProN", "Yu Mincho", serif';
  ctx.fillStyle = '#7a5c2e';
  ctx.fillText('― まだ絵本に描かれていない子 ―', W / 2, H * 0.72);
  ctx.font = 'bold 26px "Hiragino Mincho ProN", serif';
  ctx.fillStyle = '#b8923f';
  ctx.fillText('SSR 準備中', W / 2, H * 0.79);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export interface TextureStore {
  /** 現在の（プレースホルダー or 実画像）テクスチャ */
  get(id: string): THREE.Texture;
  /** 実画像の段階的ロードを開始。差し替え時にonSwapを呼ぶ */
  startLoading(onSwap: (id: string, tex: THREE.Texture) => void): void;
  dispose(): void;
}

export function createTextureStore(cards: HeroCard[], textureWidth: 512 | 896): TextureStore {
  const textures = new Map<string, THREE.Texture>();
  for (const card of cards) textures.set(card.id, createPlaceholderTexture(card));

  const loader = new THREE.TextureLoader();
  let disposed = false;

  return {
    get(id) {
      return textures.get(id)!;
    },
    startLoading(onSwap) {
      // 優先度: クローズアップ対象 → 近景バンド → 遠景バンド
      const queue = cards
        .filter((c) => c.slug !== null)
        .sort((a, b) => {
          const pa = (a.closeupAt !== null ? -100 : 0) + a.depthBand;
          const pb = (b.closeupAt !== null ? -100 : 0) + b.depthBand;
          return pa - pb;
        });
      let cursor = 0;
      const pump = () => {
        if (disposed || cursor >= queue.length) return;
        const card = queue[cursor++];
        loader.load(
          `characters/ssr/${card.slug}-w${textureWidth}.webp`,
          (tex) => {
            if (disposed) {
              tex.dispose();
              return;
            }
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = 4;
            const old = textures.get(card.id);
            textures.set(card.id, tex);
            old?.dispose();
            onSwap(card.id, tex);
            pump();
          },
          undefined,
          () => pump(), // 失敗してもプレースホルダーのまま先へ
        );
      };
      // 2並列でロード（デコード負荷を平準化）
      pump();
      pump();
    },
    dispose() {
      disposed = true;
      for (const tex of textures.values()) tex.dispose();
      textures.clear();
    },
  };
}
