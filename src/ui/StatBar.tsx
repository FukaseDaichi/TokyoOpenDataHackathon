/** 指標1行: ラベル・実値・23区中順位・平均比バー（平均=中央の基準線） */
export function StatBar({
  label, valueText, rank, ratio, note,
}: { label: string; valueText: string; rank: number; ratio: number; note?: string }) {
  const width = Math.min(100, ratio * 50); // 平均(1.0)=50%
  return (
    <div className="stat-bar">
      <div className="stat-bar-head">
        <span className="stat-bar-label">{label}</span>
        <span className="stat-bar-value">{valueText}</span>
        <span className="stat-bar-rank">23区中 {rank}位</span>
      </div>
      <div className="stat-bar-track">
        <span className="stat-bar-fill" style={{ width: `${width}%` }} />
        <span className="stat-bar-mean" aria-hidden="true" />
      </div>
      {note && <p className="stat-bar-note">{note}</p>}
    </div>
  );
}
