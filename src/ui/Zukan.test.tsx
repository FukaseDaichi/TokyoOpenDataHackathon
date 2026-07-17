import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
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
      '昼だけ人口20倍、夜は静寂を愛す二面性エリート'
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
