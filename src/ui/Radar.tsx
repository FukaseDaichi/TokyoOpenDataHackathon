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

/** 5軸レーダー。羊皮紙に金インクで描き上がる紋章風（インク描画アニメーション付き） */
export function Radar({ vector, color = '#b8923f', size = 240, overlay, showLabels = true }: RadarProps) {
  const c = size / 2;
  const r = size / 2 - 34;
  const n = AXIS_KEYS.length;
  const compact = size < 200;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, value: number): [number, number] => {
    const a = angle(i);
    const radius = ((value + 1) / 2) * r; // [-1,1] -> [0,r]
    return [c + radius * Math.cos(a), c + radius * Math.sin(a)];
  };
  const ring = (v: number) => AXIS_KEYS.map((_, i) => pt(i, v).join(',')).join(' ');
  const poly = AXIS_KEYS.map((k, i) => pt(i, vector[k]).join(',')).join(' ');
  const score = (v: number) => Math.round(((v + 1) / 2) * 100);
  // ベクトルが変わったらSVGごと差し替えてアニメーションを最初から再生する
  const replayKey = AXIS_KEYS.map((k) => vector[k].toFixed(3)).join(',') + '|' + color + '|' + size;

  return (
    <svg
      key={replayKey}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`性格レーダー: ${AXIS_KEYS.map((k) => `${AXIS_LABELS[k].name}${vector[k].toFixed(2)}`).join('、')}`}
      className="radar"
      style={{ overflow: 'visible' }}
    >
      {/* 外周リング（描き上がり） */}
      <polygon
        points={ring(1)}
        fill="none"
        stroke="#b8923f"
        strokeWidth={1.4}
        opacity={0.9}
        pathLength={1}
        style={{ strokeDasharray: 1, animation: 'radarDraw .7s ease 0s both' }}
      />
      {/* 内側の目盛りリング（0, -0.5） */}
      {(
        [
          [0, 0.8, '3 3', 0.45],
          [-0.5, 0.6, '2 4', 0.3],
        ] as const
      ).map(([v, w, dash, op], i) => (
        <polygon
          key={`ri${i}`}
          points={ring(v)}
          fill="none"
          stroke="#b8923f"
          strokeWidth={w}
          opacity={op}
          strokeDasharray={dash}
          style={{ animation: `radarFade .5s ease ${0.25 + i * 0.1}s both` }}
        />
      ))}
      {/* 目盛り数値（75/50/25） */}
      {!compact &&
        (
          [
            [0.5, '75'],
            [0, '50'],
            [-0.5, '25'],
          ] as const
        ).map(([v, t], ti) => {
          const [, y] = pt(0, v);
          return (
            <text
              key={`tick${ti}`}
              x={c - 9}
              y={y + 3}
              fontSize={8}
              textAnchor="end"
              fill="#7a5c2e"
              opacity={0.85}
              style={{ animation: 'radarFade .5s ease .6s both' }}
            >
              {t}
            </text>
          );
        })}
      {/* スポーク */}
      {AXIS_KEYS.map((k, i) => {
        const [x, y] = pt(i, 1);
        return (
          <line
            key={`sp${k}`}
            x1={c}
            y1={c}
            x2={x}
            y2={y}
            stroke="#b8923f"
            strokeWidth={0.6}
            opacity={0.45}
            pathLength={1}
            style={{ strokeDasharray: 1, animation: `radarDraw .5s ease ${0.35 + i * 0.07}s both` }}
          />
        );
      })}
      {/* 軸ラベル（軸名＋方向） */}
      {showLabels &&
        AXIS_KEYS.map((k, i) => {
          const [x, y] = pt(i, compact ? 1.18 : 1.36);
          return (
            <g key={`lb${k}`}>
              <text
                x={x}
                y={y + 2}
                fontSize={compact ? 11 : 13}
                fontWeight={600}
                textAnchor="middle"
                fill="#4a3418"
                style={{ letterSpacing: '0.1em', animation: `radarFade .6s ease ${0.7 + i * 0.07}s both` }}
              >
                {AXIS_LABELS[k].name}
              </text>
              {!compact && (
                <text
                  x={x}
                  y={y + 14}
                  fontSize={8}
                  textAnchor="middle"
                  fill="#7a5c2e"
                  style={{ animation: `radarFade .6s ease ${0.8 + i * 0.07}s both` }}
                >
                  {`${AXIS_LABELS[k].low} → ${AXIS_LABELS[k].high}`}
                </text>
              )}
            </g>
          );
        })}
      {/* 性格ポリゴン（塗り→輪郭の順に描き上がる） */}
      <polygon points={poly} fill={color} fillOpacity={0.32} stroke="none" style={{ animation: 'radarFade .7s ease 1.6s both' }} />
      <polygon
        points={poly}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        pathLength={1}
        style={{ strokeDasharray: 1, animation: 'radarDraw .9s cubic-bezier(.4,0,.2,1) 1.0s both' }}
      />
      {overlay && (
        <polygon
          points={AXIS_KEYS.map((k, i) => pt(i, overlay[k]).join(',')).join(' ')}
          fill="none"
          stroke="#4a3418"
          strokeWidth={2}
          strokeDasharray="5 4"
          strokeLinejoin="round"
          style={{ animation: 'radarFade .6s ease 2.2s both' }}
        />
      )}
      {/* 頂点ドット＋スコアバッジ */}
      {AXIS_KEYS.map((k, i) => {
        const v = vector[k];
        const [x, y] = pt(i, v);
        const a = angle(i);
        const bx = x + 16 * Math.cos(a);
        const by = y + 16 * Math.sin(a);
        return (
          <g key={`dot${k}`}>
            <circle
              cx={x}
              cy={y}
              r={3.4}
              fill={color}
              stroke="#4a3418"
              strokeWidth={0.8}
              style={{ transformOrigin: `${x}px ${y}px`, animation: `radarPop .45s ease ${1.9 + i * 0.12}s both` }}
            />
            {!compact && (
              <text
                x={bx}
                y={by + 3.5}
                fontSize={10.5}
                fontWeight={700}
                textAnchor="middle"
                fill="#4a3418"
                stroke="#f7ecd4"
                strokeWidth={3}
                style={{ animation: `radarFade .4s ease ${2.05 + i * 0.12}s both`, paintOrder: 'stroke' }}
              >
                {score(v)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
