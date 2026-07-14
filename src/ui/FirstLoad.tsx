'use client';

// 初回ロード演出（#first-load、マークアップはapp/layout.tsxに静的配置）を閉じる係。
// 主要画像をプリロードし、「全完了 or 2秒」の早い方でフェードアウトする。
import { useEffect } from 'react';
import { detectQuality } from '../hero/quality';
import { QUALITY_SETTINGS } from '../hero/quality';
import { firstLoadPreloadUrls, hasVisited, markVisited, waitForPreload } from '../lib/firstLoad';

const PRELOAD_TIMEOUT_MS = 2000;
const FADE_MS = 400;

function loadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

function safeSessionStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export default function FirstLoad() {
  useEffect(() => {
    const el = document.getElementById('first-load');
    if (!el) return;

    const storage = safeSessionStorage();
    // #first-loadはlayout.tsxのJSXとしてReactが管理しているノード。
    // el.remove()で直接消すと以後のbody直下コミットがinsertBefore NotFoundErrorで落ちるため、
    // DOMには残したままCSS(uk-fl-gone)で非表示にする。
    if (hasVisited(storage)) {
      el.classList.add('uk-fl-hide', 'uk-fl-gone');
      return;
    }

    let cancelled = false;
    const tier = detectQuality();
    const textureWidth = tier === 'fallback' ? 512 : QUALITY_SETTINGS[tier].textureWidth;
    void waitForPreload(firstLoadPreloadUrls(textureWidth), PRELOAD_TIMEOUT_MS, loadImage).then(() => {
      if (cancelled) return;
      markVisited(storage);
      el.classList.add('uk-fl-hide');
      window.setTimeout(() => el.classList.add('uk-fl-gone'), FADE_MS + 100);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
