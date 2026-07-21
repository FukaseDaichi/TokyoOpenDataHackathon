"use client";

// 3D演出の上に重ねるDOM UI。区名・タイトル・CTAはWebGLでなくDOMで表示する
// （日本語の可読性とアクセシビリティのため）。
// 毎フレームの更新はrAFでstyleを直接書き、React stateは使わない。
import { useEffect, useRef } from "react";
import { HERO_CARDS } from "./manifest";
import type { HudState } from "./hud";

interface Props {
  hud: HudState;
  onCtaClick: () => void;
}

export default function HeroOverlay({ hud, onCtaClick }: Props) {
  const vignetteRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const catchRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const { phases, labels } = hud;
      if (vignetteRef.current)
        vignetteRef.current.style.opacity = String(phases.vignette * 0.92);
      if (titleRef.current) {
        titleRef.current.style.opacity = String(phases.title);
        titleRef.current.style.transform = `translate(-50%, -50%) scale(${0.92 + 0.08 * phases.title})`;
      }
      // CTAは表示中だけクリック可能にする（透明なボタンが図鑑操作を塞がないように）
      if (ctaRef.current)
        ctaRef.current.style.pointerEvents = phases.title > 0.5 ? "auto" : "none";
      if (hintRef.current)
        hintRef.current.style.opacity = String(phases.scrollHint * 0.85);
      if (endRef.current) {
        const vis = Math.max(phases.endTitle, phases.cta);
        endRef.current.style.opacity = String(vis);
      }
      for (const card of HERO_CARDS) {
        const el = labelRefs.current[card.id];
        if (!el) continue;
        const label = labels[card.id];
        if (!label || label.opacity <= 0.01) {
          el.style.opacity = "0";
          continue;
        }
        el.style.opacity = String(label.opacity);
        // 集結シーンでは23枚分のラベルが並ぶため縮小して密度を下げる
        const shrink = 1 - hud.phases.gather * 0.42;
        el.style.transform = `translate(-50%, 0) translate(${label.x}px, ${label.y}px) scale(${shrink})`;
        const catchEl = catchRefs.current[card.id];
        // 集結シーンでは区名だけにして23枚分のキャッチで画面を埋めない
        if (catchEl)
          catchEl.style.opacity = String(
            label.opacity * (1 - hud.phases.gather),
          );
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hud]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
      aria-hidden={false}
    >
      {/* アニメーションはクラスで定義する（reduced motionでまとめて停止するため） */}
      <style>{`
        .hero-shimmer {
          animation: heroShimmer 5.5s ease-in-out infinite;
        }
        @keyframes heroShimmer {
          0% { background-position: 190% 0; }
          38% { background-position: -90% 0; }
          100% { background-position: -90% 0; }
        }
        /* 診断CTA: 黒×シャンパンゴールド二重枠の静かな高級感。
           色・影・速度はCSS変数でまとめて調整できる */
        .hero-cta-wrap {
          margin-top: 30px;
          animation: ctaEnter 0.7s ease-out 0.15s both;
        }
        @keyframes ctaEnter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-cta {
          --cta-bg-top: rgba(33, 23, 13, 0.68);
          --cta-bg-bottom: rgba(17, 13, 8, 0.86);
          --cta-gold: #d7ad58;
          --cta-gold-bright: #f5d98d;
          --cta-gold-dark: #8d682a;
          --cta-text: #efd28a;
          --cta-glow: rgba(215, 173, 88, 0.25);
          --cta-shadow: rgba(0, 0, 0, 0.45);
          --cta-pulse-duration: 3.6s;
          --cta-sheen-duration: 6.4s;
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: min(86vw, 600px);
          min-height: 88px;
          padding: clamp(14px, 2.6vw, 20px) clamp(18px, 4vw, 44px);
          border: 1px solid rgba(215, 173, 88, 0.6);
          border-radius: 16px;
          background: linear-gradient(180deg, var(--cta-bg-top) 0%, var(--cta-bg-bottom) 100%);
          color: var(--cta-text);
          font-family: "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif;
          line-height: 1.2;
          cursor: pointer;
          box-shadow: 0 10px 26px var(--cta-shadow);
          transition: transform 0.25s ease, border-color 0.25s ease, filter 0.25s ease, box-shadow 0.25s ease;
        }
        .hero-cta::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          box-shadow: 0 0 18px var(--cta-glow), 0 0 44px rgba(215, 173, 88, 0.12);
          animation: ctaGlow var(--cta-pulse-duration) ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes ctaGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .hero-cta-frame {
          position: absolute;
          inset: 4px;
          border: 1px solid rgba(215, 173, 88, 0.32);
          border-radius: 12px;
          pointer-events: none;
        }
        .hero-cta-sheen {
          position: absolute;
          inset: 1px;
          border-radius: 15px;
          overflow: hidden;
          pointer-events: none;
        }
        .hero-cta-sheen::before {
          content: "";
          position: absolute;
          top: -40%;
          bottom: -40%;
          left: 0;
          width: 30%;
          background: linear-gradient(105deg, transparent 0%, rgba(245, 217, 141, 0.14) 44%, rgba(245, 217, 141, 0.32) 50%, rgba(245, 217, 141, 0.14) 56%, transparent 100%);
          transform: translateX(-180%) skewX(-12deg);
          animation: ctaSheen var(--cta-sheen-duration) linear infinite;
        }
        @keyframes ctaSheen {
          0% { transform: translateX(-180%) skewX(-12deg); }
          26% { transform: translateX(480%) skewX(-12deg); }
          100% { transform: translateX(480%) skewX(-12deg); }
        }
        .hero-cta-sheen::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(245, 217, 141, 0.32) 0%, transparent 62%);
          opacity: 0;
        }
        .hero-cta:hover {
          transform: scale(1.02);
          border-color: rgba(245, 217, 141, 0.85);
          filter: brightness(1.07);
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.55);
        }
        .hero-cta:active {
          transform: scale(0.98);
        }
        .hero-cta:active .hero-cta-sheen::after {
          animation: ctaBurst 0.4s ease-out;
        }
        @keyframes ctaBurst {
          0% { opacity: 0.85; transform: scale(0.25); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        .hero-cta:focus-visible {
          outline: 2px solid var(--cta-gold-bright);
          outline-offset: 4px;
        }
        .hero-cta-main {
          font-size: clamp(18px, 2.8vw, 24px);
          font-weight: 600;
          letter-spacing: 0.26em;
          padding-left: 0.26em;
          white-space: nowrap;
          text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
        }
        .hero-cta-sub {
          display: inline-flex;
          align-items: center;
          gap: clamp(8px, 1.6vw, 14px);
          font-size: clamp(11px, 1.6vw, 13px);
          letter-spacing: 0.22em;
          padding-left: 0.22em;
          color: rgba(239, 210, 138, 0.78);
          white-space: nowrap;
        }
        .hero-cta-line {
          width: clamp(24px, 7vw, 56px);
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(215, 173, 88, 0.65));
        }
        .hero-cta-line-r {
          background: linear-gradient(90deg, rgba(215, 173, 88, 0.65), transparent);
        }
        .hero-cta-gem {
          width: 5px;
          height: 5px;
          flex: none;
          background: var(--cta-gold);
          transform: rotate(45deg);
          box-shadow: 0 0 6px rgba(215, 173, 88, 0.5);
        }
        .hero-cta-gem-edge {
          position: absolute;
          top: 50%;
          margin-top: -2.5px;
        }
        .hero-cta-gem-edge.is-left { left: -2.5px; }
        .hero-cta-gem-edge.is-right { right: -2.5px; }
        .hero-chevrons span {
          display: block;
          line-height: 0.55;
          animation: heroChevron 1.8s ease-in-out infinite;
        }
        .hero-chevrons span:nth-child(2) { animation-delay: 0.22s; }
        .hero-chevrons span:nth-child(3) { animation-delay: 0.44s; }
        @keyframes heroChevron {
          0%, 60%, 100% { opacity: 0.15; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-shimmer, .hero-chevrons span { animation: none; }
          .hero-cta-wrap { animation: none; }
          .hero-cta::before, .hero-cta-sheen::before { animation: none; }
          .hero-cta { transition: none; }
        }
      `}</style>

      {/* 開幕の暗転。回廊を沈める役はシーン内フォグ（HeroCanvas）に譲り、
          ここはタイトルの背面コントラストだけ担う。端を暗くするとpeekカードが隠れる */}
      <div
        ref={vignetteRef}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(8,5,2,0.62) 0%, rgba(8,5,2,0.42) 55%, rgba(8,5,2,0.05) 100%)",
        }}
      />

      {/* Scene1: タイトル */}
      <div
        ref={titleRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "44%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          width: "min(92vw, 720px)",
        }}
      >
        <p
          style={{
            color: "#e8d5a8",
            letterSpacing: "0.3em",
            fontSize: "clamp(14px, 2.2vw, 20px)",
            marginBottom: 16,
          }}
        >
          わたし、何区タイプ？
        </p>
        <h1 style={{ margin: 0 }}>
          <span style={{ position: "relative", display: "inline-block" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/title-w720.webp"
              srcSet="/title-w720.webp 720w, /title-w1440.webp 1440w"
              sizes="(max-width: 720px) 88vw, 640px"
              alt="うちの区ちゃん"
              fetchPriority="high"
              width={1470}
              height={376}
              style={{
                display: "block",
                width: "min(88vw, 640px)",
                height: "auto",
                filter:
                  "drop-shadow(0 0 28px rgba(255, 215, 140, 0.35)) drop-shadow(0 2px 8px rgba(0,0,0,0.6))",
              }}
            />
            {/* ロゴの文字形だけに光の帯を走らせる（ロゴ自身のアルファをマスクに使う） */}
            <span
              className="hero-shimmer"
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(115deg, transparent 42%, rgba(255, 240, 198, 0.9) 50%, transparent 58%)",
                backgroundSize: "250% 100%",
                WebkitMaskImage: "url(/title-w720.webp)",
                maskImage: "url(/title-w720.webp)",
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
              }}
            />
          </span>
        </h1>
        <p
          style={{
            color: "#cdb27a",
            marginTop: 18,
            fontSize: "clamp(12px, 1.8vw, 17px)",
            letterSpacing: "0.16em",
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>10問でわかる、</span>
          <span style={{ whiteSpace: "nowrap" }}>東京23区タイプ診断</span>
        </p>
        {/* いきなり診断したい人のためのプライマリCTA。演出開始と共にtitleへ連動して消える */}
        <div className="hero-cta-wrap">
          <button
            ref={ctaRef}
            className="hero-cta"
            onClick={onCtaClick}
            aria-label="今すぐ診断する（約1分）"
            style={{ pointerEvents: "auto" }}
          >
            <span className="hero-cta-frame" aria-hidden />
            <span className="hero-cta-sheen" aria-hidden />
            <span className="hero-cta-gem hero-cta-gem-edge is-left" aria-hidden />
            <span className="hero-cta-gem hero-cta-gem-edge is-right" aria-hidden />
            <span className="hero-cta-main">今すぐ診断する</span>
            <span className="hero-cta-sub">
              <span className="hero-cta-line" aria-hidden />
              <span className="hero-cta-gem" aria-hidden />
              （約1分）
              <span className="hero-cta-gem" aria-hidden />
              <span className="hero-cta-line hero-cta-line-r" aria-hidden />
            </span>
          </button>
        </div>
      </div>

      {/* スクロールヒント */}
      <div
        ref={hintRef}
        style={{
          position: "absolute",
          left: "50%",
          bottom: "5vh",
          transform: "translateX(-50%)",
          color: "#cdb27a",
          fontSize: 13,
          letterSpacing: "0.25em",
          textAlign: "center",
        }}
      >
        <span style={{ whiteSpace: "nowrap" }}>下へスクロールして、</span>
        <span style={{ whiteSpace: "nowrap" }}>絵本をめくる</span>
        <div className="hero-chevrons" aria-hidden style={{ marginTop: 10, fontSize: 20 }}>
          <span>⌄</span>
          <span>⌄</span>
          <span>⌄</span>
        </div>
      </div>

      {/* 区名ラベル（クローズアップ時・星座時） */}
      {HERO_CARDS.map((card) => (
        <div
          key={card.id}
          ref={(el) => {
            labelRefs.current[card.id] = el;
          }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            opacity: 0,
            textAlign: "center",
            whiteSpace: "nowrap",
            willChange: "transform, opacity",
          }}
        >
          <span
            style={{
              display: "block",
              color: "#f4e8d0",
              fontSize: "clamp(14px, 2.2vw, 20px)",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textShadow: "0 1px 6px rgba(0,0,0,0.85)",
            }}
          >
            {card.name}
          </span>
          <span
            ref={(el) => {
              catchRefs.current[card.id] = el;
            }}
            style={{
              display: "block",
              color: "#cdb27a",
              fontSize: "clamp(10px, 1.4vw, 13px)",
              marginTop: 4,
              letterSpacing: "0.08em",
              textShadow: "0 1px 4px rgba(0,0,0,0.85)",
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
          position: "absolute",
          left: "50%",
          bottom: "7vh",
          transform: "translateX(-50%)",
          textAlign: "center",
          opacity: 0,
          width: "min(92vw, 640px)",
          padding: "28px 16px 8px",
          background:
            "radial-gradient(ellipse at 50% 70%, rgba(16, 10, 3, 0.6) 0%, transparent 72%)",
        }}
      >
        <p
          style={{
            color: "#e8d5a8",
            fontSize: "clamp(14px, 2.2vw, 19px)",
            letterSpacing: "0.2em",
            marginBottom: 12,
            textShadow: "0 1px 8px rgba(0,0,0,0.9)",
          }}
        >
          23区が、キャラクターになった。
        </p>
        {/* 診断ボタンは直下の10問診断セクションが担うため、ここは誘導文だけにする */}
        <p
          style={{
            color: "#cdb27a",
            fontSize: "clamp(12px, 1.8vw, 15px)",
            letterSpacing: "0.22em",
            margin: 0,
            textShadow: "0 1px 6px rgba(0,0,0,0.9)",
          }}
        >
          ▼ つづきは下の図鑑で
        </p>
      </div>
    </div>
  );
}
