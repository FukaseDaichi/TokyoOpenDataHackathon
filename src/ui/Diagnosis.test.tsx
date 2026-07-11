import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Diagnosis } from './Diagnosis';

describe('Diagnosis', () => {
  it('advances through 10 questions then calls onComplete', () => {
    const onComplete = vi.fn();
    render(<Diagnosis onComplete={onComplete} />);
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getAllByRole('button')[0]); // always pick first option
    }
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
  it('shows progress', () => {
    render(<Diagnosis onComplete={() => {}} />);
    expect(screen.getByText(/1\s*\/\s*10/)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByText(/2\s*\/\s*10/)).toBeInTheDocument();
  });
});
