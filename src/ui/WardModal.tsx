'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type AnimationEvent } from 'react';
import type { Ward } from '../domain/axes';
import { loadWards } from '../data/wards';
import { loadWardDetails } from '../data/details';
import { rankOf, ratioToMean } from '../lib/rank';
import { Radar } from './Radar';
import { StatBar } from './StatBar';
import { buildWardStats } from './wardStats';
import { ssrImage, wardTheme } from './wardTheme';
import { zukanNo } from './Zukan';

const WARDS = loadWards();
const DETAILS = loadWardDetails();

/** 魔法の絵本の光の粉（背景の減光オーバーレイ上を舞う） */
const PARTICLES = [
  { left: '4%', size: 5, dur: 7.2, delay: -1.3 },
  { left: '11%', size: 3, dur: 9.4, delay: -5.1 },
  { left: '18%', size: 7, dur: 6.4, delay: -3.7 },
  { left: '26%', size: 4, dur: 10.2, delay: -8.9 },
  { left: '33%', size: 6, dur: 7.8, delay: -0.6 },
  { left: '41%', size: 3, dur: 11.5, delay: -6.4 },
  { left: '49%', size: 5, dur: 8.6, delay: -2.2 },
  { left: '56%', size: 8, dur: 6.9, delay: -9.8 },
  { left: '63%', size: 4, dur: 9.9, delay: -4.5 },
  { left: '70%', size: 6, dur: 7.5, delay: -7.2 },
  { left: '77%', size: 3, dur: 10.8, delay: -1.9 },
  { left: '84%', size: 5, dur: 8.1, delay: -5.8 },
  { left: '90%', size: 7, dur: 6.6, delay: -3.1 },
  { left: '96%', size: 4, dur: 9.2, delay: -8.3 },
];

/** matchMedia非対応環境（テスト等）ではアニメーション無しに倒す */
function prefersStaticMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** 閉じアニメーションのanimationendが拾えなかった場合の保険（ms） */
const CLOSE_FALLBACK_MS = 1300;

/**
 * 区ちゃん詳細モーダル。羊皮紙×金の絵本トーンのゲームUI。
 * 表紙が開く絵本演出で登場し、立ち絵カード＋レーダーチャート＋ステータスバーを見せる。
 * レーダーとステータスは区詳細ページと同じ部品（Radar / StatBar）を共用する。
 */
