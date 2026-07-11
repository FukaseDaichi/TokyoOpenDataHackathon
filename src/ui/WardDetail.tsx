import { AXIS_KEYS, AXIS_LABELS, type AxisKey, type Ward, type WardMetrics } from '../domain/axes';
import { Radar } from './Radar';
import { ssrImage, wardTheme } from './wardTheme';

/** 各軸の根拠となる実データ指標（個別ページに必ず表示する） */
function evidenceRows(m: WardMetrics): { axis: AxisKey; label: string; value: string }[] {
  return [
    { axis: 'liveliness', label: '昼夜間人口比率', value: `${m.daytime_population_ratio.toFixed(1)}%` },
    {
      axis: 'maturity',
      label: '高齢化率 / 年少人口率',
      value: `${m.aging_rate.toFixed(1)}% / ${m.youth_rate.toFixed(1)}%`,
    },
    { axis: 'greenery', label: '一人当たり公立公園面積', value: `${m.park_area_per_capita.toFixed(2)}㎡` },
    {
      axis: 'family',
      label: '単身世帯率 / 子育て世帯率',
      value: `${m.single_household_rate.toFixed(1)}% / ${m.family_household_rate.toFixed(1)}%`,
    },
    { axis: 'luxury', label: '財政力指数', value: m.fiscal_strength_index.toFixed(2) },
  ];
}

export function WardDetail({ ward }: { ward: Ward }) {
  const theme = wardTheme(ward.code);
  return (
    <article className="ward-detail" style={{ ['--ward-color' as string]: theme.color }}>
      <div className="ward-detail-portrait">
        {theme.slug ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ssrImage(theme.slug, 896)} alt={`${ward.name}ちゃんのイラスト`} width={896} height={1344} />
        ) : (
          <div className="zukan-card-placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="ward-detail-body">
        <p className="ward-detail-group">{ward.group}</p>
        <h3 className="ward-detail-name">{ward.name}ちゃん</h3>
        {theme.catch && <p className="ward-detail-catch">{theme.catch}</p>}
        <div className="ward-detail-radar">
          <Radar vector={ward.axes} color={theme.color} />
        </div>
        {ward.metrics && (
          <>
            <h4 className="ward-detail-evidence-title">データの根拠</h4>
            <table className="ward-detail-evidence">
              <tbody>
                {evidenceRows(ward.metrics).map((row) => (
                  <tr key={row.axis}>
                    <th scope="row">{AXIS_LABELS[row.axis].name}</th>
                    <td className="evidence-metric">{row.label}</td>
                    <td className="evidence-value">{row.value}</td>
                    <td className="evidence-score">{ward.axes[row.axis] >= 0 ? '+' : ''}{ward.axes[row.axis].toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="ward-detail-sources">
              出典: 令和2年国勢調査・住民基本台帳・都建設局公園調書・総務省主要財政指標（数値は取得時点のスナップショット）
            </p>
          </>
        )}
      </div>
    </article>
  );
}
