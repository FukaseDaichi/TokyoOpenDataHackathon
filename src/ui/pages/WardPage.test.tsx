import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { WardPage } from './WardPage';

vi.mock('next/link', () => ({ default: ({ href, children, ...p }: any) => <a href={href} {...p}>{children}</a> }));

describe('WardPage', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders stats with rank and land price for Minato', () => {
    render(<WardPage slug="minato" />);
    expect(screen.getByText(/港区ちゃん/)).toBeInTheDocument();
    // 設定理由文にも「財政力指数」が含まれるため複数ヒットを許容
    expect(screen.getAllByText(/財政力指数/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/23区中 1位/).length).toBeGreaterThanOrEqual(1); // 財政力1.15は最大
    // 出典欄にも「地価公示」の語が含まれるため複数ヒットする（getAllByTextで許容）
    expect(screen.getAllByText(/地価公示/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('アジサイ、バラ')).toBeInTheDocument();
    expect(screen.getByText('ハナミズキ')).toBeInTheDocument();
  });
  it('renders AI character rationale section', () => {
    render(<WardPage slug="chiyoda" />);
    expect(screen.getByText('キャラクター設定理由')).toBeInTheDocument();
    expect(screen.getByText('AIによるキャラクター設定')).toBeInTheDocument();
    expect(screen.getByText(/昼夜間人口比率1355%/)).toBeInTheDocument();
  });
  it('links to fellow wards of the same group', () => {
    // 港区は実データのk-means分類で単独クラスタ（きらめきセレブ系）になるため、
    // 複数区が同一系統になる新宿区（にぎやか繁華街系）でなかまリンクを検証する
    render(<WardPage slug="shinjuku" />);
    expect(screen.getByText(/おなじ系統のなかま/)).toBeInTheDocument();
  });
  it('shows the book header nav and drops the old zukan back link', () => {
    render(<WardPage slug="minato" />);
    const nav = screen.getByRole('navigation', { name: 'サイトナビゲーション' });
    expect(within(nav).getByRole('link', { name: 'トップページにもどる' })).toHaveAttribute('href', '/');
    expect(within(nav).getByRole('link', { name: '診断' })).toHaveAttribute('href', '/#diagnosis');
    expect(within(nav).getByRole('link', { name: '図鑑' })).toHaveAttribute('href', '/#zukan');
    expect(screen.queryByText('← 図鑑にもどる')).not.toBeInTheDocument();
  });
});
