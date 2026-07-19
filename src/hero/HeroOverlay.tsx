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
        .hero-cta {
          animation: heroCtaPulse 2.4s ease-in-out infinite;
        }
        .hero-cta:hover {
          transform: scale(1.04);
        }
        @keyframes heroCtaPulse {
          0%, 100% { box-shadow: 0 4px 24px rgba(232, 197, 107, 0.45), 0 2px 6px rgba(0, 0, 0, 0.5); }
          50% { box-shadow: 0 6px 40px rgba(255, 222, 148, 0.8), 0 2px 6px rgba(0, 0, 0, 0.5); }
        }
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
          .hero-shimmer, .hero-cta, .hero-chevrons span { animation: none; }
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
          <span style={{ whiteSpace: "nowrap" }}>オープンデータで出会う、</span>
          <span style={{ whiteSpace: "nowrap" }}>東京23区個性診断図鑑</span>
        </p>
        {/* いきなり診断したい人のためのプライマリCTA。演出開始と共にtitleへ連動して消える */}
        <button
          ref={ctaRef}
          className="hero-cta"
          onClick={onCtaClick}
          style={{
            pointerEvents: "auto",
            marginTop: 28,
            background: "linear-gradient(180deg, #e8c56b 0%, #c9a24a 100%)",
            color: "#2a1c08",
            border: "none",
            borderRadius: 999,
            padding: "15px 38px",
            fontSize: "clamp(15px, 2.2vw, 18px)",
            fontWeight: 700,
            letterSpacing: "0.06em",
            cursor: "pointer",
            transition: "transform 0.2s ease",
          }}
        >
          いますぐ診断する（約1分）
        </button>
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
          23区が、データの地図になった。
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
