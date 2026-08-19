export type FormKind = 'profile' | 'physical' | 'motor'
export type Answers = Record<string, string>
export type Props = { answers: Answers; update: (key: string, value: string) => void }

export type CompetitionRow = {
  id: string
  code: string
  name: string
  year: number | null
  from_arena: boolean
  athletes: number
  entries: number
  results: number
  age_categories: number
  styles: number
  states: number
}

export type ResultRow = {
  fullName: string
  teamAlternateName: string
  weightCategoryShortName: string
  rank: number
  wins: number
  losses: number
  technicalPointsFor: number
  technicalPointsDiff: number
  countFights: number
  isNotRanked: boolean
}

export type PhysicalRow = {
  Estado: string
  Estilo: string
  Peso: string
  'Envergadura (cm)': string
  'Estatura (cm)': string
  'Prensão manual (D)': string
  'Prensão manual (E)': string
  event_identifier: string
}

export type ProfileRow = {
  Estado: string
  Estilo: string
  Peso: string
  tempo_pratica: string
  local_pratica: string
  flag_outra_modalidade: string
  iniciou_na_luta: string
  event_identifier: string
}

export type MotorRow = {
  Estado: string
  Estilo: string
  Peso: string
  Avaliação: string
  Resultado: string
  Competência: string
  event_identifier: string
}