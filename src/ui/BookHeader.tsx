"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { nextHeaderState, type HeaderScrollState } from "../lib/bookHeader";

/** サブページ共通の箔押しミニヘッダー。下スクロールで隠れ、上スクロールで現れる */
export function BookHeader() {
  const [visible, setVisible] = useState(true);
  const stateRef = useRef<HeaderScrollState>({ anchorY: 0, visible: true });
  const ticking = useRef(false);
  const rafId = useRef(0);

  useEffect(() => {
    // スクロール復元でmount時にscrollY≠0の場合があるため実位置で再シードする
    stateRef.current = { anchorY: window.scrollY, visible: true };
    const apply = () => {
      ticking.current = false;
      const next = nextHeaderState(stateRef.current, window.scrollY);
      if (next.visible !== stateRef.current.visible) setVisible(next.visible);
      stateRef.current = next;
    };
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      rafId.current = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <header className={visible ? "book-header" : "book-header is-hidden"}>
      <nav className="book-header-nav" aria-label="サイトナビゲーション">
        <Link
          className="book-header-title"
          href="/"
          aria-label="トップページにもどる"
        >
          <span aria-hidden="true">❦</span> うちの区ちゃん
        </Link>
        <div className="book-header-links">
          <Link href="/#diagnosis">診断</Link>
          <Link href="/#zukan">図鑑</Link>
        </div>
      </nav>
    </header>
  );
}
