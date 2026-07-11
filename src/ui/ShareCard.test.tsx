import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShareCard } from './ShareCard';
import { loadWards } from '../data/wards';

describe('ShareCard', () => {
  it('shows ward name and group in a card', () => {
    const ward = loadWards()[0];
    render(<ShareCard ward={ward} />);
    const card = screen.getByTestId('share-card');
    expect(card).toHaveTextContent(ward.name);
    expect(card).toHaveTextContent(ward.group!);
  });
});
