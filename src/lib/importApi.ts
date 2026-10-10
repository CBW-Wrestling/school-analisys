import { getValidToken } from './auth'
import type { EntryLink, LinkStatus, LinkSummary, Page, Series } from '../types'

const BASE = import.meta.env.VITE_BASE_URL_API as string

async function authHeaders(): Promise<HeadersInit> {
  const token = await getValidToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export interface CompetitionOption {
  id: string
  name: string
  date?: string
}

export interface ImportResponse {
  importId: string
  status: string
  competitions: CompetitionOption[]
}

export interface ImportStatus {
  importId: string
  // WAITING_LINK_REVIEW: estrutura de série secundária importada, aguardando revisão dos vínculos.
  status: string
  selectedCompetitionId: string | null
  errorMessage: string | null
  linkSummary?: LinkSummary | null
}

// Importa o evento como série secundária (PRATA/BRONZE) da Série Ouro informada.
export type SecondarySeriesSelection = { principalCompetitionId: string; series: Exclude<Series, 'OURO'> }

export type LinkOverride = { entryId: string; principalEntryId: string | null }

export async function uploadImport(file: File): Promise<ImportResponse> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/api/imports`, {
    method: 'POST',
    headers: await authHeaders(),
    body: form,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function selectCompetition(
  importId: string,
  competitionId: string,
  secondary?: SecondarySeriesSelection,
): Promise<ImportStatus> {
  const res = await fetch(`${BASE}/api/imports/${importId}/competition`, {
    method: 'POST',
    headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify({ competitionId, ...secondary }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getImportLinks(
  importId: string,
  params: { status?: LinkStatus; page?: number; size?: number } = {},
): Promise<Page<EntryLink>> {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  query.set('page', String(params.page ?? 0))
  query.set('size', String(params.size ?? 50))
  const res = await fetch(`${BASE}/api/imports/${importId}/links?${query}`, { headers: await authHeaders() })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function confirmImportLinks(importId: string, overrides: LinkOverride[]): Promise<ImportStatus> {
  const res = await fetch(`${BASE}/api/imports/${importId}/links/confirm`, {
    method: 'POST',
    headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify({ overrides }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getImportStatus(importId: string): Promise<ImportStatus> {
  const res = await fetch(`${BASE}/api/imports/${importId}`, {
    headers: await authHeaders(),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function uploadResultsImport(file: File): Promise<ImportResponse> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/api/results-imports`, {
    method: 'POST',
    headers: await authHeaders(),
    body: form,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function selectResultsCompetition(
  importId: string,
  competitionId: string,
): Promise<ImportStatus> {
  const res = await fetch(`${BASE}/api/results-imports/${importId}/competition`, {
    method: 'POST',
    headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify({ competitionId }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getResultsImportStatus(importId: string): Promise<ImportStatus> {
  const res = await fetch(`${BASE}/api/results-imports/${importId}`, {
    headers: await authHeaders(),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
