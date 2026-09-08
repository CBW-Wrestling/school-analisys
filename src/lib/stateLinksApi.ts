import { apiPost } from './api'
import type { CompetitionRow } from '../types'

export type StateOption = {
  id: string
  code: string
  name: string
}

export type GeneratedStateLink = {
  state: StateOption
  accessToken: string
}

export type StateLinkGenerationResponse = {
  competition: CompetitionRow
  links: GeneratedStateLink[]
}

export async function generateStateLinks(competitionId: string) {
  return apiPost<StateLinkGenerationResponse>(`/api/state-links/competitions/${competitionId}/generate`, {})
}
