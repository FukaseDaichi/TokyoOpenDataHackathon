'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState, type AnimationEvent } from 'react';
import { AXIS_KEYS, AXIS_LABELS, type AxisKey, type Ward, type WardMetrics } from '../domain/axes';
import { loadWards } from '../data/wards';
import { rankOf } from '../lib/rank';
import { detectQuality } from '../hero/quality';
import { Radar } from './Radar';
import { ssrImage, wardTheme } from './wardTheme';
import { zukanNo } from './Zukan';

/** 3Dレーダーはthree.js込みなのでモーダル初回表示時に遅延読込（静的エクスポート互換） */
const Radar3D = dynamic(() => import('./Radar3D'), { ssr: false });

const WARDS = loadWards();

/** 各軸の根拠指標ラベル（下段ステータス表の左列） */
const METRIC_LABEL: Record<AxisKey, string> = {
  liveliness: '昼夜間人口比率',
  maturity: '高齢化率 / 年少人口率',
  greenery: '一人当たり公立公園面積',
  family: '単身世帯率 / 子育て世帯率',
  luxury: '財政力指数',
};

/** 軸チップの配置（五角形の頂点付近）。2Dフォールバック時のみ使用 */
const AXIS_POS: Record<AxisKey, { left: string; top: string }> = {
  liveliness: { left: '50%', top: '6%' },
  maturity: { left: '90%', top: '36%' },
  greenery: { left: '76%', top: '88%' },
  family: { left: '24%', top: '88%' },
  luxury: { left: '10%', top: '36%' },
};

function metricValue(key: AxisKey, m: WardMetrics): string {
  switch (key) {
    case 'liveliness':
      return `${m.daytime_population_ratio.toFixed(1)}%`;
    case 'maturity':
      return `${m.aging_rate.toFixed(1)}% / ${m.youth_rate.toFixed(1)}%`;
    case 'greenery':
      return `${m.park_area_per_capita.toFixed(2)}㎡`;
    case 'family':
      return `${m.single_household_rate.toFixed(1)}% / ${m.family_household_rate.toFixed(1)}%`;
    case 'luxury':
      return m.fiscal_strength_index.toFixed(2);
  }
}

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

/** 3Dレーダーを出せるか（reduced-motion / WebGL不可なら2Dフォールバック） */
function canUse3D(): boolean {
  try {
    return detectQuality() !== 'fallback';
  } catch {
    return false;
  }
}

/** 閉じアニメーションのanimationendが拾えなかった場合の保険（ms） */
const CLOSE_FALLBACK_MS = 1300;

/**
 * 区ちゃん詳細モーダル。羊皮紙×金の絵本トーンのゲームUI。
 * 表紙が開く絵本演出で登場し、立ち絵カード＋魔法陣ホログラム3Dレーダー＋ステータス表を見せる。
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
  const use3D = useMemo(() => canUse3D(), []);
  const [closing, setClosing] = useState(false);
  const [coverOpen, setCoverOpen] = useState(!animate);
  const [radarReady, setRadarReady] = useState(false);

  const theme = wardTheme(ward.code);
  const index = WARDS.findIndex((w) => w.code === ward.code);
  const no = zukanNo(index);
  const rankByAxis = (key: AxisKey) => rankOf(WARDS.map((w) => w.axes[key]), ward.axes[key]);
  const ranks = useMemo(
    () => Object.fromEntries(AXIS_KEYS.map((k) => [k, rankByAxis(k)])) as Record<AxisKey, number>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ward.code],
  );
  const m = ward.metrics;

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
                <div className={`ward-modal-radar-stage${use3D ? ' ward-modal-radar-stage-3d' : ''}`}>
                  {!use3D && <span className="ward-modal-radar-ring" aria-hidden="true" />}
                  {use3D ? (
                    <>
                      {/* three.js読込完了までは2Dで場をつなぐ */}
                      {!radarReady && <Radar vector={ward.axes} color={theme.color} size={300} showLabels={false} />}
                      <Radar3D
                        vector={ward.axes}
                        ranks={ranks}
                        color={theme.color}
                        onReady={() => setRadarReady(true)}
                      />
                    </>
                  ) : (
                    <>
                      <Radar vector={ward.axes} color="#b8923f" size={300} showLabels={false} />
                      {AXIS_KEYS.map((k) => (
                        <span key={k} className="ward-modal-axis-chip" style={AXIS_POS[k]}>
                          {AXIS_LABELS[k].name}
                          <b>{ranks[k]}位</b>
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 下段: 23区ランキング */}
            <h3 className="ward-modal-stat-head">
              <span>ステータス</span>
              <span className="ward-modal-stat-rule" aria-hidden="true" />
              <span className="ward-modal-stat-sub">23区ランキング</span>
            </h3>

            {m && (
              <div className="ward-modal-stats">
                {AXIS_KEYS.map((k) => {
                  const rank = ranks[k];
                  return (
                    <div key={k} className="ward-modal-stat-row">
                      <span className="ward-modal-stat-axis">{AXIS_LABELS[k].name}</span>
                      <span className="ward-modal-stat-metric">{METRIC_LABEL[k]}</span>
                      <span className="ward-modal-stat-value">{metricValue(k, m)}</span>
                      <span className={`ward-rank-badge${rank <= 3 ? ` ward-rank-badge-${rank}` : ''}`}>
                        <b>{rank}</b>位
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="ward-modal-sources">
              出典: 令和2年国勢調査・住民基本台帳・都建設局公園調書・総務省主要財政指標（数値は取得時点のスナップショット）。順位は23区中の順位。
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
