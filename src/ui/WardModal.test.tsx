import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WardModal } from './WardModal';
import { loadWards } from '../data/wards';

vi.mock('next/link', () => ({
  default: ({ href, children, ...p }: any) => (
    <a href={href} {...p}>
      {children}
    </a>
  ),
}));

const wards = loadWards();
const minato = wards.find((w) => w.name === '港区')!;

describe('WardModal', () => {
  it('shows the ward name, dialog label, and detail CTA href', () => {
    render(<WardModal ward={minato} detailHref="/ward/minato/" onClose={() => {}} />);

    expect(screen.getByRole('heading', { name: '港区ちゃん' })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', '港区の詳細');

    const cta = screen.getByRole('link', { name: /港区ちゃんをくわしく見る/ });
    expect(cta).toHaveAttribute('href', '/ward/minato/');
  });

  it('renders all five axis stat rows with their source metrics', () => {
    render(<WardModal ward={minato} detailHref="/ward/minato/" onClose={() => {}} />);

    for (const label of ['昼夜間人口比率', '高齢化率 / 年少人口率', '一人当たり公立公園面積', '単身世帯率 / 子育て世帯率', '財政力指数']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('ranks 港区 first on 華やぎ (財政力指数, top of 23 wards)', () => {
    render(<WardModal ward={minato} detailHref="/ward/minato/" onClose={() => {}} />);

    // 港区 has the highest fiscal strength → luxury rank 1. The axis chip and the
    // stat badge both surface "1位"; assert at least one appears.
    const rankOnes = screen.getAllByText((_, node) => node?.textContent === '1位');
    expect(rankOnes.length).toBeGreaterThanOrEqual(1);
  });

  it('closes via the × button and the backdrop', () => {
    const onClose = vi.fn();
    render(<WardModal ward={minato} detailHref="/ward/minato/" onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('とじる'));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('does not close when the card itself is clicked', () => {
    const onClose = vi.fn();
    render(<WardModal ward={minato} detailHref="/ward/minato/" onClose={onClose} />);

    fireEvent.click(screen.getByRole('heading', { name: '港区ちゃん' }));
    expect(onClose).not.toHaveBeenCalled();
  });
});
