import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WardMap2D } from './WardMap2D';

describe('WardMap2D', () => {
  it('23区分のグループと複数のパスを描き、当該区名を表示する', () => {
    const { container } = render(<WardMap2D code="13103" />);
    // 23wards groups (g elements)
    expect(container.querySelectorAll('g.ward-map2d-ward')).toHaveLength(23);
    // Some wards have multiple rings, so paths >= 23
    expect(container.querySelectorAll('path.ward-map2d-shape').length).toBeGreaterThanOrEqual(23);
    expect(screen.getByText('港区')).toBeTruthy();
  });
  it('roleとaria-labelを持つ', () => {
    render(<WardMap2D code="13103" />);
    expect(screen.getByRole('img', { name: /港区の位置/ })).toBeTruthy();
  });
});
