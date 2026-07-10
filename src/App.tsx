'use client';

import { useState } from 'react';
import Hero from './hero/Hero';
import { WARDS } from './hero/wards';
import { prefersReducedMotion } from './hero/quality';

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const ward = WARDS.find((w) => w.id === selectedId) ?? null;

  const scrollToDiagnosis = () => {
    document.getElementById('diagnosis')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  return (
    <main>
      <Hero onSelectWard={setSelectedId} onCtaClick={scrollToDiagnosis} />

      {/* 診断セクション（MVP実装計画で本実装するスタブ） */}
      <section
        id="diagnosis"
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          background: 'linear-gradient(180deg, #eeddb8 0%, #e0c998 100%)',
          color: '#4a3418',
          padding: '64px 20px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', letterSpacing: '0.14em' }}>10問診断</h2>
        <p style={{ maxWidth: 560, lineHeight: 2 }}>
          10問に答えると、オープンデータの5軸性格ベクトルから
          あなたに一番似ている区ちゃんが見つかります。
          （診断はMVP実装計画に沿って準備中です）
        </p>
      </section>

      {/* 区ちゃん簡易詳細（クリック/タップで表示。個別ページはMVPで拡張） */}
      {ward && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${ward.name}の詳細`}
          onClick={() => setSelectedId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(12, 8, 3, 0.78)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, #f7ecd4 0%, #eeddb8 100%)',
              border: '3px solid #b8923f',
              borderRadius: 12,
              maxWidth: 420,
              width: '100%',
              maxHeight: '86vh',
              overflow: 'auto',
              padding: 20,
              textAlign: 'center',
              color: '#4a3418',
              boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
            }}
          >
            {ward.slug ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`characters/ssr/${ward.slug}-w512.webp`}
                alt={`${ward.name}のSSRイラスト`}
                style={{ width: '70%', aspectRatio: '2 / 3', objectFit: 'cover', borderRadius: 8 }}
              />
            ) : (
              <div
                style={{
                  width: '70%',
                  aspectRatio: '2 / 3',
                  margin: '0 auto',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  background: 'radial-gradient(circle at 50% 36%, #fff6e0 0%, #e5d0a4 100%)',
                  border: '2px solid #b8923f',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: ward.color,
                    opacity: 0.5,
                    border: '2px solid #b8923f',
                  }}
                />
                <span style={{ fontSize: 12, color: '#7a5c2e' }}>SSRイラスト準備中</span>
              </div>
            )}
            <h3 style={{ margin: '16px 0 8px', fontSize: 24, letterSpacing: '0.14em' }}>{ward.name}</h3>
            <p style={{ lineHeight: 1.9, fontSize: 14 }}>{ward.catch}</p>
            <p style={{ marginTop: 10, fontSize: 12, color: '#7a5c2e' }}>
              個別ページ（レーダーチャート・データ根拠）はMVPで実装予定
            </p>
            <button
              onClick={() => setSelectedId(null)}
              style={{
                marginTop: 14,
                background: '#4a3418',
                color: '#f4e8d0',
                border: 'none',
                borderRadius: 999,
                padding: '10px 28px',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              とじる
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
