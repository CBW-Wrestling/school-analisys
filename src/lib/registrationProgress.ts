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
  pending: string[]
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
