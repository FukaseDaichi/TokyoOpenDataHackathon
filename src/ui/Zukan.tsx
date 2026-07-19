import { useEffect, useRef } from 'react';
import { loadWards } from '../data/wards';
import type { Ward } from '../domain/axes';
import { ssrImage, wardTheme } from './wardTheme';

const WARDS = loadWards();

/** 図鑑No.（JIS区コード順 = 配列順） */
export function zukanNo(index: number): string {
  return `No.${String(index + 1).padStart(2, '0')}`;
}

export function Zukan({ onSelect }: { onSelect: (w: Ward) => void }) {
  const gridRef = useRef<HTMLDivElement>(null);

  // タッチ環境（ホバー不可）ではスクロールで画面に入ったカードのシャインを1回再生する。
  // reduced motion時とIntersectionObserver非対応環境は静的表示のままにする。
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (typeof IntersectionObserver === 'undefined' || typeof matchMedia === 'undefined') return;
    if (!matchMedia('(hover: none)').matches) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries, io) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-shine');
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.6 }
    );
    for (const card of grid.querySelectorAll('.zukan-card')) observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="zukan-grid" ref={gridRef}>
      {WARDS.map((w, i) => {
        const theme = wardTheme(w.code);
        return (
          <button
            key={w.code}
            className="zukan-card"
            style={{ ['--ward-color' as string]: theme.color }}
            onClick={() => onSelect(w)}
            aria-label={`${w.name}の詳細を見る`}
          >
            <span className="zukan-card-no">{zukanNo(i)}</span>
            {theme.slug ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="zukan-card-img"
                src={ssrImage(theme.slug)}
                alt={`${w.name}ちゃんの立ち絵イラスト`}
                loading="lazy"
                width={512}
                height={768}
                onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
                ref={(el) => {
                  // キャッシュ済みでonLoadがハイドレーション前に発火済みのケースを拾う
                  if (el?.complete) el.classList.add('is-loaded');
                }}
              />
            ) : (
              <span className="zukan-card-img zukan-card-placeholder" aria-hidden="true" />
            )}
            <span className="zukan-card-shine" aria-hidden="true" />
            <span className="zukan-card-plate">
              <span className="zukan-card-name">{w.name}</span>
              {theme.catch ? <span className="zukan-card-catch">{theme.catch}</span> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