export function WardModal({
  ward,
  detailHref,
  onClose,
}: {
  ward: Ward;
  detailHref: string;
  onClose: () => void;
}) {
  const animate = useMemo(() => !prefersStaticMotion(), []);
  const [closing, setClosing] = useState(false);
  const [coverOpen, setCoverOpen] = useState(!animate);

  const theme = wardTheme(ward.code);
  const index = WARDS.findIndex((w) => w.code === ward.code);
  const no = zukanNo(index);
  const m = ward.metrics;
  const detail = DETAILS.get(ward.code);
  const stats = useMemo(() => {
    if (!m || !detail) return [];
    return buildWardStats(m, detail, WARDS.map((w) => w.metrics!), [...DETAILS.values()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ward.code]);

  const requestClose = () => {
    if (!animate) {
      onClose();
      return;
    }
    setClosing(true);
  };

  // Escで閉じる（閉じアニメーションを経由するためモーダル側で処理）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  // 閉じアニメーションの取りこぼし保険
  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(onClose, CLOSE_FALLBACK_MS);
    return () => clearTimeout(t);
  }, [closing, onClose]);

  // 表紙開きアニメーションのanimationend取りこぼし保険
  useEffect(() => {
    if (!animate || coverOpen) return;
    const t = setTimeout(() => setCoverOpen(true), 1600);
    return () => clearTimeout(t);
  }, [animate, coverOpen]);

  const onBookAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.animationName === 'wardModalCoverOpen') setCoverOpen(true);
    if (e.animationName === 'wardModalBookOut') onClose();
  };

  return (
    <div
      className={`ward-modal${closing ? ' ward-modal-closing' : ''}${animate ? '' : ' ward-modal-static'}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${ward.name}の詳細`}
      onClick={requestClose}
      style={{ ['--ward-color' as string]: theme.color }}
    >
      <div className="ward-modal-particles" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="ward-modal-particle"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div
        className="ward-modal-book"
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={onBookAnimationEnd}
      >
        <article className="ward-modal-card">
          <span className="ward-modal-corner ward-modal-corner-tl" aria-hidden="true" />
          <span className="ward-modal-corner ward-modal-corner-tr" aria-hidden="true" />
          <span className="ward-modal-corner ward-modal-corner-bl" aria-hidden="true" />
          <span className="ward-modal-corner ward-modal-corner-br" aria-hidden="true" />

          <button className="ward-modal-close" aria-label="とじる" onClick={requestClose} autoFocus>
            ×
          </button>

          <div className="ward-modal-scroll">
            {/* 見出し（全幅） */}
            <div className="ward-modal-header">
              <p className="ward-modal-eyebrow">WARD FILE ── {no}</p>
              <h2 className="ward-modal-name">{ward.name}ちゃん</h2>
              {theme.catch && <p className="ward-modal-catch">{theme.catch}</p>}
            </div>

            {/* 立ち絵｜レーダー（等高2カラム） */}
            <div className="ward-modal-grid">
              <div className="ward-modal-portrait">
                <div className="ward-modal-portrait-frame">
                  {theme.slug ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ssrImage(theme.slug, 896)} alt={`${ward.name}ちゃんのイラスト`} width={896} height={1344} />
                  ) : (
                    <span className="zukan-card-placeholder" aria-hidden="true" />
                  )}
                  <span className="ward-modal-shine" aria-hidden="true" />
                  <span className="ward-modal-no">{no}</span>
                </div>
              </div>

              <div className="ward-modal-radar">
                <div className="ward-modal-radar-stage">
                  <span className="ward-modal-radar-ring" aria-hidden="true" />
                  <Radar vector={ward.axes} color={theme.color} size={300} />
                </div>
              </div>
            </div>

            {/* 下段: データで見るステータス（区詳細ページと同じ内容） */}
            <h3 className="ward-modal-stat-head">
              <span>ステータス</span>
              <span className="ward-modal-stat-rule" aria-hidden="true" />
              <span className="ward-modal-stat-sub">データで見る{ward.name}</span>
            </h3>

            {stats.length > 0 && (
              <div className="ward-modal-stats">
                {stats.map((s) => (
                  <StatBar
                    key={s.label}
                    label={s.label}
                    valueText={s.text}
                    rank={rankOf(s.vs, s.v)}
                    ratio={ratioToMean(s.vs, s.v)}
                    note={s.note}
                  />
                ))}
                <p className="stat-section-caption">バーの中央線＝23区平均。順位は値の大きい順。</p>
              </div>
            )}

            <p className="ward-modal-sources">
              出典: 令和2年国勢調査・住民基本台帳・都建設局公園調書・総務省主要財政指標・国土交通省地価公示（数値は取得時点のスナップショット）。順位は23区中の順位。
            </p>

            <div className="ward-modal-cta-wrap">
              <Link className="ward-modal-cta" href={detailHref}>
                {ward.name}ちゃんをくわしく見る<span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </article>

        {/* 絵本の表紙（開くと外れ、閉じるときに戻ってくる） */}
        {animate && (!coverOpen || closing) && (
          <div className="ward-modal-cover" aria-hidden="true">
            <div className="ward-modal-cover-front">
              <p className="ward-modal-cover-eyebrow">TOKYO 23 WARDS</p>
              <p className="ward-modal-cover-title">うちの区ちゃん図鑑</p>
              <span className="ward-modal-cover-rule" aria-hidden="true" />
              <p className="ward-modal-cover-ward">{ward.name}ちゃん</p>
              <p className="ward-modal-cover-no">{no}</p>
            </div>
            <div className="ward-modal-cover-back" />
          </div>
        )}
        {animate && <span className="ward-modal-flash" aria-hidden="true" />}
      </div>
    </div>
  );
}
