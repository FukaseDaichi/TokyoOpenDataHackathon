import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Zukan, zukanNo } from './Zukan';

describe('zukanNo', () => {
  it('JIS区コード順で2桁ゼロ埋めのNo.を返す', () => {
    expect(zukanNo(0)).toBe('No.01');
    expect(zukanNo(22)).toBe('No.23');
  });
});

describe('Zukan', () => {
  it('23区分のカードを描画する', () => {
    render(<Zukan onSelect={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(23);
    expect(screen.getByRole('button', { name: '千代田区の詳細を見る' })).toBeInTheDocument();
  });

  it('系統ラベルを表示しない', () => {
    const { container } = render(<Zukan onSelect={() => {}} />);
    expect(screen.queryByText(/^系統/)).not.toBeInTheDocument();
    expect(container.querySelector('.zukan-card-group')).toBeNull();
  });

  it('ネームプレートに区名とキャッチコピーを持つ', () => {
    const { container } = render(<Zukan onSelect={() => {}} />);
    const card = screen.getByRole('button', { name: '千代田区の詳細を見る' });
    expect(card.querySelector('.zukan-card-plate .zukan-card-name')).toHaveTextContent('千代田区');
    // キャッチコピーはホバー環境でCSS表示する前提でDOMには常に置く
    expect(card.querySelector('.zukan-card-catch')).toHaveTextContent(
      '昼は人口約13.6倍、夜は静寂を愛す二面性エリート'
    );
    // シャイン用の装飾要素（全カード分）
    expect(container.querySelectorAll('.zukan-card-shine')).toHaveLength(23);
  });

  it('カードに区テーマカラーのCSS変数を設定する', () => {
    render(<Zukan onSelect={() => {}} />);
    const minato = screen.getByRole('button', { name: '港区の詳細を見る' });
    expect(minato.getAttribute('style')).toContain('--ward-color: #e8c56b');
  });

  it('クリックで対象の区をonSelectへ渡す', () => {
    const onSelect = vi.fn();
    render(<Zukan onSelect={onSelect} />);
    screen.getByRole('button', { name: '新宿区の詳細を見る' }).click();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].name).toBe('新宿区');
  });
});

describe('Zukan タッチ環境のスクロールシャイン', () => {
  class MockIntersectionObserver {
    static instances: MockIntersectionObserver[] = [];
    callback: IntersectionObserverCallback;
    observed: Element[] = [];
    constructor(cb: IntersectionObserverCallback) {
      this.callback = cb;
      MockIntersectionObserver.instances.push(this);
    }
    observe(el: Element) {
      this.observed.push(el);
    }
    unobserve(el: Element) {
      this.observed = this.observed.filter((e) => e !== el);
    }
    disconnect() {
      this.observed = [];
    }
  }

  const stubMedia = (opts: { hoverNone: boolean; reduced: boolean }) => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('hover: none') ? opts.hoverNone : opts.reduced,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  };

  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('ホバー不可環境では画面に入ったカードに is-shine を1回だけ付ける', () => {
    stubMedia({ hoverNone: true, reduced: false });
    const { container } = render(<Zukan onSelect={() => {}} />);

    const io = MockIntersectionObserver.instances[0];
    expect(io).toBeDefined();
    expect(io.observed).toHaveLength(23);

    const card = container.querySelector('.zukan-card')!;
    io.callback(
      [{ target: card, isIntersecting: true } as unknown as IntersectionObserverEntry],
      io as unknown as IntersectionObserver
    );
    expect(card.classList.contains('is-shine')).toBe(true);
    // 付与後はunobserveされ再発火しない
    expect(io.observed).toHaveLength(22);
  });

  it('ホバー可能環境ではObserverを起動しない', () => {
    stubMedia({ hoverNone: false, reduced: false });
    render(<Zukan onSelect={() => {}} />);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('reduced motion環境ではObserverを起動しない', () => {
    stubMedia({ hoverNone: true, reduced: true });
    render(<Zukan onSelect={() => {}} />);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });
});
