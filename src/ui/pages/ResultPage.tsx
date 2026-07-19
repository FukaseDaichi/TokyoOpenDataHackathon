"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AXIS_LABELS } from "../../domain/axes";
import { loadAffinityText } from "../../data/affinity";
import { pickPolicyForAxes, loadWardProfile } from "../../data/policies";
import { CODE_TO_SLUG, SLUG_TO_CODE } from "../../data/slugs";
import { loadCharacterRationale } from "../../data/rationale";
import { loadWardTraits } from "../../data/traits";
import { loadWards } from "../../data/wards";
import {
  loadDiagnosisSession,
  type DiagnosisSession,
} from "../../lib/diagnosisSession";
import {
  compatibilityPercents,
  rankDiagnosisMatches,
  similarityPercent,
} from "../../lib/matching";
import {
  matchedAxisTags,
  personaType,
  selectMatchedAxes,
} from "../../lib/personaType";
import { rankOf, ratioToMean } from "../../lib/rank";
import { paletteVars, wardPalette } from "../../lib/wardPalette";
import { Radar } from "../Radar";
import { xShareUrl } from "../share";
import { StatBar } from "../StatBar";
import { buildRadarStats, statLabelForAxis } from "../wardStats";
import { wardTheme } from "../wardTheme";

const WARDS = loadWards();

