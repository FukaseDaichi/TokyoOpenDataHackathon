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
  });
  it('shows visitor view when the saved result belongs to a different ward', () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, '13101');
    render(<ResultPage slug="minato" />);
    expect(screen.queryByText(/相性ランキング/)).not.toBeInTheDocument();
    expect(screen.getByText(/あなたも診断する/)).toBeInTheDocument();
  });
});
