'use client';

import Link from 'next/link';
import { SLUG_TO_CODE, CODE_TO_SLUG } from '../../data/slugs';
import { loadWards } from '../../data/wards';
import { loadWardDetails, DETAIL_SOURCES } from '../../data/details';
import { DATA_SOURCES } from '../../data/wards';
import { rankOf, ratioToMean } from '../../lib/rank';
import { Radar } from '../Radar';
import { StatBar } from '../StatBar';
import { buildWardStats } from '../wardStats';
import { ssrImage, wardTheme } from '../wardTheme';

const WARDS = loadWards();
const DETAILS = loadWardDetails();

export function WardPage({ slug }: { slug: string }) {
  const ward = WARDS.find((w) => w.code === SLUG_TO_CODE[slug])!;
  const theme = wardTheme(ward.code);
  const detail = DETAILS.get(ward.code)!;
  const m = ward.metrics!;
  const all = WARDS.map((w) => w.metrics!);
  const allDetails = [...DETAILS.values()];
  const fellows = WARDS.filter((w) => w.group === ward.group && w.code !== ward.code);

  const stats = buildWardStats(m, detail, all, allDetails);

  return (
    <main className="book-section" style={{ minHeight: '100vh', ['--ward-color' as string]: theme.color }}>
      <div className="book-section-inner">
        <Link className="ward-page-back" href="/#zukan">← 図鑑にもどる</Link>
        <article className="ward-detail">
          <div className="ward-detail-portrait">
            {theme.slug && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ssrImage(theme.slug, 896)} alt={`${ward.name}ちゃんのイラスト`} width={896} height={1344} />
            )}
          </div>
          <div className="ward-detail-body">
            <p className="ward-detail-group">{ward.group}</p>
            <h1 className="ward-detail-name">{ward.name}ちゃん</h1>
            <p className="ward-detail-catch">{theme.catch}</p>
            <div className="ward-detail-radar"><Radar vector={ward.axes} color={theme.color} /></div>

            <h2 className="ward-detail-evidence-title">データで見る{ward.name}</h2>
            {stats.map((s) => (
              <StatBar key={s.label} label={s.label} valueText={s.text} rank={rankOf(s.vs, s.v)} ratio={ratioToMean(s.vs, s.v)} note={s.note} />
            ))}
            <p className="stat-section-caption">バーの中央線＝23区平均。順位は値の大きい順。</p>

            {detail.topStations && detail.topStations.length > 0 && (
              <>
                <h2 className="ward-detail-evidence-title" style={{ marginTop: 24 }}>区内の主要駅（乗降人員）</h2>
                <table className="ward-detail-evidence"><tbody>
                  {detail.topStations.map((st) => (
                    <tr key={st.name}>
                      <th scope="row">{st.name}駅</th>
                      <td className="evidence-value">{st.passengers.toLocaleString()}人/日</td>
                    </tr>
                  ))}
                </tbody></table>
              </>
            )}

            {fellows.length > 0 && (
              <>
                <h2 className="ward-detail-evidence-title" style={{ marginTop: 24 }}>おなじ系統のなかま</h2>
                <div className="fellow-grid">
                  {fellows.map((f) => {
                    const ft = wardTheme(f.code);
                    return (
                      <Link key={f.code} className="fellow-card" href={`/ward/${CODE_TO_SLUG[f.code]}/`}>
                        {ft.slug && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ssrImage(ft.slug)} alt="" loading="lazy" />
                        )}
                        {f.name}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            <h2 className="ward-detail-evidence-title" style={{ marginTop: 24 }}>出典</h2>
            <p className="ward-detail-sources">
              {[...Object.values(DATA_SOURCES), ...Object.values(DETAIL_SOURCES)].join(' / ')}
              （数値は取得時点のスナップショット）
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