export function ResultPage({ slug }: { slug: string }) {
  const ward = WARDS.find((w) => w.code === SLUG_TO_CODE[slug])!;
  // hydration差異を避けるため、sessionStorageはマウント後に読む
  const [diagnosis, setDiagnosis] = useState<DiagnosisSession | null>(null);
  useEffect(() => {
    const saved = loadDiagnosisSession();
    setDiagnosis(saved?.resultCode === ward.code ? saved : null);
  }, [ward.code]);

  const userVector = diagnosis?.vector ?? null;
  const ranked = userVector
    ? rankDiagnosisMatches(userVector, WARDS, ward.code)
    : null;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const theme = wardTheme(ward.code);
  const palette = wardPalette(theme.color);
  const rationale = loadCharacterRationale(ward.code);
  const traits = loadWardTraits(ward.code);
  const allMetrics = WARDS.map((w) => w.metrics!);
  const stats = buildRadarStats(ward.metrics!, allMetrics);
  const compatible =
    ranked?.filter((match) => match.ward.code !== ward.code).slice(0, 3) ?? [];

  // 診断者向け: あなたのタイプ・一致軸・相性文・データカード・政策
  const persona = userVector ? personaType(userVector) : null;
  const matchedAxes = userVector
    ? selectMatchedAxes(userVector, ward.axes)
    : null;
  const affinityText = matchedAxes
    ? loadAffinityText(ward.code, matchedAxes[0])
    : null;
  const matchedStats = matchedAxes
    ? matchedAxes
        .map((axis) =>
          stats.find((s) => s.label === statLabelForAxis(axis, ward.axes)),
        )
        .filter((s): s is NonNullable<typeof s> => s !== undefined)
    : [];
  const profile = loadWardProfile(ward.code);
  const policy =
    matchedAxes && profile
      ? pickPolicyForAxes(profile.policies, matchedAxes)
      : null;
  // 自区（ランキング先頭）との距離から にてる度% を出す
  const percent = ranked ? similarityPercent(ranked[0].distance) : null;
  // 相性側の表示%は結果の%を超えない（compatibilityPercents が相対スケーリング）
  const compatPercents = ranked
    ? compatibilityPercents(
        ranked[0].distance,
        compatible.map((m) => m.distance),
      )
    : [];
  const tags =
    userVector && matchedAxes ? matchedAxisTags(userVector, matchedAxes) : [];
  /** [-1,1] → トラック上の位置% */
  const trackPos = (v: number) => ((v + 1) / 2) * 100;
  const shareHref =
    percent !== null && persona
      ? xShareUrl(ward, shareUrl, { percent, personaName: persona.name })
      : xShareUrl(ward, shareUrl);

  return (
    <main
      className={userVector ? "book-section has-share-bar" : "book-section"}
      style={{
        minHeight: "100vh",
        ["--ward-color" as string]: theme.color,
        ...paletteVars(palette),
      }}
    >
      <div className="book-section-inner">
        <p className="book-section-eyebrow">SHINDAN RESULT</p>
        <h1 className="book-section-title">
          {userVector
            ? "あなたに一番似ているのは…"
            : `この人は${ward.name}ちゃんタイプ！`}
        </h1>

        {userVector && percent !== null ? (
          /* ① 結果カード: 画像オーバーレイ＋キャッチ＋タグ＋導線でファーストビュー完結 */
          <div className="result-card" data-testid="result-card">
            <div className="result-card-visual">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="result-card-image"
                src={`/og/${slug}.jpg`}
                alt={`${ward.name}ちゃんの診断結果シェア画像`}
                width={1200}
                height={630}
              />
              <p className="result-card-overlay">
                <span className="result-card-overlay-name">
                  {ward.name}ちゃん
                </span>
                <span className="result-card-overlay-percent">
                  <span>にてる度</span>
                  <strong>{percent}%</strong>
                </span>
              </p>
            </div>
            <p className="result-card-lead">
              {theme.catch}
              {tags.length > 0 && (
                <span className="result-card-tags">
                  {tags.map((t) => (
                    <span key={t}>#{t}</span>
                  ))}
                </span>
              )}
            </p>
            <div className="result-card-actions">
              <a
                className="result-share-button"
                aria-label="Xで結果をシェアする"
                href={shareHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span aria-hidden="true">𝕏</span> で結果をシェアする
              </a>
              <Link className="result-detail-button" href={`/ward/${slug}/`}>
                詳しく見る
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="result-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="result-og-image"
                src={`/og/${slug}.jpg`}
                alt={`${ward.name}ちゃんの診断結果シェア画像`}
                width={1200}
                height={630}
              />
              <p className="result-character-line">{theme.catch}</p>
            </div>
            <div className="result-primary-action">
              <Link
                className="diagnosis-option result-share-link"
                href="/#diagnosis"
              >
                あなたも診断する
              </Link>
            </div>
          </>
        )}

        {/* ② あなたの特徴 */}
        {persona && userVector && (
          <section className="result-section result-type-section">
            <p className="result-section-kicker">YOUR TYPE</p>
            <h2>{ward.name}ちゃんタイプの特徴</h2>
            {traits.length > 0 && (
              <ul className="result-trait-list">
                {traits.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            <p className="result-type-description">
              タイプは「{persona.name}」。{persona.description}
            </p>
          </section>
        )}

        {/* ③ なぜこの結果になったか（ページ内で唯一のレーダー＋一致軸のみ） */}
        {userVector && matchedAxes && (
          <section className="result-section result-affinity-section">
            <p className="result-section-kicker">WHY WE MATCH</p>
            <h2>なぜ、{ward.name}ちゃんと相性がいいの？</h2>
            <div className="ward-detail-radar">
              <Radar
                vector={ward.axes}
                color={theme.color}
                overlay={userVector}
              />
            </div>
            <p className="result-radar-legend">
              <span className="result-legend-ward">{ward.name}ちゃん</span>
              <span className="result-legend-you">あなた</span>
            </p>
            <ul className="result-axis-compare-list">
              {matchedAxes.map((k) => {
                // 選定軸でも実際の差が大きい軸に「一致」を名乗らせない
                const matched = Math.abs(userVector[k] - ward.axes[k]) <= 0.5;
                return (
                  <li
                    key={k}
                    className={
                      matched
                        ? "result-axis-compare is-matched"
                        : "result-axis-compare"
                    }
                  >
                    <span className="result-axis-name">
                      {AXIS_LABELS[k].name}
                      {matched && (
                        <span className="result-axis-match-badge">
                          ここが一致！
                        </span>
                      )}
                    </span>
                    <div className="result-axis-track" aria-hidden="true">
                      <span
                        className="result-axis-marker is-ward"
                        style={{ left: `${trackPos(ward.axes[k])}%` }}
                      />
                      <span
                        className="result-axis-marker is-you"
                        style={{ left: `${trackPos(userVector[k])}%` }}
                      />
                    </div>
                    <span className="result-axis-ends" aria-hidden="true">
                      <span>{AXIS_LABELS[k].low}</span>
                      <span>{AXIS_LABELS[k].high}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            {affinityText && (
              <>
                <span className="result-ai-badge">AIによる相性解説</span>
                <p className="result-rationale">{affinityText}</p>
              </>
            )}
          </section>
        )}

        {/* ④ もっと詳しく（アコーディオン）。訪問者にも性格・ステータスは見せる */}
        <section className="result-section result-more-section">
          <p className="result-section-kicker">MORE</p>
          <h2>もっと詳しく</h2>
          {rationale && (
            <details className="result-accordion">
              <summary>性格を詳しく見る</summary>
              <div className="result-accordion-body">
                <span className="result-ai-badge">AIによるキャラクター設定</span>
                <p className="result-rationale">{rationale}</p>
              </div>
            </details>
          )}
          {userVector && matchedAxes && (matchedStats.length > 0 || policy) && (
            <details className="result-accordion">
              <summary>実はこんな街、{ward.name}</summary>
              <div className="result-accordion-body">
                {matchedStats.length > 0 && (
                  <div className="result-town-cards">
                    {matchedStats.map((stat) => (
                      <div key={stat.label} className="result-town-card">
                        <span className="result-town-card-label">
                          {stat.label}
                        </span>
                        <span className="result-town-card-value">
                          {stat.text}
                        </span>
                        <span className="result-town-card-rank">
                          23区{rankOf(stat.vs, stat.v)}位
                        </span>
                        {stat.note && (
                          <span className="result-town-card-note">
                            {stat.note}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {policy && (
                  <div className="result-town-policy">
                    <p className="result-town-policy-kicker">
                      {ward.name}ちゃんはこんなことを頑張ってる
                    </p>
                    <p className="result-town-policy-title">{policy.title}</p>
                    <p className="result-town-policy-summary">
                      {policy.summary}
                    </p>
                    <a
                      className="result-town-policy-source"
                      href={policy.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      出典: {policy.source}
                    </a>
                  </div>
                )}
              </div>
            </details>
          )}
          <details className="result-accordion">
            <summary>{ward.name}ちゃんのステータスを見る</summary>
            <div className="result-accordion-body">
              <div className="result-stat-list">
                {stats.map((stat) => (
                  <StatBar
                    key={stat.label}
                    label={stat.label}
                    valueText={stat.text}
                    rank={rankOf(stat.vs, stat.v)}
                    ratio={ratioToMean(stat.vs, stat.v)}
                    note={stat.note}
                  />
                ))}
              </div>
              <p className="stat-section-caption">
                バーの中央線＝23区平均。順位は値の大きい順。
              </p>
              <Link
                className="result-status-detail-link"
                href={`/ward/${slug}/`}
              >
                より詳しく見る
              </Link>
            </div>
          </details>
        </section>

        {/* ⑤ 似ているキャラクター */}
        {compatible.length > 0 && (
          <>
            <h2 className="result-ranking-title">
              相性ランキング — あなたと相性のいい区ちゃん
            </h2>
            <ol className="result-ranking">
              {compatible.map((m, i) => {
                const rankTheme = wardTheme(m.ward.code);
                const matchSlug = CODE_TO_SLUG[m.ward.code];
                return (
                  <li
                    key={m.ward.code}
                    style={{ ["--ward-color" as string]: rankTheme.color }}
                  >
                    <Link
                      className="result-rank-link"
                      href={`/ward/${matchSlug}/`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/og/${matchSlug}.jpg`}
                        alt={`${m.ward.name}ちゃんの詳細を見る`}
                        width={1200}
                        height={630}
                        loading="lazy"
                      />
                      <div className="result-rank-copy">
                        <span className="result-rank">相性 {i + 1}位</span>
                        <span className="result-rank-score">
                          にてる度 {compatPercents[i]}%
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </>
        )}

        {/* ⑥ 最後のシェアCTA（カード再掲なし） */}
        {userVector && (
          <section className="result-final-cta">
            <p>この結果、誰かに似ていませんか？</p>
            <a
              className="result-share-button"
              aria-label="Xで結果をシェアする"
              href={shareHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden="true">𝕏</span> で結果をシェアする
            </a>
          </section>
        )}
      </div>
      {userVector && (
        <div className="result-share-bar">
          <a
            className="result-share-button result-share-bar-button"
            aria-label="Xで結果をシェアする"
            href={shareHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span aria-hidden="true">𝕏</span> で結果をシェアする
          </a>
        </div>
      )}
    </main>
  );
}
