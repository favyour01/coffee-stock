export function calculateMovingAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

export function predictNextMonth(historicalUsage: number[]): number {
  return calculateMovingAverage(historicalUsage.slice(-3));
}
