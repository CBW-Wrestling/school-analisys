export type FormKind = 'profile' | 'physical' | 'motor'
export type Answers = Record<string, string>
export type Props = { answers: Answers; update: (key: string, value: string) => void }

// ── Competições ────────────────────────────────────────────────────
// A Ouro é a série principal; Prata e Bronze leem as avaliações da Ouro.
export type Series = 'OURO' | 'PRATA' | 'BRONZE'

export type CompetitionRow = {
  id: string
  code: string
  name: string
  year: number | null
  arenaId: string | null
  series: Series | null
  parentCompetitionId: string | null
  parentCompetitionName: string | null
}

// ── Vínculo de séries secundárias ─────────────────────────────────
export type LinkStatus = 'EXACT' | 'SUGGESTED' | 'AMBIGUOUS' | 'UNLINKED' | 'CONFIRMED'

export type LinkHistorySource = 'IMPORT_AUTO' | 'IMPORT_REVIEW' | 'MANUAL' | 'SWAP'

export type Page<T> = { content: T[]; totalElements: number }

export type LinkedEntry = {
  entryId: string
  athleteName: string | null
  state: string | null
  style: string
  weightKg: number | null
}

export type PrincipalCandidate = LinkedEntry & {
  // Inscrição desta série já vinculada a este principal, se houver.
  linkedEntryId: string | null
}

export type EntryLink = {
  entryId: string
  arenaAthleteName: string | null
  state: string | null
  style: string
  weightKg: number | null
  linkStatus: LinkStatus
  principal: LinkedEntry | null
  // Só em AMBIGUOUS.
  candidates: PrincipalCandidate[] | null
}

export type EntryLinkHistory = {
  fromPrincipalEntryId: string | null
  toPrincipalEntryId: string | null
  fromStatus: LinkStatus | null
  toStatus: LinkStatus
  source: LinkHistorySource
  changedBy: string | null
  changedAt: string
}

export type LinkSummary = { exact: number; suggested: number; ambiguous: number; unlinked: number }

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

// ── Detalhe do atleta (BFF: backend monta seções/itens já formatados) ──
export type AthleteDetailItem = {
  code: string
  label: string
  value: string | null
}

export type AthleteDetailSection = {
  code: string
  title: string
  icon: string
  items: AthleteDetailItem[]
}

export type AthleteDetail = {
  athleteName: string
  competitionName: string
  tags: string[]
  rank: number | null
  sections: AthleteDetailSection[]
}

// ── Dashboard — resumos ────────────────────────────────────────────
export type CountByCode = { code: string; label: string; count: number }

export type HomeSummary = {
  totalAthletes: number
  profilesCovered: number
  physicalCovered: number
  motorCovered: number
  completedAthletes: number
  pendingAthletes: number
  completionRate: number
}

export type ProfileSummary = {
  totalProfiles: number
  practiceLocationsCount: number
  practicesOtherSport: number
  statesCount: number
  byPracticeTime: CountByCode[]
  byPracticeLocation: CountByCode[]
  byWeeklyFrequency: CountByCode[]
  byOtherSport: CountByCode[]
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
  athleteEntryId?: string | null
  estado: string | null
  estilo: string | null
  peso: string | null
  avaliacao: string | null
  resultado: string | null
  competencia: string | null
  eventIdentifier: string | null
  dimension?: string | null
}

export type ProfileRow = {
  athleteEntryId?: string | null
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
  athleteEntryId?: string | null
  estado: string | null
  estilo: string | null
  peso: string | null
  enverguturaCm: string | null
  estaturaCm: string | null
  prensaoManualD: string | null
  prensaoManualE: string | null
  eventIdentifier: string | null
  forearmRightCm: string | null
  forearmLeftCm: string | null
}

// ── Coleta — vocabulário do formulário (backend) ───────────────────
export type EnumOption = { code: string; label: string }

export type MotorMovementOption = { id: string; code: string; label: string }

export type MotorMovementGroup = {
  id: string
  code: string
  name: string
  movements: MotorMovementOption[]
}

export type PhysicalField = { key: string; label: string; required: boolean }

export type PlacementOption = { code: number | null; label: string }

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