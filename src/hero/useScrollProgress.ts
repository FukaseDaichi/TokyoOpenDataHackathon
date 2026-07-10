'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * ラッパー要素（400〜500vh）のスクロール進捗 0..1 をrefで返す。
 * React stateを更新しないので毎フレームの再レンダーは発生しない。
 * ネイティブスクロールを一切奪わない（listenerはpassive）。
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
    const update = () => {
      const el = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? -rect.top / total : 0;
      progress.current = Math.min(1, Math.max(0, p));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [targetRef]);

  return progress;
}
