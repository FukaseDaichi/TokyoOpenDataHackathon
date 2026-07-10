'use client';

// 3D演出の上に重ねるDOM UI。区名・タイトル・CTAはWebGLでなくDOMで表示する
// （日本語の可読性とアクセシビリティのため）。
// 毎フレームの更新はrAFでstyleを直接書き、React stateは使わない。
import { useEffect, useRef } from 'react';
import { HERO_CARDS } from './manifest';
import type { HudState } from './hud';

interface Props {
  hud: HudState;
  onCtaClick: () => void;
}

export default function HeroOverlay({ hud, onCtaClick }: Props) {
  const vignetteRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const catchRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const { phases, labels } = hud;
      if (vignetteRef.current) vignetteRef.current.style.opacity = String(phases.vignette * 0.92);
      if (titleRef.current) {
        titleRef.current.style.opacity = String(phases.title);
        titleRef.current.style.transform = `translate(-50%, -50%) scale(${0.92 + 0.08 * phases.title})`;
      }
      if (hintRef.current) hintRef.current.style.opacity = String(phases.scrollHint * 0.85);
      if (endRef.current) {
        const vis = Math.max(phases.endTitle, phases.cta);
        endRef.current.style.opacity = String(vis);
        endRef.current.style.pointerEvents = phases.cta > 0.4 ? 'auto' : 'none';
      }
      for (const card of HERO_CARDS) {
        const el = labelRefs.current[card.id];
        if (!el) continue;
        const label = labels[card.id];
        if (!label || label.opacity <= 0.01) {
          el.style.opacity = '0';
          continue;
        }
        el.style.opacity = String(label.opacity);
        // 集結シーンでは23枚分のラベルが並ぶため縮小して密度を下げる
        const shrink = 1 - hud.phases.gather * 0.42;
        el.style.transform = `translate(-50%, 0) translate(${label.x}px, ${label.y}px) scale(${shrink})`;
        const catchEl = catchRefs.current[card.id];
        // 集結シーンでは区名だけにして23枚分のキャッチで画面を埋めない
        if (catchEl) catchEl.style.opacity = String(label.opacity * (1 - hud.phases.gather));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hud]);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden={false}>
      {/* 開幕の暗転 */}
      <div
        ref={vignetteRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(8,5,2,0.55) 0%, rgba(8,5,2,0.97) 100%)',
        }}
      />

      {/* Scene1: タイトル */}
      <div
        ref={titleRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '44%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          width: 'min(92vw, 720px)',
        }}
      >
        <p style={{ color: '#e8d5a8', letterSpacing: '0.3em', fontSize: 'clamp(14px, 2.2vw, 20px)', marginBottom: 16 }}>
          わたし、何区タイプ？
        </p>
        <h1
          style={{
            color: '#f4e8d0',
            fontSize: 'clamp(34px, 10vw, 76px)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            whiteSpace: 'nowrap',
            textShadow: '0 0 28px rgba(255, 215, 140, 0.35), 0 2px 8px rgba(0,0,0,0.6)',
          }}
        >
          うちの区ちゃん
        </h1>
        <p style={{ color: '#cdb27a', marginTop: 18, fontSize: 'clamp(12px, 1.8vw, 17px)', letterSpacing: '0.16em' }}>
          <span style={{ whiteSpace: 'nowrap' }}>オープンデータで出会う、</span>
          <span style={{ whiteSpace: 'nowrap' }}>東京23区個性診断図鑑</span>
        </p>
      </div>

      {/* スクロールヒント */}
      <div
        ref={hintRef}
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '5vh',
          transform: 'translateX(-50%)',
          color: '#cdb27a',
          fontSize: 13,
          letterSpacing: '0.25em',
          textAlign: 'center',
        }}
      >
        スクロールでページをめくる
        <div style={{ marginTop: 6, fontSize: 16 }}>▼</div>
      </div>

      {/* 区名ラベル（クローズアップ時・星座時） */}
      {HERO_CARDS.map((card) => (
        <div
          key={card.id}
          ref={(el) => {
            labelRefs.current[card.id] = el;
          }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            opacity: 0,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            willChange: 'transform, opacity',
          }}
        >
          <span
            style={{
              display: 'block',
              color: '#f4e8d0',
              fontSize: 'clamp(14px, 2.2vw, 20px)',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textShadow: '0 1px 6px rgba(0,0,0,0.85)',
            }}
          >
            {card.name}
          </span>
          <span
            ref={(el) => {
              catchRefs.current[card.id] = el;
            }}
            style={{
              display: 'block',
              color: '#cdb27a',
              fontSize: 'clamp(10px, 1.4vw, 13px)',
              marginTop: 4,
              letterSpacing: '0.08em',
              textShadow: '0 1px 4px rgba(0,0,0,0.85)',
            }}
          >
            {card.catch}
          </span>
        </div>
      ))}

      {/* Scene4: 最終タイトル + CTA */}
      <div
        ref={endRef}
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '7vh',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          opacity: 0,
          width: 'min(92vw, 640px)',
          padding: '28px 16px 8px',
          background: 'radial-gradient(ellipse at 50% 70%, rgba(16, 10, 3, 0.6) 0%, transparent 72%)',
        }}
      >
        <p
          style={{
            color: '#e8d5a8',
            fontSize: 'clamp(13px, 2vw, 17px)',
            letterSpacing: '0.2em',
            marginBottom: 14,
            textShadow: '0 1px 8px rgba(0,0,0,0.9)',
          }}
        >
          23区が、データの地図になった。
        </p>
        <button
          onClick={onCtaClick}
          style={{
            pointerEvents: 'inherit',
            background: 'linear-gradient(180deg, #e8c56b 0%, #c9a24a 100%)',
            color: '#2a1c08',
            border: 'none',
            borderRadius: 999,
            padding: '16px 34px',
            fontSize: 'clamp(15px, 2.2vw, 18px)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(232, 197, 107, 0.45), 0 2px 6px rgba(0,0,0,0.5)',
          }}
        >
          10問で、あなたに似ている区ちゃんを診断
        </button>
      </div>
    </div>
  );
}
