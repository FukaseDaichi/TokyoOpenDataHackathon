'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { ATTRACT_IDLE_MS, attractPulse } from './attract';
import { prefersReducedMotion } from './quality';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * ラッパー要素（400〜500vh）のスクロール進捗 0..1 をrefで返す。
 * React stateを更新しないので毎フレームの再レンダーは発生しない。
 * ネイティブスクロールを一切奪わない（listenerはpassive）。
 *
 * アトラクトループ: t≈0で無操作が続いたら attractPulse のオフセットを加算し、
 * 「ページがめくれかけて戻る」動きでスクロールを促す。操作した瞬間に減衰する。
 * reduced motion環境と ?herot= 強制時は無効。
 */
export function useScrollProgress(targetRef: RefObject<HTMLElement | null>) {
  const progress = useRef(0);

  useEffect(() => {
    // デモ・検証用の強制上書き: ?herot=0..1 で進捗を固定（quality.tsの?view=と同じ流儀）
    const forced = Number(new URLSearchParams(window.location.search).get('herot'));
    if (Number.isFinite(forced) && window.location.search.includes('herot=')) {
      progress.current = Math.min(1, Math.max(0, forced));
      return;
    }

    let rawP = 0;
    let attract = 0;
    let lastInteract = performance.now();
    let pulseStart: number | null = null;
    let raf = 0;

    const measure = () => {
      const el = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      rawP = clamp01(total > 0 ? -rect.top / total : 0);
    };
    const update = () => {
      measure();
      progress.current = clamp01(rawP + attract);
    };
    const onInteract = () => {
      lastInteract = performance.now();
      pulseStart = null;
      update();
    };

    update();
    window.addEventListener('scroll', onInteract, { passive: true });
    window.addEventListener('resize', onInteract);

    const attractEnabled = !prefersReducedMotion();
    if (attractEnabled) {
      const tick = (now: number) => {
        if (rawP < 0.002 && now - lastInteract >= ATTRACT_IDLE_MS) {
          if (pulseStart === null) pulseStart = now;
          attract = attractPulse(now - pulseStart);
        } else if (attract > 0) {
          // 操作された瞬間の急なジャンプを避けて素早く減衰（60fpsで約250ms）
          attract = attract < 1e-4 ? 0 : attract * 0.85;
        }
        progress.current = clamp01(rawP + attract);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener('scroll', onInteract);
      window.removeEventListener('resize', onInteract);
      cancelAnimationFrame(raf);
    };
  }, [targetRef]);

  return progress;
}
