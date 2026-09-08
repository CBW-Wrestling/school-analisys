import type { PhysicalRow } from '../types'

export const ENGAGEMENT_EXPLANATION = 'Percentual de atletas com avaliação física registrada. Quanto maior, mais completa é a base.'

export function parseMetric(value: string | null): number | null {
  if (!value) return null
  const parsed = Number.parseFloat(value.replace(',', '.').replace(/[^0-9.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

export function average(values: (number | null)[]): number | null {
  const numbers = values.filter((value): value is number => value !== null)
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : null
}

export type WeightTier = 'LEVE' | 'MEDIO' | 'PESADO'

export const WEIGHT_TIER_LABEL: Record<WeightTier, string> = {
  LEVE: 'Leve',
  MEDIO: 'Médio',
  PESADO: 'Pesado',
}

export type PhysicalRowWithTier = PhysicalRow & { tier: WeightTier }

export type StyleTierAverages = {
  estilo: string
  tier: WeightTier | null
  count: number
  enverguturaCm: number | null
  estaturaCm: number | null
  prensaoManualD: number | null
  prensaoManualE: number | null
}

function averagesFor(estilo: string, tier: WeightTier | null, rows: PhysicalRow[]): StyleTierAverages {
  return {
    estilo,
    tier,
    count: rows.length,
    enverguturaCm: average(rows.map((row) => parseMetric(row.enverguturaCm))),
    estaturaCm: average(rows.map((row) => parseMetric(row.estaturaCm))),
    prensaoManualD: average(rows.map((row) => parseMetric(row.prensaoManualD))),
    prensaoManualE: average(rows.map((row) => parseMetric(row.prensaoManualE))),
  }
}

// Agrega médias por estilo (linha-mãe) e por estilo × tier de peso (sub-linhas).
export function aggregateByStyleAndTier(rows: PhysicalRowWithTier[]): { estilo: string; overall: StyleTierAverages; tiers: StyleTierAverages[] }[] {
  const styles = [...new Set(rows.map((row) => row.estilo).filter((value): value is string => Boolean(value)))].sort()
  return styles.map((estilo) => {
    const styleRows = rows.filter((row) => row.estilo === estilo)
    const tiers: WeightTier[] = ['LEVE', 'MEDIO', 'PESADO']
    return {
      estilo,
      overall: averagesFor(estilo, null, styleRows),
      tiers: tiers.map((tier) => averagesFor(estilo, tier, styleRows.filter((row) => row.tier === tier))),
    }
  })
}

export type StyleWeightRow = {
  estilo: string
  peso: string | null
  count: number
  enverguturaCm: number | null
  estaturaCm: number | null
  prensaoManualD: number | null
  prensaoManualE: number | null
  forearmRightCm: number | null
  forearmLeftCm: number | null
}

function weightAverages(estilo: string, peso: string | null, rows: PhysicalRow[]): StyleWeightRow {
  return {
    estilo,
    peso,
    count: rows.length,
    enverguturaCm: average(rows.map((row) => parseMetric(row.enverguturaCm))),
    estaturaCm: average(rows.map((row) => parseMetric(row.estaturaCm))),
    prensaoManualD: average(rows.map((row) => parseMetric(row.prensaoManualD))),
    prensaoManualE: average(rows.map((row) => parseMetric(row.prensaoManualE))),
    forearmRightCm: average(rows.map((row) => parseMetric(row.forearmRightCm))),
    forearmLeftCm: average(rows.map((row) => parseMetric(row.forearmLeftCm))),
  }
}

// Agrega médias por estilo (linha-mãe) e por estilo × categoria de peso em kg (sub-linhas).
export function aggregateByStyleAndWeight(rows: PhysicalRow[]): { estilo: string; overall: StyleWeightRow; weights: StyleWeightRow[] }[] {
  const styles = [...new Set(rows.map((row) => row.estilo).filter((value): value is string => Boolean(value)))].sort()
  return styles.map((estilo) => {
    const styleRows = rows.filter((row) => row.estilo === estilo)
    const weightValues = [...new Set(styleRows.map((row) => row.peso).filter((value): value is string => Boolean(value)))].sort((a, b) => {
      const na = Number.parseFloat(a), nb = Number.parseFloat(b)
      return Number.isFinite(na) && Number.isFinite(nb) ? na - nb : a.localeCompare(b)
    })
    return {
      estilo,
      overall: weightAverages(estilo, null, styleRows),
      weights: weightValues.map((peso) => weightAverages(estilo, peso, styleRows.filter((row) => row.peso === peso))),
    }
  })
}
