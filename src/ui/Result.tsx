import { rankMatches } from '../lib/matching';
import { loadWards } from '../data/wards';
import type { AxisVector } from '../domain/axes';
import { WardDetail } from './WardDetail';
import { wardTheme } from './wardTheme';

const WARDS = loadWards();

/** 距離→「にてる度」%（0距離=100%、5軸最大距離で0%へ線形） */
export function similarityPercent(distance: number): number {
  const maxD = Math.sqrt(5 * 4); // 各軸差 ±2 の理論最大
  return Math.round(Math.max(0, 1 - distance / maxD) * 100);
}

export function Result({ userVector }: { userVector: AxisVector }) {
  const ranked = rankMatches(userVector, WARDS);
  const top = ranked[0];
  return (
    <div className="result">
      <p className="result-lede">あなたに一番似ているのは…</p>
      <WardDetail ward={top.ward} />
      <h4 className="result-ranking-title">相性ランキング</h4>
      <ol className="result-ranking">
        {ranked.slice(0, 3).map((m, i) => {
          const theme = wardTheme(m.ward.code);
          return (
            <li key={m.ward.code} style={{ ['--ward-color' as string]: theme.color }}>
              <span className="result-rank">{i + 1}位</span>
              <span className="result-rank-name">{m.ward.name}</span>
              <span className="result-rank-group">{m.ward.group}</span>
              <span className="result-rank-score">にてる度 {similarityPercent(m.distance)}%</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
