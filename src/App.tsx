'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Hero from './hero/Hero';
import { prefersReducedMotion } from './hero/quality';
import { loadWards } from './data/wards';
import { Zukan } from './ui/Zukan';
import { WardModal } from './ui/WardModal';
import { Diagnosis } from './ui/Diagnosis';
import { bestMatch } from './lib/matching';
import { saveDiagnosis } from './lib/diagnosisSession';
import { CODE_TO_SLUG } from './data/slugs';

const WARDS = loadWards();

type DiagnosisPhase = { name: 'intro' } | { name: 'quiz' };

export default function App() {
  const router = useRouter();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [phase, setPhase] = useState<DiagnosisPhase>({ name: 'intro' });
  const ward = WARDS.find((w) => w.code === selectedCode) ?? null;

  const scrollToDiagnosis = () => {
    document.getElementById('diagnosis')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

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
            <Diagnosis
              onComplete={(userVector) => {
                saveDiagnosis(userVector);
                router.push(`/result/${CODE_TO_SLUG[bestMatch(userVector, WARDS).code]}/`);
              }}
            />
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
        <WardModal
          ward={ward}
          detailHref={`/ward/${CODE_TO_SLUG[ward.code]}/`}
          onClose={() => setSelectedCode(null)}
        />
      )}
    </main>
  );
}
