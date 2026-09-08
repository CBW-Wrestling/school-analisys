import { getValidToken } from './auth'

const BASE = import.meta.env.VITE_API_URL as string

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
  status: string
  selectedCompetitionId: string | null
  errorMessage: string | null
}

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
): Promise<ImportStatus> {
  const res = await fetch(`${BASE}/api/imports/${importId}/competition`, {
    method: 'POST',
    headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify({ competitionId }),
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
