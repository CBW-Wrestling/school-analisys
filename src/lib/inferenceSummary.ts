export function lowestScoringCompetencia(items: { competencia: string; score: number | null }[]): { competencia: string; score: number } | null {
  const scored = items.filter((item): item is { competencia: string; score: number } => item.score !== null)
  if (!scored.length) return null
  return scored.reduce((lowest, current) => (current.score < lowest.score ? current : lowest))
}

export function buildInferenceSummary(overallAverage: number | null, items: { competencia: string; score: number | null }[]): string {
  if (overallAverage === null) return 'Ainda não há dados técnicos suficientes para uma inferência.'
  const lowest = lowestScoringCompetencia(items)
  const breakdown = items
    .filter((item): item is { competencia: string; score: number } => item.score !== null)
    .map((item) => `${item.competencia}: ${item.score.toFixed(2)}`)
    .join(', ')
  const base = `Com média geral de ${overallAverage.toFixed(2)} (máx=2)${breakdown ? `, sendo ${breakdown}` : ''}`
  return lowest ? `${base}, infere-se que a principal deficiência está em ${lowest.competencia}.` : `${base}.`
}
