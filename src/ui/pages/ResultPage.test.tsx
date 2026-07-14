import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultPage } from './ResultPage';
import { saveDiagnosis } from '../../lib/diagnosisSession';
import { emptyVector } from '../../domain/axes';

vi.mock('next/link', () => ({ default: ({ href, children, ...p }: any) => <a href={href} {...p}>{children}</a> }));

describe('ResultPage', () => {
  beforeEach(() => sessionStorage.clear());
  it('shows visitor view (CTA, no ranking) without a saved diagnosis', () => {
    render(<ResultPage slug="minato" />);
    // h1タイトル・ward名・リンク文言のすべてに「港区ちゃん」が含まれるため複数マッチする
    expect(screen.getAllByText(/港区ちゃん/).length).toBeGreaterThan(0);
    expect(screen.getByText(/あなたも診断する/)).toBeInTheDocument();
    expect(screen.queryByText(/相性ランキング/)).not.toBeInTheDocument();
  });
  it('shows owner view (ranking + share) with a saved diagnosis', () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, '13103');
    render(<ResultPage slug="minato" />);
    expect(screen.getByText(/相性ランキング/)).toBeInTheDocument();
    expect(screen.getByText(/Xで結果をシェアする/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '港区ちゃんの診断結果シェア画像' })).toHaveAttribute('src', '/og/minato.jpg');
    expect(screen.getByText(/なぜ、このキャラクター/)).toBeInTheDocument();
    expect(screen.getByText('昼夜間人口比率')).toBeInTheDocument();
    const rankLinks = screen.getAllByRole('img', { name: /ちゃんの詳細を見る/ });
    expect(rankLinks).toHaveLength(3);
    expect(rankLinks[0].closest('a')).toHaveAttribute('href', expect.stringMatching(/^\/ward\/.+\/$/));
    expect(screen.getByRole('link', { name: 'より詳しく見る' })).toHaveAttribute('href', '/ward/minato/');
  });
  it('shows visitor view when the saved result belongs to a different ward', () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, '13101');
    render(<ResultPage slug="minato" />);
    expect(screen.queryByText(/相性ランキング/)).not.toBeInTheDocument();
    expect(screen.getByText(/あなたも診断する/)).toBeInTheDocument();
  });
});
