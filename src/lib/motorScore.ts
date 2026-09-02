import type { MotorRow } from '../types'

export const RESULT_SCORE: Record<string, number> = {
  COMPLETE: 2,
  INCOMPLETE: 1,
  DID_NOT_DO: 0,
  DOES_NOT_KNOW: 0,
}

export function excludedMovements(style: string | null): Set<string> {
  const normalized = (style ?? '').toUpperCase()
  if (normalized === 'GR') return new Set(['CRUZETA', 'DOUBLE_LEG'])
  if (normalized === 'FS' || normalized === 'WW') return new Set(['ARRANCO'])
  return new Set()
}

export function visibleMotorRows(rows: MotorRow[], style?: string | null): MotorRow[] {
  return rows.filter((row) => {
    const styleKey = (style ?? row.estilo ?? '').toUpperCase()
    const movement = (row.avaliacao ?? '').toUpperCase()
    const rowExcluded = excludedMovements(styleKey)
    return !rowExcluded.has(movement)
  })
}

export function scoreFor(result: string | null): number {
  return RESULT_SCORE[result ?? ''] ?? 0
}

export const AVERAGE_SCORE_EXPLANATION = 'Média das notas de execução dos movimentos, de 0 a 2. Quanto mais perto de 2, melhor a execução.'

export const COMPLETION_EXPLANATION = 'Percentual de avaliações concluídas em relação ao total esperado. 100% é tudo avaliado.'

export function average(values: number[]): number | null {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
}

export function labelForStyle(style: string): string {
  if (style === 'FS' || style === 'Livre') return 'FS - Freestyle'
  if (style === 'GR' || style === 'Greco-romana') return 'GR - Greco-Romana'
  if (style === 'WW' || style === 'Feminino') return 'WW - Feminino'
  return style
}

export const REGION_ORDER = ['Sudeste', 'Centro-Oeste', 'Nordeste', 'Sul', 'Norte'] as const

export const REGION_BY_STATE: Record<string, string> = {
  AC: 'Norte', AL: 'Nordeste', AM: 'Norte', AP: 'Norte', BA: 'Nordeste', CE: 'Nordeste', DF: 'Centro-Oeste', ES: 'Sudeste', GO: 'Centro-Oeste', MA: 'Nordeste', MG: 'Sudeste', MS: 'Centro-Oeste', MT: 'Centro-Oeste', PA: 'Norte', PB: 'Nordeste', PE: 'Nordeste', PI: 'Nordeste', PR: 'Sul', RJ: 'Sudeste', RN: 'Nordeste', RO: 'Norte', RR: 'Norte', RS: 'Sul', SC: 'Sul', SE: 'Nordeste', SP: 'Sudeste', TO: 'Norte',
}

export function scoreByEstado(rows: MotorRow[]): { estado: string; score: number | null; count: number }[] {
  const estados = [...new Set(rows.map((row) => row.estado).filter((value): value is string => Boolean(value)))]
  return estados.map((estado) => {
    const stateRows = rows.filter((row) => row.estado === estado)
    return { estado, score: average(stateRows.map((row) => scoreFor(row.resultado))), count: stateRows.length }
  })
}

export function scoreByCompetencia(rows: MotorRow[]): { competencia: string; score: number | null; count: number }[] {
  const competencias = [...new Set(rows.map((row) => row.competencia).filter((value): value is string => Boolean(value)))]
  return competencias.map((competencia) => {
    const competencyRows = rows.filter((row) => row.competencia === competencia)
    return { competencia, score: average(competencyRows.map((row) => scoreFor(row.resultado))), count: competencyRows.length }
  })
}

export function scoreAndCompletionByCompetencia(rows: MotorRow[]): { competencia: string; score: number | null; completionPct: number | null; count: number }[] {
  const competencias = [...new Set(rows.map((row) => row.competencia).filter((value): value is string => Boolean(value)))]
  return competencias.map((competencia) => {
    const competencyRows = rows.filter((row) => row.competencia === competencia)
    const total = competencyRows.length
    const completos = competencyRows.filter((row) => row.resultado === 'COMPLETE').length
    return {
      competencia,
      score: average(competencyRows.map((row) => scoreFor(row.resultado))),
      completionPct: total ? (completos / total) * 100 : null,
      count: total,
    }
  })
}

export function completionPctByEstado(rows: MotorRow[]) {
  const estados = [...new Set(rows.map((row) => row.estado).filter((value): value is string => Boolean(value)))]
  return estados.map((estado) => {
    const stateRows = rows.filter((row) => row.estado === estado)
    const total = stateRows.length
    const completo = stateRows.filter((row) => row.resultado === 'COMPLETE').length
    const parcial = stateRows.filter((row) => row.resultado === 'INCOMPLETE').length
    const naoCompletou = total - completo - parcial
    return {
      estado,
      completo: total ? (completo / total) * 100 : 0,
      parcial: total ? (parcial / total) * 100 : 0,
      naoCompletou: total ? (naoCompletou / total) * 100 : 0,
      desempenho: average(stateRows.map((row) => scoreFor(row.resultado))) ?? 0,
    }
  }).sort((first, second) => second.desempenho - first.desempenho)
}
