import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShareCard, xShareUrl } from './ShareCard';
import { loadWards } from '../data/wards';

describe('ShareCard', () => {
  it('shows ward name and group in a card', () => {
    const ward = loadWards()[0];
    render(<ShareCard ward={ward} />);
    const card = screen.getByTestId('share-card');
    expect(card).toHaveTextContent(ward.name);
    expect(card).toHaveTextContent(ward.group!);
  });

  it('builds an inviting X share message with the character line and both hashtags', () => {
    const ward = loadWards().find((w) => w.code === '13103')!;
    const url = new URL(xShareUrl(ward, 'https://example.com/result/minato/'));
    expect(url.hostname).toMatch(/(?:x|twitter)\.com$/);
    expect(url.searchParams.get('text')).toBe(
      '「港区ちゃん」っぽいらしい。財政力1.15の絶対王者、華やかセレブ\n#うちの区ちゃん\n#都知事杯オープンデータハッカソン',
    );
    expect(url.searchParams.get('url')).toBe('https://example.com/result/minato/');
  });
});
