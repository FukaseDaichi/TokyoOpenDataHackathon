import { StatBar } from 'uchinokuchan';

// StatBarは羊皮紙（.ward-detail）上で使う想定なので、実アプリと同じ羊皮紙トーンで包む
const Parchment = ({ children }: { children?: any }) => (
  <div
    style={{
      background: 'linear-gradient(180deg, #f7ecd4 0%, #eeddb8 100%)',
      border: '2px solid #b8923f',
      borderRadius: 12,
      padding: '10px 22px 18px',
      color: '#4a3418',
      maxWidth: 520,
    }}
  >
    {children}
  </div>
);

export const Single = () => (
  <Parchment>
    <StatBar label="一人あたり公園面積" valueText="3.42㎡" rank={8} ratio={1.12} />
  </Parchment>
);

export const WithNote = () => (
  <Parchment>
    <StatBar
      label="昼夜間人口比率"
      valueText="1753.7%"
      rank={1}
      ratio={2.0}
      note="千代田区は昼間人口が夜間の17倍超（令和2年国勢調査）"
    />
  </Parchment>
);

export const MetricsBlock = () => (
  <Parchment>
    <StatBar label="高齢化率" valueText="21.3%" rank={12} ratio={0.98} />
    <StatBar label="子育て世帯率" valueText="24.1%" rank={5} ratio={1.18} />
    <StatBar label="単身世帯率" valueText="49.8%" rank={14} ratio={0.96} />
    <StatBar label="財政力指数" valueText="0.61" rank={9} ratio={1.05} note="特別区財政調整交付金の算定に用いる指数" />
  </Parchment>
);
