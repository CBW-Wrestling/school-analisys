export type RegistrationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE'

export type RegistrationStateSummary = {
  stateCode: string
  stateName: string
  totalAthletes: number
  socialRegistered: number
  socialPercentage: number
  socialStatus: RegistrationStatus
  motorRegistered: number
  motorPercentage: number
  motorStatus: RegistrationStatus
}

export type RegistrationProgress = {
  competition: { id: string; code: string; name: string }
  totalAthletes: number
  states: RegistrationStateSummary[]
}

export type RegistrationPendingType = 'SOCIAL' | 'MOTOR'

export type RegistrationPendingItem = {
  type: RegistrationPendingType
  message: string
}

export type RegistrationAthlete = {
  entryId: string
  athleteName: string
  style: string
  weight: number | null
  ageCategoryCode: string
  socialStatus: RegistrationStatus
  motorRegistered: number
  motorExpected: number
  motorStatus: RegistrationStatus
  pending: RegistrationPendingItem[]
}

export type RegistrationStateAthletes = {
  competition: { id: string; code: string; name: string }
  stateCode: string
  stateName: string
  athletes: RegistrationAthlete[]
}

export const REGISTRATION_STATUS_LABEL: Record<RegistrationStatus, string> = {
  NOT_STARTED: 'Não iniciado',
  IN_PROGRESS: 'Realizando',
  COMPLETE: 'Completo',
}

export const REGISTRATION_STATUS_CLASSNAME: Record<RegistrationStatus, string> = {
  NOT_STARTED: 'border-border bg-muted text-muted-foreground',
  IN_PROGRESS: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  COMPLETE: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
}

export const REGISTRATION_STATUS_ORDER: RegistrationStatus[] = ['COMPLETE', 'IN_PROGRESS', 'NOT_STARTED']

/** Estados cujo status na dimensão informada (social ou motora) está entre os selecionados. */
export function filterStatesByStatus(
  states: RegistrationStateSummary[],
  statusKey: 'socialStatus' | 'motorStatus',
  selected: RegistrationStatus[],
): RegistrationStateSummary[] {
  return states.filter((state) => selected.includes(state[statusKey]))
}

export type RegistrationSummary = { registered: number; total: number; percentage: number }

/** Soma registrados e atletas dos estados informados; porcentagem é 0 quando não há atletas. */
export function summarizeStates(
  states: RegistrationStateSummary[],
  registeredKey: 'socialRegistered' | 'motorRegistered',
): RegistrationSummary {
  const registered = states.reduce((sum, state) => sum + state[registeredKey], 0)
  const total = states.reduce((sum, state) => sum + state.totalAthletes, 0)
  return { registered, total, percentage: total > 0 ? (registered / total) * 100 : 0 }
}
