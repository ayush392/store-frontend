import { describe, expect, it } from 'vitest';
import { getChartScale } from './chartScale';

describe('getChartScale', () => {
  // Regression: an all-zero week used to divide by zero, and the first fix
  // still produced repeated labels (1, 1, 1, 0, 0).
  it('gives an all-zero week a 0-4 scale with distinct labels', () => {
    expect(getChartScale(0)).toEqual({ max: 4, ticks: [4, 3, 2, 1, 0] });
  });

  it('uses nice round steps', () => {
    expect(getChartScale(500)).toEqual({ max: 800, ticks: [800, 600, 400, 200, 0] });
    expect(getChartScale(9037)).toEqual({ max: 10000, ticks: [10000, 7500, 5000, 2500, 0] });
    expect(getChartScale(3)).toEqual({ max: 4, ticks: [4, 3, 2, 1, 0] });
  });

  it('always fits the largest value', () => {
    for (const v of [1, 7, 99, 101, 1303.77, 4591, 25000, 123456]) {
      expect(getChartScale(v).max).toBeGreaterThanOrEqual(v);
    }
  });

  it('never repeats a label', () => {
    for (const v of [0, 1, 2, 3, 5, 9, 11, 250, 999]) {
      const { ticks } = getChartScale(v);
      expect(new Set(ticks).size).toBe(ticks.length);
    }
  });
});
