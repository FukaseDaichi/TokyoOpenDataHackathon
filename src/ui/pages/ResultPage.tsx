'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SLUG_TO_CODE } from '../../data/slugs';
import { loadWards } from '../../data/wards';
import { loadDiagnosisSession, type DiagnosisSession } from '../../lib/diagnosisSession';
import { rankDiagnosisMatches, similarityPercent } from '../../lib/matching';
import { WardDetail } from '../WardDetail';
import { ShareCard, xShareUrl } from '../ShareCard';
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

  return (
    <main className="book-section" style={{ minHeight: '100vh' }}>
      <div className="book-section-inner">
        <p className="book-section-eyebrow">SHINDAN RESULT</p>
        <h1 className="book-section-title">
          {userVector ? 'あなたに一番似ているのは…' : `この人は${ward.name}ちゃんタイプ！`}
        </h1>
        <div style={{ marginTop: 32 }}>
          <WardDetail ward={ward} userOverlay={userVector ?? undefined} />
        </div>

        {ranked && (
          <>
            <h2 className="result-ranking-title">相性ランキング</h2>
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
          </>
        )}

        <div className="result-actions">
          {userVector ? (
            <a className="diagnosis-option result-share-link" href={xShareUrl(ward, shareUrl)} target="_blank" rel="noopener noreferrer">
              Xで結果をシェアする
            </a>
          ) : (
            <Link className="diagnosis-option result-share-link" href="/#diagnosis">
              あなたも診断する
            </Link>
          )}
          <Link className="result-retry" href={`/ward/${slug}/`}>
            {ward.name}ちゃんをくわしく見る →
          </Link>
        </div>

        {userVector && (
          <div className="result-share-card">
            <ShareCard ward={ward} />
          </div>
        )}
      </div>
    </main>
  );
}
