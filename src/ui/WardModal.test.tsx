import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

  it('renders the same stat bars as the ward detail page', () => {
    render(<WardModal ward={minato} detailHref="/ward/minato/" onClose={() => {}} />);

    for (const label of [
      '昼夜間人口比率',
      '高齢化率',
      '年少人口率',
      '一人当たり公立公園面積',
      '単身世帯率',
      '子育て世帯率',
      '財政力指数',
      '地価公示（住宅地平均）',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('ranks 港区 first on 財政力指数 (top of 23 wards)', () => {
    render(<WardModal ward={minato} detailHref="/ward/minato/" onClose={() => {}} />);

    // 港区 has the highest fiscal strength → rank 1 in at least one StatBar
    expect(screen.getAllByText('23区中 1位').length).toBeGreaterThanOrEqual(1);
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

  it('closes with the Escape key', () => {
    const onClose = vi.fn();
    render(<WardModal ward={minato} detailHref="/ward/minato/" onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe('with animations enabled (matchMedia available)', () => {
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

    it('shows the book cover with the ward name before opening', () => {
      const { container } = render(<WardModal ward={minato} detailHref="/ward/minato/" onClose={() => {}} />);

      const cover = container.querySelector('.ward-modal-cover');
      expect(cover).not.toBeNull();
      expect(cover!.textContent).toContain('うちの区ちゃん図鑑');
      expect(cover!.textContent).toContain('港区ちゃん');
    });

    const fireAnimationEnd = (el: Element, animationName: string) => {
      const evt = new Event('animationend', { bubbles: true });
      Object.assign(evt, { animationName });
      fireEvent(el, evt);
    };

    it('removes the cover once the opening animation finishes', () => {
      const { container } = render(<WardModal ward={minato} detailHref="/ward/minato/" onClose={() => {}} />);

      fireAnimationEnd(container.querySelector('.ward-modal-cover')!, 'wardModalCoverOpen');
      expect(container.querySelector('.ward-modal-cover')).toBeNull();
    });

    it('plays the closing animation before calling onClose', () => {
      const onClose = vi.fn();
      const { container } = render(<WardModal ward={minato} detailHref="/ward/minato/" onClose={onClose} />);

      fireEvent.click(screen.getByLabelText('とじる'));
      // 閉じアニメーション中はまだ閉じない
      expect(onClose).not.toHaveBeenCalled();
      expect(container.querySelector('.ward-modal-closing')).not.toBeNull();

      fireAnimationEnd(container.querySelector('.ward-modal-book')!, 'wardModalBookOut');
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
