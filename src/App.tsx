'use client';

import { useEffect, useState } from 'react';
import Hero from './hero/Hero';
import { prefersReducedMotion } from './hero/quality';
import { loadWards } from './data/wards';
import type { AxisVector, Ward } from './domain/axes';
import { Zukan } from './ui/Zukan';
import { WardDetail } from './ui/WardDetail';
import { Diagnosis } from './ui/Diagnosis';
import { Result } from './ui/Result';
import { ShareCard, xShareUrl } from './ui/ShareCard';
import { bestMatch } from './lib/matching';

const WARDS = loadWards();

type DiagnosisPhase = { name: 'intro' } | { name: 'quiz' } | { name: 'result'; userVector: AxisVector };

export default function App() {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [phase, setPhase] = useState<DiagnosisPhase>({ name: 'intro' });
  const ward = WARDS.find((w) => w.code === selectedCode) ?? null;

  const scrollToDiagnosis = () => {
    document.getElementById('diagnosis')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  // モーダルはEscで閉じる
  useEffect(() => {
    if (!ward) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCode(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ward]);

  const matched = phase.name === 'result' ? bestMatch(phase.userVector, WARDS) : null;
  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';

  return (
    <main>
      <Hero onSelectWard={setSelectedCode} onCtaClick={scrollToDiagnosis} />

      {/* 10問診断 */}
      <section id="diagnosis" className="book-section">
        <div className="book-section-inner">
          <p className="book-section-eyebrow">SHINDAN</p>
          <h2 className="book-section-title">10問診断</h2>
          {phase.name === 'intro' && (
            <>
              <p className="book-section-lede">
                10問に答えると、オープンデータの5軸性格ベクトルから
                あなたに一番似ている区ちゃんが見つかります。
              </p>
              <div className="diagnosis-start">
                <button className="diagnosis-option diagnosis-start-button" onClick={() => setPhase({ name: 'quiz' })}>
                  診断をはじめる
                </button>
              </div>
            </>
          )}
          {phase.name === 'quiz' && (
            <Diagnosis onComplete={(userVector) => setPhase({ name: 'result', userVector })} />
          )}
          {phase.name === 'result' && matched && (
            <>
              <Result userVector={phase.userVector} />
              <div className="result-actions">
                <a
                  className="diagnosis-option result-share-link"
                  href={xShareUrl(matched, shareUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xで結果をシェアする
                </a>
                <button className="result-retry" onClick={() => setPhase({ name: 'quiz' })}>
                  もう一度診断する
                </button>
              </div>
              <div className="result-share-card">
                <ShareCard ward={matched} />
              </div>
            </>
          )}
        </div>
      </section>

      {/* 23区図鑑 */}
      <section id="zukan" className="book-section book-section-zukan">
        <div className="book-section-inner">
          <p className="book-section-eyebrow">ZUKAN</p>
          <h2 className="book-section-title">23区ちゃん図鑑</h2>
          <p className="book-section-lede">
            それぞれの区ちゃんの性格は、すべて東京都のオープンデータから生まれています。
            気になる子をめくってみてください。
          </p>
          <Zukan onSelect={(w) => setSelectedCode(w.code)} />
        </div>
      </section>

      {/* 個別詳細モーダル */}
      {ward && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${ward.name}の詳細`}
          className="ward-modal"
          onClick={() => setSelectedCode(null)}
        >
          <div className="ward-modal-inner" onClick={(e) => e.stopPropagation()}>
            <WardDetail ward={ward} />
            <button className="ward-modal-close" onClick={() => setSelectedCode(null)} autoFocus>
              とじる
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
