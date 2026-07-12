import { loadWardGeo } from '../data/geo';
import { geoBounds, nearestWards, ringToPath, toView } from '../lib/geo';
import { wardTheme } from './wardTheme';

const W = 640;
const H = 480;
const PAD = 36;

/** 2D羊皮紙地図。WebGL不可・reduced motion時の導線であり、意味情報は3Dと等価 */
export function WardMap2D({ code }: { code: string }) {
  const all = loadWardGeo();
  const target = all.find((w) => w.code === code)!;
  const b = geoBounds(all);
  const color = wardTheme(code).color;
  const [px, py] = toView(target.center, b, W, H, PAD);
  const neighbors = nearestWards(target, all, 4);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`東京23区の中の${target.name}の位置`}
      className="ward-map2d"
    >
      {all.map((w) => (
        <g key={w.code} className="ward-map2d-ward">
          {w.rings.map((ring, ri) => (
            <path
              key={ri}
              className="ward-map2d-shape"
              d={ringToPath(ring, b, W, H, PAD)}
              fill={w.code === code ? color : 'rgba(184, 146, 63, 0.08)'}
              fillOpacity={w.code === code ? 0.5 : 1}
              stroke="#b8923f"
              strokeWidth={w.code === code ? 1.6 : 0.7}
            />
          ))}
        </g>
      ))}
      {neighbors.map((w) => {
        const [x, y] = toView(w.center, b, W, H, PAD);
        return (
          <text key={w.code} x={x} y={y} fontSize={11} textAnchor="middle" fill="#7a5c2e" opacity={0.8}>
            {w.name}
          </text>
        );
      })}
      {/* 封蝋風ピン */}
      <circle cx={px} cy={py} r={7} fill={color} stroke="#4a3418" strokeWidth={1} />
      <circle cx={px} cy={py} r={2.6} fill="#f7ecd4" />
      <text x={px} y={py - 14} fontSize={15} fontWeight={700} textAnchor="middle" fill="#4a3418"
        stroke="#f7ecd4" strokeWidth={3} style={{ paintOrder: 'stroke', letterSpacing: '0.08em' }}>
        {target.name}
      </text>
    </svg>
  );
}
