import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import { ResultPage } from "./ResultPage";
import { saveDiagnosis } from "../../lib/diagnosisSession";
import { emptyVector } from "../../domain/axes";

vi.mock("next/link", () => ({
  default: ({ href, children, ...p }: any) => (
    <a href={href} {...p}>
      {children}
    </a>
  ),
}));

// prefersReducedMotion をテストから切り替える（jsdomにmatchMediaが無いためモック必須。
// 既存テストは即時に最終値が表示される reduced=true を既定とする）
const { reducedState } = vi.hoisted(() => ({ reducedState: { value: true } }));
vi.mock("../../hero/quality", () => ({
  prefersReducedMotion: () => reducedState.value,
}));

describe("ResultPage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    reducedState.value = true;
  });
  afterEach(() => cleanup());

  it("shows visitor view (CTA, no ranking, no result card) without a saved diagnosis", () => {
    const { container } = render(<ResultPage slug="minato" />);
    expect(screen.getAllByText(/港区ちゃん/).length).toBeGreaterThan(0);
    expect(screen.getByText(/あなたも診断する/)).toBeInTheDocument();
    expect(screen.queryByText(/相性ランキング/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("result-card")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "港区ちゃんの診断結果シェア画像" }),
    ).toHaveAttribute("src", "/og/minato.jpg");
    // 訪問者にも「もっと詳しく」アコーディオン（性格・ステータス）は見える
    expect(container.querySelectorAll("details.result-accordion")).toHaveLength(2);
    expect(screen.queryByText(/タイプの特徴/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /で結果をシェアする/ }),
    ).not.toBeInTheDocument();
  });

  it("shows the result card with overlay name+percent, catch, tags and actions", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    const card = screen.getByTestId("result-card");
    // 画像上のオーバーレイに区名とにてる度
    const overlay = card.querySelector(".result-card-overlay")!;
    expect(overlay).toHaveTextContent("港区ちゃん");
    expect(overlay).toHaveTextContent(/にてる度\d+%/);
    // キャッチコピーとハッシュタグ（一致軸2本の極ラベル）
    expect(card).toHaveTextContent(/財政力1\.15の絶対王者/);
    expect(card.querySelectorAll(".result-card-tags span")).toHaveLength(2);
    expect(card).toHaveTextContent(/#華やか志向/);
    // カード内のシェアと詳細導線
    expect(
      within(card as HTMLElement).getByRole("link", { name: /で結果をシェアする/ }),
    ).toBeInTheDocument();
    expect(
      within(card as HTMLElement).getByRole("link", { name: "詳しく見る" }),
    ).toHaveAttribute("href", "/ward/minato/");
  });

  it("shows traits and persona summary in the type section", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    const heading = screen.getByText("港区ちゃんタイプの特徴");
    const section = heading.closest("section")!;
    expect(section.querySelectorAll(".result-trait-list li")).toHaveLength(3);
    expect(screen.getByText(/タイプは「華やか志向タイプ」/)).toBeInTheDocument();
  });

  it("renders exactly one radar and only matched-axis tracks", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    const { container } = render(<ResultPage slug="minato" />);
    expect(container.querySelectorAll(".ward-detail-radar")).toHaveLength(1);
    expect(container.querySelectorAll(".result-axis-compare")).toHaveLength(2);
    expect(
      screen.getByText(/なぜ、港区ちゃんと相性がいいの/),
    ).toBeInTheDocument();
    expect(screen.getAllByText("ここが一致！")).toHaveLength(2);
    expect(
      screen.getByText(/華やかさで応えてくれる度合いなら/),
    ).toBeInTheDocument();
  });

  it("badges only axes that are actually close (matched axis with a wide gap gets no badge)", () => {
    // 新宿: family差0（一致）だがliveliness差0.86（遠い）→ バッジは1つだけ
    saveDiagnosis(
      { ...emptyVector(), liveliness: 0.6, family: -1, greenery: -0.2 },
      "13104",
    );
    render(<ResultPage slug="shinjuku" />);
    expect(screen.getAllByText("ここが一致！")).toHaveLength(1);
  });

  it("puts detail content into three accordions for owners", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    const { container } = render(<ResultPage slug="minato" />);
    expect(container.querySelectorAll("details.result-accordion")).toHaveLength(3);
    expect(screen.getByText("性格を詳しく見る")).toBeInTheDocument();
    expect(screen.getByText(/実はこんな街、港区/)).toBeInTheDocument();
    expect(screen.getByText("港区ちゃんのステータスを見る")).toBeInTheDocument();
    // 中身（閉じていてもDOMには存在する）
    expect(screen.getByText("昼夜間人口比率")).toBeInTheDocument();
    expect(screen.getByText("23区1位")).toBeInTheDocument();
    expect(screen.getByText(/はぐくむまち/)).toBeInTheDocument();
    expect(
      screen.getAllByText(/1を超えるほど自前の税収/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: "より詳しく見る" }),
    ).toHaveAttribute("href", "/ward/minato/");
  });

  it("keeps compatibility percents strictly below the result percent", () => {
    // 港区が距離最小になりにくい正反対のベクトルでも、表示上の逆転が起きない
    saveDiagnosis({ ...emptyVector(), liveliness: -1, luxury: -1 }, "13103");
    render(<ResultPage slug="minato" />);
    const strong = screen
      .getByTestId("result-card")
      .querySelector(".result-card-overlay-percent strong")!;
    const cardPercent = Number(strong.textContent!.replace("%", ""));
    const rankPercents = screen
      .getAllByText(/にてる度 \d+%/)
      .map((el) => Number(el.textContent!.match(/(\d+)%/)![1]));
    expect(rankPercents).toHaveLength(3);
    for (const p of rankPercents) expect(p).toBeLessThan(cardPercent);
  });

  it("shows ranking cards with ward OGP images", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    expect(screen.getByText(/相性ランキング/)).toBeInTheDocument();
    const rankLinks = screen.getAllByRole("img", { name: /ちゃんの詳細を見る/ });
    expect(rankLinks).toHaveLength(3);
    expect(rankLinks[0].closest("a")).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/ward\/.+\/$/),
    );
  });

  it("shows share CTA three times (card + final CTA + mobile bar) with personalized text", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    expect(screen.getByText(/この結果、誰かに似ていませんか/)).toBeInTheDocument();
    const shareLinks = screen.getAllByRole("link", { name: /で結果をシェアする/ });
    expect(shareLinks).toHaveLength(3);
    for (const link of shareLinks) {
      const url = new URL(link.getAttribute("href")!);
      const text = url.searchParams.get("text")!;
      expect(text).toContain("にてる度");
      expect(text).toContain("タイプは「華やか志向タイプ」");
      expect(text).toContain("#うちの区ちゃん");
      expect(text).toContain("#都知事杯オープンデータハッカソン");
    }
  });

  it("shows visitor view when the saved result belongs to a different ward", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13101");
    render(<ResultPage slug="minato" />);
    expect(screen.queryByText(/相性ランキング/)).not.toBeInTheDocument();
    expect(screen.getByText(/あなたも診断する/)).toBeInTheDocument();
  });

  it("shows the final percent immediately (no count-up) when prefers-reduced-motion is on", () => {
    reducedState.value = true;
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    const strong = screen
      .getByTestId("result-card")
      .querySelector(".result-card-overlay-percent strong")!;
    expect(strong.textContent).toMatch(/^\d+%$/);
    expect(strong.textContent).not.toBe("0%");
  });

  it("kicks off a count-up rAF loop (cleaned up on unmount) when motion is enabled", () => {
    reducedState.value = false;
    const rafSpy = vi.spyOn(window, "requestAnimationFrame");
    const cafSpy = vi.spyOn(window, "cancelAnimationFrame");
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    const { unmount } = render(<ResultPage slug="minato" />);
    expect(rafSpy).toHaveBeenCalled();
    unmount();
    expect(cafSpy).toHaveBeenCalled();
    rafSpy.mockRestore();
    cafSpy.mockRestore();
  });

  it("renders the confetti burst only for the diagnosis-origin result card", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    const confetti = screen.getByTestId("result-confetti");
    expect(confetti).toHaveAttribute("aria-hidden", "true");
    expect(
      confetti.querySelectorAll(".result-confetti-piece"),
    ).toHaveLength(20);
  });

  it("does not render confetti for a direct share-link visit (no saved diagnosis)", () => {
    render(<ResultPage slug="minato" />);
    expect(screen.queryByTestId("result-confetti")).not.toBeInTheDocument();
  });
});
