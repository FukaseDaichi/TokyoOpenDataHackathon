import { describe, it, expect } from 'vitest';
import { kmeans } from './cluster';
import { emptyVector, type Ward } from '../domain/axes';

const w = (name: string, liveliness: number): Ward => ({
  code: name, name, axes: { ...emptyVector(), liveliness },
});

describe('kmeans', () => {
  it('separates two obvious clusters', () => {
    // 2 low + 2 high on liveliness, k=2, seeds = first 2 (one low, one high)
    const wards = [w('lowA', -1), w('highA', 1), w('lowB', -0.9), w('highB', 0.9)];
    const labels = kmeans(wards, 2);
    expect(labels[0]).toBe(labels[2]); // lowA, lowB same cluster
    expect(labels[1]).toBe(labels[3]); // highA, highB same cluster
    expect(labels[0]).not.toBe(labels[1]);
  });
  it('is deterministic for the same input', () => {
    const wards = [w('a', -1), w('b', 1), w('c', -0.8), w('d', 0.7), w('e', 0.1)];
    expect(kmeans(wards, 3)).toEqual(kmeans(wards, 3));
  });
});
