export type FormKind = 'profile' | 'physical' | 'motor'
export type Answers = Record<string, string>
export type Props = { answers: Answers; update: (key: string, value: string) => void }

// ── Competições ────────────────────────────────────────────────────
export type CompetitionRow = {
  id: string
  code: string
  name: string
  year: number | null
  arenaId: string | null
}

// ── Resultados ─────────────────────────────────────────────────────
export type ResultRow = {
  entryId: string
  fullName: string
  teamAlternateName: string
  weightCategoryShortName: string
  rank: number | null
  wins: number | null
  losses: number | null
  technicalPointsFor: number | null
  technicalPointsDiff: number | null
  countFights: number | null
  isNotRanked: boolean
}

// ── Detalhe do atleta ──────────────────────────────────────────────
export type MotorItem = {
  competency: string
  movement: string
  result: string
}

export type AthleteDetail = {
  athleteName: string
  birthDate: string | null
  school: string | null
  style: string
  weight: number
  state: string
  gender: string
  ageCategoryCode: string
  competitionCode: string
  competitionName: string
  rank: number | null
  wins: number | null
  losses: number | null
  technicalPointsFor: number | null
  technicalPointsAgainst: number | null
  technicalPointsDiff: number | null
  countFights: number | null
  isFinalistGold: boolean | null
  isNotRanked: boolean | null
  practiceTime: string | null
  practiceLocation: string | null
  practiceLocationName: string | null
  weeklyFrequency: string | null
  practicesOtherSport: boolean | null
  otherSports: string[] | null
  startedInWrestling: boolean | null
  armSpanCm: number | null
  heightCm: number | null
  handGripRight: number | null
  handGripLeft: number | null
  baseCm: number | null
  forearmRightCm: number | null
  forearmLeftCm: number | null
  placement: number | null
  motorData: MotorItem[] | null
}

// ── Dashboard — resumos ────────────────────────────────────────────
export type CountByCode = { code: string; label: string; count: number }

export type ProfileSummary = {
  totalProfiles: number
  practiceLocationsCount: number
  practicesOtherSport: number
  statesCount: number
  byPracticeTime: CountByCode[]
  byPracticeLocation: CountByCode[]
  byWeeklyFrequency: CountByCode[]
}

export type PhysicalSummary = {
  totalAssessments: number
  averageHeight: number | null
  averageArmSpan: number | null
  averageHandGripRight: number | null
  byState: CountByCode[]
  byStyle: CountByCode[]
}

export type MotorSummary = {
  totalMovements: number
  completeCount: number
  dominanceRate: number
  competenciesCount: number
  byResult: CountByCode[]
  byCompetency: CountByCode[]
}

// ── Dashboard — linhas brutas (Explorer) ──────────────────────────
export type MotorRow = {
  estado: string | null
  estilo: string | null
  peso: string | null
  avaliacao: string | null
  resultado: string | null
  competencia: string | null
  eventIdentifier: string | null
}

export type ProfileRow = {
  estado: string | null
  estilo: string | null
  peso: string | null
  tempoPratica: string | null
  localPratica: string | null
  frequenciaSemanal: string | null
  flagOutraModalidade: string | null
  iniciouNaLuta: string | null
  eventIdentifier: string | null
}

// ── Coleta ─────────────────────────────────────────────────────────
export type CompetitionAthlete = {
  entryId: string
  athleteName: string
  style: string
  weight: number
  state: string
  gender: string
  ageCategoryCode: string
  competitionCode: string
  competitionName: string
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