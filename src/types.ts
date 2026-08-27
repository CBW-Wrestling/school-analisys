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

export type PhysicalRow = {
  estado: string | null
  estilo: string | null
  peso: string | null
  enverguturaCm: string | null
  estaturaCm: string | null
  prensaoManualD: string | null
  prensaoManualE: string | null
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