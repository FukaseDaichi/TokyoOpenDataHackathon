'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CODE_TO_SLUG, SLUG_TO_CODE } from '../../data/slugs';
import { loadCharacterRationale } from '../../data/rationale';
import { loadWards } from '../../data/wards';
import { loadDiagnosisSession, type DiagnosisSession } from '../../lib/diagnosisSession';
import { rankDiagnosisMatches, similarityPercent } from '../../lib/matching';
import { rankOf, ratioToMean } from '../../lib/rank';
import { Radar } from '../Radar';
import { xShareUrl } from '../ShareCard';
import { StatBar } from '../StatBar';
import { buildRadarStats } from '../wardStats';
import { wardTheme } from '../wardTheme';

const WARDS = loadWards();

export function ResultPage({ slug }: { slug: string }) {
  const ward = WARDS.find((w) => w.code === SLUG_TO_CODE[slug])!;
  // hydration差異を避けるため、sessionStorageはマウント後に読む
  const [diagnosis, setDiagnosis] = useState<DiagnosisSession | null>(null);
  useEffect(() => {
    const saved = loadDiagnosisSession();
    setDiagnosis(saved?.resultCode === ward.code ? saved : null);
  }, [ward.code]);

  const userVector = diagnosis?.vector ?? null;
  const ranked = userVector ? rankDiagnosisMatches(userVector, WARDS, ward.code) : null;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const theme = wardTheme(ward.code);
  const rationale = loadCharacterRationale(ward.code);
  const allMetrics = WARDS.map((w) => w.metrics!);
  const stats = buildRadarStats(ward.metrics!, allMetrics);
  const compatible = ranked?.filter((match) => match.ward.code !== ward.code).slice(0, 3) ?? [];

  return (
    <main className="book-section" style={{ minHeight: '100vh' }}>
      <div className="book-section-inner">
        <p className="book-section-eyebrow">SHINDAN RESULT</p>
        <h1 className="book-section-title">
          {userVector ? 'あなたに一番似ているのは…' : `この人は${ward.name}ちゃんタイプ！`}
        </h1>

        <div className="result-hero" style={{ ['--ward-color' as string]: theme.color }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="result-og-image"
            src={`/og/${slug}.jpg`}
            alt={`${ward.name}ちゃんの診断結果シェア画像`}
            width={1200}
            height={630}
          />
          <p className="result-character-line">{theme.catch}</p>
        </div>

        <div className="result-primary-action">
          {userVector ? (
            <>
              <p>この結果、誰かに見せたくなったら。</p>
              <a className="result-x-share" href={xShareUrl(ward, shareUrl)} target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true">𝕏</span> Xで結果をシェアする
              </a>
            </>
          ) : (
            <Link className="diagnosis-option result-share-link" href="/#diagnosis">
              あなたも診断する
            </Link>
          )}
        </div>

        {rationale && (
          <section className="result-section result-rationale-section">
            <p className="result-section-kicker">AI CHARACTER DESIGN</p>
            <h2>なぜ、このキャラクターになったの？</h2>
            <span className="result-ai-badge">AIによるキャラクター設定</span>
            <p className="result-rationale">{rationale}</p>
          </section>
        )}

        <section className="result-section result-status" style={{ ['--ward-color' as string]: theme.color }}>
          <p className="result-section-kicker">OPEN DATA STATUS</p>
          <Link className="result-status-detail-link" href={`/ward/${slug}/`}>
            より詳しく見る
          </Link>
          <h2>{ward.name}ちゃんのステータス</h2>
          <div className="ward-detail-radar">
            <Radar vector={ward.axes} color={theme.color} />
          </div>
          <div className="result-stat-list">
            {stats.map((stat) => (
              <StatBar
                key={stat.label}
                label={stat.label}
                valueText={stat.text}
                rank={rankOf(stat.vs, stat.v)}
                ratio={ratioToMean(stat.vs, stat.v)}
                note={stat.note}
              />
            ))}
          </div>
          <p className="stat-section-caption">バーの中央線＝23区平均。順位は値の大きい順。</p>
        </section>

        {compatible.length > 0 && (
          <>
            <h2 className="result-ranking-title">相性ランキング — あなたと相性のいい区ちゃん</h2>
            <ol className="result-ranking">
              {compatible.map((m, i) => {
                const theme = wardTheme(m.ward.code);
                const matchSlug = CODE_TO_SLUG[m.ward.code];
                return (
                  <li key={m.ward.code} style={{ ['--ward-color' as string]: theme.color }}>
                    <Link className="result-rank-link" href={`/ward/${matchSlug}/`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/og/${matchSlug}.jpg`} alt={`${m.ward.name}ちゃんの詳細を見る`} width={1200} height={630} loading="lazy" />
                      <div className="result-rank-copy">
                        <span className="result-rank">相性 {i + 1}位</span>
                        <span className="result-rank-score">にてる度 {similarityPercent(m.distance)}%</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </main>
  );
}
