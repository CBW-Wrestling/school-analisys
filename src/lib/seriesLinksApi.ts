import { apiGet, apiPut } from './api'
import type { CompetitionRow, EntryLink, EntryLinkHistory, LinkStatus, Page, PrincipalCandidate } from '../types'

export type ApiError = { error: string | null; message: string }

// As chamadas lançam Error com o corpo cru da resposta; o backend responde {"error","message"}.
export function apiErrorOf(err: unknown, fallback: string): ApiError {
  const raw = err instanceof Error ? err.message : ''
  try {
    const body = JSON.parse(raw) as Partial<ApiError>
    if (typeof body.message === 'string') return { error: body.error ?? null, message: body.message }
  } catch {
    // corpo não-JSON
  }
  return { error: null, message: raw || fallback }
}

export function isSecondarySeries(c: Pick<CompetitionRow, 'series'>) {
  return c.series === 'PRATA' || c.series === 'BRONZE'
}

// Competições onde avaliações são coletadas: sem série ou Série Ouro.
export function isAssessable(c: Pick<CompetitionRow, 'series'>) {
  return !isSecondarySeries(c)
}

const SERIES_LABEL = { OURO: 'Ouro', PRATA: 'Prata', BRONZE: 'Bronze' } as const

// "JEBS 2026 · Prata" para filhas de série; nome próprio para as demais.
export function competitionLabel(c: Pick<CompetitionRow, 'name' | 'series' | 'parentCompetitionName'>) {
  if (!c.series) return c.name
  return `${c.parentCompetitionName ?? c.name} · ${SERIES_LABEL[c.series]}`
}

function query(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)) })
  return q.toString()
}

export function getCompetitionLinks(
  competitionId: string,
  params: { status?: LinkStatus; q?: string; page?: number; size?: number } = {},
) {
  return apiGet<Page<EntryLink>>(`/api/competitions/${competitionId}/links?${query({ page: 0, size: 50, ...params })}`)
}

export function getPrincipalCandidates(competitionId: string, params: { q?: string; page?: number; size?: number } = {}) {
  return apiGet<Page<PrincipalCandidate>>(
    `/api/competitions/${competitionId}/principal-candidates?${query({ page: 0, size: 20, ...params })}`,
  )
}

export function setEntryPrincipal(entryId: string, principalEntryId: string | null, swap = false) {
  return apiPut<EntryLink>(`/api/entries/${entryId}/principal`, { principalEntryId, swap })
}

export function getLinkHistory(entryId: string) {
  return apiGet<EntryLinkHistory[]>(`/api/entries/${entryId}/link-history`)
}
