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
  entry_id: string
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

export type MotorItem = {
  competency: string
  movement: string
  result: string
}

export type AthleteDetail = {
  athlete_name: string
  birth_date: string | null
  school: string | null
  style: string
  weight: number
  state: string
  gender: string
  age_category_code: string
  competition_code: string
  competition_name: string
  rank: number | null
  wins: number | null
  losses: number | null
  technical_points_for: number | null
  technical_points_against: number | null
  technical_points_diff: number | null
  count_fights: number | null
  is_finalist_gold: boolean | null
  is_not_ranked: boolean | null
  practice_time: string | null
  practice_location: string | null
  practice_location_name: string | null
  weekly_frequency: string | null
  practices_other_sport: boolean | null
  other_sports: string[] | null
  started_in_wrestling: boolean | null
  arm_span_cm: number | null
  height_cm: number | null
  hand_grip_right: number | null
  hand_grip_left: number | null
  base_cm: number | null
  forearm_right_cm: number | null
  forearm_left_cm: number | null
  placement: number | null
  motor_data: MotorItem[] | null
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
  frequencia_semanal: string
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

export type CompetitionAthlete = {
  competition_code: string
  competition_name: string
  athlete_name: string
  style: string
  weight: number
  state: string
  gender: string
  age_category_code: string
  entry_id: string
}