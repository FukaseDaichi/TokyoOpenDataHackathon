import { AXIS_KEYS, AXIS_LABELS, type AxisVector } from '../domain/axes';

interface RadarProps {
  vector: AxisVector;
  /** 塗りの色（区のテーマカラー）。既定は金インク */
  color?: string;
  size?: number;
  overlay?: AxisVector;
  /** 軸名ラベルを描くか。既定true。外側にラベルUIを別途置く場合はfalse */
  showLabels?: boolean;
}

/** 5軸レーダー。羊皮紙に金インクで描いた紋章風（絵本図鑑のトーン） */
export function Radar({ vector, color = '#b8923f', size = 240, overlay, showLabels = true }: RadarProps) {
  const c = size / 2;
  const r = size / 2 - 34;
  const n = AXIS_KEYS.length;
  const pt = (i: number, value: number): [number, number] => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const radius = ((value + 1) / 2) * r; // [-1,1] -> [0,r]
    return [c + radius * Math.cos(angle), c + radius * Math.sin(angle)];
  };
  const ring = (v: number) => AXIS_KEYS.map((_, i) => pt(i, v).join(',')).join(' ');
  const poly = AXIS_KEYS.map((k, i) => pt(i, vector[k]).join(',')).join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`性格レーダー: ${AXIS_KEYS.map((k) => `${AXIS_LABELS[k].name}${vector[k].toFixed(2)}`).join('、')}`}
      className="radar"
    >
      {/* 目盛りリング（-1, 0, +1） */}
      <polygon points={ring(1)} fill="none" stroke="#b8923f" strokeWidth="1.4" opacity="0.9" />
      <polygon points={ring(0)} fill="none" stroke="#b8923f" strokeWidth="0.8" opacity="0.45" strokeDasharray="3 3" />
      <polygon points={ring(-0.5)} fill="none" stroke="#b8923f" strokeWidth="0.6" opacity="0.3" strokeDasharray="2 4" />
      {/* スポーク */}
      {AXIS_KEYS.map((k, i) => {
        const [x, y] = pt(i, 1);
        return <line key={k} x1={c} y1={c} x2={x} y2={y} stroke="#b8923f" strokeWidth="0.6" opacity="0.4" />;
      })}
      {/* 性格ポリゴン */}
      <polygon points={poly} fill={color} fillOpacity="0.32" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {overlay && (
        <polygon
          points={AXIS_KEYS.map((k, i) => pt(i, overlay[k]).join(',')).join(' ')}
          fill="none"
          stroke="#4a3418"
          strokeWidth="2"
          strokeDasharray="5 4"
          strokeLinejoin="round"
        />
      )}
      {AXIS_KEYS.map((k, i) => {
        const [x, y] = pt(i, vector[k]);
        return <circle key={k} cx={x} cy={y} r="3" fill={color} stroke="#4a3418" strokeWidth="0.8" />;
      })}
      {/* 軸ラベル */}
      {showLabels &&
        AXIS_KEYS.map((k, i) => {
          const [x, y] = pt(i, 1.32);
          return (
            <text
              key={k}
              x={x}
              y={y + 4}
              fontSize="12"
              textAnchor="middle"
              fill="#4a3418"
              style={{ letterSpacing: '0.1em' }}
            >
              {AXIS_LABELS[k].name}
            </text>
          );
        })}
    </svg>
  );
}
