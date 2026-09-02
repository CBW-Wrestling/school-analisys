import { apiPost } from './api'
import type { CompetitionRow } from '../types'

export type ImportedReferee = {
  name: string
  state: string
}

export type Referee = {
  id: string
  name: string
  state: string
}

export type ImportedRefereeAccess = Referee & {
  accessToken: string
}

export type RefereeImportResponse = {
  competition: CompetitionRow
  referees: ImportedRefereeAccess[]
}

export async function importReferees(competitionId: string, referees: ImportedReferee[]) {
  return apiPost<RefereeImportResponse>('/api/referees/import', { competitionId, referees })
}