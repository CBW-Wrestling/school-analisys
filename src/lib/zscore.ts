export function meanAndStdDev(values: number[]): { mean: number | null; stdDev: number | null } {
  if (!values.length) return { mean: null, stdDev: null }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const stdDev = values.length > 1 ? Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length) : null
  return { mean, stdDev }
}

export function zScoreFor(value: number | null, mean: number | null, stdDev: number | null): number | null {
  if (value === null || mean === null || !stdDev) return null
  return (value - mean) / stdDev
}

export const Z_SCORE_EXPLANATION = 'Compara o valor com a média nacional, em desvios-padrão. Verde é acima da média; vermelho é abaixo.'

export const VARIATION_EXPLANATION = 'Diferença entre o valor local e a média nacional. Positivo é acima; negativo é abaixo.'
