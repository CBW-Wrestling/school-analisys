import type { EnumOption, EvolutionPhysical, EvolutionPoint, EvolutionProfile } from '../types'
import { useApiRows } from './api'
import { average, excludedMovements, scoreFor } from './motorScore'

export function pointLabel(point: EvolutionPoint): string {
  return point.competition.parentName ?? point.competition.name
}

// Rótulo curto do eixo: ano + nome, cortado para não sobrepor os vizinhos.
export function pointTick(point: EvolutionPoint): string {
  const name = pointLabel(point)
  const short = name.length > 16 ? `${name.slice(0, 15)}…` : name
  return point.competition.year != null && !name.includes(String(point.competition.year)) ? `${point.competition.year} · ${short}` : short
}

// Mesma regra dos painéis técnicos: movimentos fora do estilo não entram na nota.
function visibleMotor(point: EvolutionPoint) {
  const excluded = excludedMovements(point.style)
  return point.motor.filter((row) => !excluded.has(row.movement.toUpperCase()))
}

export function motorScore(point: EvolutionPoint): { score: number | null; count: number } {
  const rows = visibleMotor(point)
  return { score: average(rows.map((row) => scoreFor(row.result))), count: rows.length }
}

export function competencies(points: EvolutionPoint[]): string[] {
  return [...new Set(points.flatMap((point) => visibleMotor(point).map((row) => row.competency)))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

export function competencyScore(point: EvolutionPoint, competency: string): { score: number | null; count: number } {
  const rows = visibleMotor(point).filter((row) => row.competency === competency)
  return { score: average(rows.map((row) => scoreFor(row.result))), count: rows.length }
}

// column: nome no banco, como vem no data das versões.
export const PHYSICAL_MEASURES: { key: keyof EvolutionPhysical; column: string; label: string; unit: string }[] = [
  { key: 'heightCm', column: 'height_cm', label: 'Altura', unit: 'cm' },
  { key: 'armSpanCm', column: 'arm_span_cm', label: 'Envergadura', unit: 'cm' },
  { key: 'handGripRight', column: 'hand_grip_right', label: 'Preensão direita', unit: 'kgf' },
  { key: 'handGripLeft', column: 'hand_grip_left', label: 'Preensão esquerda', unit: 'kgf' },
  { key: 'baseCm', column: 'base_cm', label: 'Base', unit: 'cm' },
  { key: 'forearmRightCm', column: 'forearm_right_cm', label: 'Antebraço direito', unit: 'cm' },
  { key: 'forearmLeftCm', column: 'forearm_left_cm', label: 'Antebraço esquerdo', unit: 'cm' },
]

export type ProfileLabels = {
  practiceTimes: EnumOption[]
  practiceLocations: EnumOption[]
  weeklyFrequencies: EnumOption[]
  otherSports: EnumOption[]
}

export function useProfileLabels(enabled = true): ProfileLabels {
  const { rows: practiceTimes } = useApiRows<EnumOption>('/api/enums/practice-times', enabled)
  const { rows: practiceLocations } = useApiRows<EnumOption>('/api/enums/practice-locations', enabled)
  const { rows: weeklyFrequencies } = useApiRows<EnumOption>('/api/enums/weekly-frequencies', enabled)
  const { rows: otherSports } = useApiRows<EnumOption>('/api/enums/other-sports', enabled)
  return { practiceTimes, practiceLocations, weeklyFrequencies, otherSports }
}

function labelOf(options: EnumOption[], code: string | null | undefined): string {
  if (code == null || code === '') return '—'
  return options.find((option) => option.code === code)?.label ?? code
}

function yesNo(value: boolean | null | undefined): string {
  return value == null ? '—' : value ? 'Sim' : 'Não'
}

export type ProfileField = { key: string; label: string; format: (profile: EvolutionProfile, labels: ProfileLabels) => string }

export const PROFILE_FIELDS: ProfileField[] = [
  { key: 'practiceTime', label: 'Tempo de prática', format: (p, l) => labelOf(l.practiceTimes, p.practiceTime) },
  { key: 'practiceLocation', label: 'Local de prática', format: (p, l) => labelOf(l.practiceLocations, p.practiceLocation) },
  { key: 'practiceLocationName', label: 'Clube ou projeto', format: (p) => p.practiceLocationName?.trim() || '—' },
  { key: 'weeklyFrequency', label: 'Frequência semanal', format: (p, l) => labelOf(l.weeklyFrequencies, p.weeklyFrequency) },
  {
    key: 'otherSports',
    label: 'Outros esportes',
    format: (p, l) => (p.practicesOtherSport ? p.otherSports.map((code) => labelOf(l.otherSports, code)).join(', ') || 'Sim' : yesNo(p.practicesOtherSport)),
  },
  { key: 'startedInWrestling', label: 'Começou na luta', format: (p) => yesNo(p.startedInWrestling) },
]

// Colunas de uma versão guardada (snake_case, como no banco) com rótulo para o painel de versões.
export function versionFields(
  kind: 'PROFILE' | 'PHYSICAL' | 'MOTOR',
  data: Record<string, unknown>,
  labels: ProfileLabels & { motorResults: EnumOption[]; movements: EnumOption[] },
): { label: string; value: string }[] {
  const text = (value: unknown) => (value == null || value === '' ? '—' : String(value))
  if (kind === 'MOTOR') {
    return [
      { label: 'Movimento', value: labelOf(labels.movements, data.movement as string) },
      { label: 'Competência', value: text(data.competency) },
      { label: 'Resultado', value: labelOf(labels.motorResults, data.result as string) },
    ]
  }
  if (kind === 'PHYSICAL') {
    return PHYSICAL_MEASURES.map((measure) => {
      const value = data[measure.column]
      return { label: measure.label, value: value == null ? '—' : `${value} ${measure.unit}` }
    })
  }
  const profile: EvolutionProfile = {
    practiceTime: (data.practice_time as string) ?? null,
    practiceLocation: (data.practice_location as string) ?? null,
    practiceLocationName: (data.practice_location_name as string) ?? null,
    weeklyFrequency: (data.weekly_frequency as string) ?? null,
    practicesOtherSport: (data.practices_other_sport as boolean) ?? null,
    otherSports: (data.other_sports as string[]) ?? [],
    startedInWrestling: (data.started_in_wrestling as boolean) ?? null,
  }
  return PROFILE_FIELDS.map((field) => ({ label: field.label, value: field.format(profile, labels) }))
}
