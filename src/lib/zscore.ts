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

export const Z_SCORE_EXPLANATION = 'Mostra o quanto a pontuação média de um estado está acima ou abaixo da média nacional, em desvios-padrão. 0 = igual à média nacional; valores positivos (verde) indicam desempenho acima da média; negativos (vermelho), abaixo.'
