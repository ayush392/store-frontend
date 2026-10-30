// Y-axis scale for the weekly chart: 4 equal steps from 0, where the step is
// a "nice" number (1, 2, 2.5 or 5 x 10^n). Labels never repeat, and an
// all-zero week still gets a usable 0-4 scale instead of dividing by zero.
const STEPS = 4;

const niceStep = (rough: number) => {
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  const nice = [1, 2, 2.5, 5, 10].find((n) => residual <= n) ?? 10;
  return nice * magnitude;
};

export const getChartScale = (rawMax: number) => {
  const step = rawMax > 0 ? niceStep(rawMax / STEPS) : 1;
  const max = step * STEPS;
  // Top to bottom, as the axis is drawn.
  const ticks = Array.from({ length: STEPS + 1 }, (_, i) => max - i * step);
  return { max, ticks };
};
