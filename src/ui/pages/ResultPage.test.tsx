import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

describe("ResultPage", () => {
  beforeEach(() => sessionStorage.clear());
  it("shows visitor view (CTA, no ranking) without a saved diagnosis", () => {
    render(<ResultPage slug="minato" />);
    // h1タイトル・ward名・リンク文言のすべてに「港区ちゃん」が含まれるため複数マッチする
    expect(screen.getAllByText(/港区ちゃん/).length).toBeGreaterThan(0);
    expect(screen.getByText(/あなたも診断する/)).toBeInTheDocument();
    expect(screen.queryByText(/相性ランキング/)).not.toBeInTheDocument();
  });
  it("shows owner view (ranking + share) with a saved diagnosis", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    expect(screen.getByText(/相性ランキング/)).toBeInTheDocument();
    // ヒーローはOGP横長画像ではなくキャラ立ち絵カード
    expect(
      screen.getByRole("img", { name: "港区ちゃん" }),
    ).toHaveAttribute("src", "/characters/ssr/minato-w896.webp");
    expect(screen.getByText("キャラクター設定理由")).toBeInTheDocument();
    expect(
      screen.getAllByText(/1を超えるほど自前の税収/).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("昼夜間人口比率")).toBeInTheDocument();
    const rankLinks = screen.getAllByRole("img", {
      name: /ちゃんの詳細を見る/,
    });
    expect(rankLinks).toHaveLength(3);
    expect(rankLinks[0].closest("a")).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/ward\/.+\/$/),
    );
    expect(
      screen.getByRole("link", { name: "より詳しく見る" }),
    ).toHaveAttribute("href", "/ward/minato/");
  });
  it("shows similarity percent, type name, and match badges in the hero card", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    const card = screen.getByTestId("result-card");
    expect(card).toHaveTextContent(/にてる度\d+%/);
    expect(card).toHaveTextContent(/華やか志向タイプ/);
    expect(card).toHaveTextContent(/が一致/);
  });
  it("keeps the OGP hero and diagnosis CTA for visitors", () => {
    render(<ResultPage slug="minato" />);
    expect(screen.queryByTestId("result-card")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "港区ちゃんの診断結果シェア画像" }),
    ).toHaveAttribute("src", "/og/minato.jpg");
    expect(screen.getByText(/あなたも診断する/)).toBeInTheDocument();
  });
  it("shows persona type, match reasons, and town hooks with a saved diagnosis", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    // ① あなたのタイプ（luxuryのみ閾値超え → 華やか志向タイプ）
    // ヒーローカードにも同じタイプ名が出るため、見出しに絞って一意にする
    expect(
      screen.getByRole("heading", { name: /華やか志向タイプ/ }),
    ).toBeInTheDocument();
    // ② なぜ相性がいいの？ 一致軸2つのハイライトとAI相性文（港×華やぎ）
    expect(
      screen.getByText(/なぜ、港区ちゃんと相性がいいの/),
    ).toBeInTheDocument();
    expect(screen.getAllByText("ここが一致！")).toHaveLength(2);
    expect(
      screen.getByText(/華やかさで応えてくれる度合いなら/),
    ).toBeInTheDocument();
    // ③ 実はこんな街: 一致軸（華やぎ→財政力指数1位 / 世帯→単身世帯率10位）のカードと政策
    expect(screen.getByText(/実はこんな街/)).toBeInTheDocument();
    expect(screen.getByText("23区1位")).toBeInTheDocument();
    expect(screen.getByText("23区10位")).toBeInTheDocument();
    expect(screen.getByText(/はぐくむまち/)).toBeInTheDocument();
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
  it("hides persona type and match sections for visitors", () => {
    render(<ResultPage slug="minato" />);
    expect(
      screen.queryByText(/あなたのタイプ|YOUR TYPE/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/相性がいいの/)).not.toBeInTheDocument();
    expect(screen.queryByText(/実はこんな街/)).not.toBeInTheDocument();
  });
  it("shows visitor view when the saved result belongs to a different ward", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13101");
    render(<ResultPage slug="minato" />);
    expect(screen.queryByText(/相性ランキング/)).not.toBeInTheDocument();
    expect(screen.getByText(/あなたも診断する/)).toBeInTheDocument();
  });
});
