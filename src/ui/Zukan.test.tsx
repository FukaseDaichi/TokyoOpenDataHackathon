import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Zukan } from './Zukan';

describe('Zukan', () => {
  it('renders all 23 ward cards as buttons', () => {
    render(<Zukan onSelect={() => {}} />);
    expect(screen.getByText('千代田区')).toBeInTheDocument();
    expect(screen.getByText('江戸川区')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(23);
  });
});
