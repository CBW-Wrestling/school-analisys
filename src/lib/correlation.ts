export const PEARSON_EXPLANATION = 'Mede o quanto duas variáveis andam juntas, de -1 a 1. Perto de 1 ou -1 é forte; perto de 0 é fraca.'

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

// Reta de regressão linear (mínimos quadrados), usada só para desenhar a tendência sobre a dispersão real.
export function regressionLine(pairs: { x: number; y: number }[]): { x: number; y: number }[] {
  if (pairs.length < 2) return []
  const n = pairs.length
  const sumX = pairs.reduce((sum, pair) => sum + pair.x, 0)
  const sumY = pairs.reduce((sum, pair) => sum + pair.y, 0)
  const sumXY = pairs.reduce((sum, pair) => sum + pair.x * pair.y, 0)
  const sumX2 = pairs.reduce((sum, pair) => sum + pair.x * pair.x, 0)
  const denominator = n * sumX2 - sumX ** 2
  if (denominator === 0) return []
  const slope = (n * sumXY - sumX * sumY) / denominator
  const intercept = (sumY - slope * sumX) / n
  const xs = pairs.map((pair) => pair.x)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  return [{ x: minX, y: slope * minX + intercept }, { x: maxX, y: slope * maxX + intercept }]
}

