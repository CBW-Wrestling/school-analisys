import type { CountByCode, PhysicalRow, ResultRow } from '../types'
import { parseMetric, type PhysicalRowWithTier, type WeightTier } from '../lib/physicalMetrics'

// Gera um número estável (0-1) a partir de uma string, evitando Math.random em cada render.
function seededRandom(seed: string): number {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  return (hash % 1000) / 1000
}

// MOCK: remover quando /api/dashboard/motor/athlete-scores existir (ver BACKEND_GAPS.md, GAP 1).
// Só a pontuação é sintética; entryId/rank/wins/pontos técnicos usados junto são reais (vindos de /api/results).
export function mockAthleteMotorScores(results: ResultRow[]): { entryId: string; averageScore: number }[] {
  return results.map((row) => ({
    entryId: row.entryId,
    averageScore: Number((0.6 + seededRandom(row.entryId) * 1.4).toFixed(2)),
  }))
}

// MOCK: remover quando PhysicalRowDto/PhysicalSummaryDto expuserem weightTier real (ver BACKEND_GAPS.md, GAP 2).
// Heurística por percentil (33%/66%) do campo `peso` dentro de cada estilo — aproximação, não a regra de negócio real.
export function mockWeightTier(rows: PhysicalRow[]): PhysicalRowWithTier[] {
  const styles = [...new Set(rows.map((row) => row.estilo).filter((value): value is string => Boolean(value)))]
  const tierByRow = new Map<PhysicalRow, WeightTier>()
  for (const style of styles) {
    const styleRows = rows.filter((row) => row.estilo === style)
    const sorted = [...styleRows].sort((first, second) => (parseMetric(first.peso) ?? 0) - (parseMetric(second.peso) ?? 0))
    sorted.forEach((row, index) => {
      const percentile = sorted.length > 1 ? index / (sorted.length - 1) : 0
      tierByRow.set(row, percentile < 0.33 ? 'LEVE' : percentile < 0.66 ? 'MEDIO' : 'PESADO')
    })
  }
  return rows.map((row) => ({ ...row, tier: tierByRow.get(row) ?? 'MEDIO' }))
}

// MOCK: remover quando ProfileSummaryDto expuser byOtherSport real (ver BACKEND_GAPS.md, GAP 4).
// Distribui o total real de practicesOtherSport entre modalidades plausíveis, mantendo a soma igual ao total.
const OTHER_SPORT_LABELS = ['Judô', 'Jiu-Jitsu', 'Capoeira', 'MMA', 'Vôlei', 'Outra'] as const
const OTHER_SPORT_WEIGHTS = [0.32, 0.28, 0.14, 0.12, 0.08, 0.06]

export function mockOtherSportBreakdown(total: number): CountByCode[] {
  if (!total) return []
  const counts = OTHER_SPORT_WEIGHTS.map((weight) => Math.round(weight * total))
  const roundingDiff = total - counts.reduce((sum, value) => sum + value, 0)
  counts[0] += roundingDiff
  return OTHER_SPORT_LABELS.map((label, index) => ({ code: label, label, count: Math.max(0, counts[index]) }))
}
