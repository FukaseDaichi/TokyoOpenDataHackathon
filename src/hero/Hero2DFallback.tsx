'use client';

// reduced-motion / WebGL不可 / Canvas初期化失敗時の2D絵本フォールバック。
// motionが許可されている場合のみ、装飾レイヤーに軽いCSSパララックスをかける。
import { useEffect, useRef } from 'react';
import { HERO_CARDS } from './manifest';
import { prefersReducedMotion } from './quality';

interface Props {
  onSelectWard: (id: string) => void;
  onCtaClick: () => void;
}

export default function Hero2DFallback({ onSelectWard, onCtaClick }: Props) {
  const backRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const onScroll = () => {
      const y = window.scrollY;
      if (backRef.current) backRef.current.style.transform = `translateY(${y * 0.12}px)`;
      if (midRef.current) midRef.current.style.transform = `translateY(${y * 0.05}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #241a10 0%, #3a2c1a 18%, #eeddb8 42%, #e5d0a4 100%)',
        padding: '10vh 16px 64px',
      }}
    >
      {/* 装飾レイヤー（パララックス） */}
      <div
        ref={backRef}
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-10% 0',
          background:
            'radial-gradient(circle at 20% 18%, rgba(232,197,107,0.18) 0 220px, transparent 240px), radial-gradient(circle at 82% 30%, rgba(232,197,107,0.12) 0 180px, transparent 200px)',
          pointerEvents: 'none',
        }}
      />
      <div
        ref={midRef}
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-6% 0',
          background:
            'radial-gradient(ellipse at 50% 8%, rgba(255,235,190,0.2) 0 340px, transparent 380px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: '#e8d5a8', letterSpacing: '0.28em', fontSize: 16, marginBottom: 12 }}>
          わたし、何区タイプ？
        </p>
        <h1
          style={{
            color: '#f4e8d0',
            fontSize: 'clamp(30px, 9vw, 64px)',
            letterSpacing: '0.12em',
            whiteSpace: 'nowrap',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          うちの区ちゃん
        </h1>
        <p style={{ color: '#b99c6b', margin: '14px 0 40px', letterSpacing: '0.16em', fontSize: 14 }}>
          <span style={{ whiteSpace: 'nowrap' }}>オープンデータで出会う、</span>
          <span style={{ whiteSpace: 'nowrap' }}>東京23区個性診断図鑑</span>
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))',
            gap: 14,
          }}
        >
          {HERO_CARDS.map((card) => (
            <button
              key={card.id}
              onClick={() => onSelectWard(card.id)}
              aria-label={card.name}
              style={{
                border: '2px solid #b8923f',
                borderRadius: 8,
                padding: 0,
                overflow: 'hidden',
                background: '#f2e6c8',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: '0 3px 12px rgba(60,40,10,0.25)',
              }}
            >
              {card.slug ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`characters/ssr/${card.slug}-w512.webp`}
                  alt={`${card.name}のSSRイラスト`}
                  loading="lazy"
                  style={{ width: '100%', aspectRatio: '2 / 3', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '2 / 3',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    background: 'radial-gradient(circle at 50% 36%, #f7ecd4 0%, #e5d0a4 100%)',
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: card.color,
                      opacity: 0.5,
                      border: '2px solid #b8923f',
                    }}
                  />
                  <span style={{ color: '#7a5c2e', fontSize: 11 }}>SSR 準備中</span>
                </div>
              )}
              <span
                style={{
                  display: 'block',
                  padding: '8px 4px',
                  color: '#4a3418',
                  fontWeight: 600,
                  fontSize: 14,
                  letterSpacing: '0.1em',
                }}
              >
                {card.name}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onCtaClick}
          style={{
            marginTop: 44,
            background: 'linear-gradient(180deg, #e8c56b 0%, #c9a24a 100%)',
            color: '#2a1c08',
            border: 'none',
            borderRadius: 999,
            padding: '16px 34px',
            fontSize: 17,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(150,110,40,0.4)',
          }}
        >
          10問で、あなたに似ている区ちゃんを診断
        </button>
      </div>
    </section>
  );
}
