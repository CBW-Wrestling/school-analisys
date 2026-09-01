export function pearsonCorrelation(pairs: { x: number; y: number }[]): number | null {
  if (pairs.length < 2) return null
  const n = pairs.length
  const sumX = pairs.reduce((sum, pair) => sum + pair.x, 0)
  const sumY = pairs.reduce((sum, pair) => sum + pair.y, 0)
  const sumXY = pairs.reduce((sum, pair) => sum + pair.x * pair.y, 0)
  const sumX2 = pairs.reduce((sum, pair) => sum + pair.x * pair.x, 0)
  const sumY2 = pairs.reduce((sum, pair) => sum + pair.y * pair.y, 0)
  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2))
  return denominator === 0 ? null : numerator / denominator
}
