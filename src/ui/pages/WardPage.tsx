'use client';

import Link from 'next/link';
import { SLUG_TO_CODE, CODE_TO_SLUG } from '../../data/slugs';
import { loadWards } from '../../data/wards';
import { loadWardDetails, DETAIL_SOURCES } from '../../data/details';
import { DATA_SOURCES } from '../../data/wards';
import { GEO_SOURCE, loadWardGeo } from '../../data/geo';
import { loadWardProfile } from '../../data/policies';
import { rankOf, ratioToMean } from '../../lib/rank';
import { Radar } from '../Radar';
import { StatBar } from '../StatBar';
import { buildWardStats } from '../wardStats';
import { WardMapSection } from '../WardMapSection';
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
  const profile = loadWardProfile(ward.code);
  const geo = loadWardGeo().find((g) => g.code === ward.code)!;

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
            <h2 className="ward-detail-evidence-title">東京のどこにいる？</h2>
            <WardMapSection code={ward.code} />
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

            {profile && profile.policies.length > 0 && (
              <>
                <h2 className="ward-detail-evidence-title" style={{ marginTop: 24 }}>{ward.name}のこころざし</h2>
                <ol className="ward-policy-list">
                  {profile.policies.map((p) => (
                    <li key={p.title} className="ward-policy-item">
                      <h3>{p.title}</h3>
                      <p>{p.summary}</p>
                      <a href={p.url} target="_blank" rel="noopener noreferrer">出典: {p.source}</a>
                    </li>
                  ))}
                </ol>
              </>
            )}

            <h2 className="ward-detail-evidence-title" style={{ marginTop: 24 }}>区のプロフィール</h2>
            <div className="ward-profile-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ward-profile-emblem" src={`/emblems/${theme.slug}.svg`} alt={`${ward.name}の区章`}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <dl>
                <div><dt>人口</dt><dd>{detail.population.toLocaleString()}人</dd></div>
                <div><dt>面積</dt><dd>{geo.areaKm2.toFixed(1)}km²</dd></div>
                {profile?.flowers && <div><dt>区の花</dt><dd>{profile.flowers.join('、')}</dd></div>}
                {profile?.trees && <div><dt>区の木</dt><dd>{profile.trees.join('、')}</dd></div>}
                {profile?.birds && <div><dt>区の鳥</dt><dd>{profile.birds.join('、')}</dd></div>}
              </dl>
            </div>

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
              {[...Object.values(DATA_SOURCES), ...Object.values(DETAIL_SOURCES), GEO_SOURCE].join(' / ')}
              （数値は取得時点のスナップショット）
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
