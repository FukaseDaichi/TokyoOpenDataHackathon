import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WardMapSection } from './WardMapSection';

describe('WardMapSection', () => {
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

  it('WebGL不可環境では2D地図を表示する', async () => {
    render(<WardMapSection code="13103" />);
    expect(await screen.findByRole('img', { name: /港区の位置/ })).toBeTruthy();
  });
});
