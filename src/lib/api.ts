import { useEffect, useState } from 'react'
import { getValidToken, isDemoMode } from './auth'

const BASE = import.meta.env.VITE_API_URL as string

async function authHeaders(): Promise<HeadersInit> {
  const token = await getValidToken()
  return token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : { Accept: 'application/json' }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: await authHeaders() })
  // Em modo demo não há sessão real para expirar: um 401 aqui é esperado ao
  // acessar endpoint protegido, não uma sessão inválida — não deve limpar
  // storage nem recarregar a página (isso reativaria o próprio modo demo e
  // repetiria a mesma chamada, causando reload em loop).
  if (res.status === 401 && !isDemoMode()) { localStorage.clear(); location.reload(); throw new Error('UNAUTHORIZED') }
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}

export function useApiRows<T>(path: string, enabled = true) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) { setRows([]); setLoading(false); return }
    let alive = true
    setLoading(true)
    apiGet<T[]>(path)
      .then((data) => { if (alive) { setRows(data); setError(null) } })
      .catch((e: Error) => { if (alive) setError(e.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [path, enabled])

  return { rows, loading, error }
}

export function useApiData<T>(path: string, enabled = true) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) { setData(null); setLoading(false); return }
    let alive = true
    setLoading(true)
    apiGet<T>(path)
      .then((d) => { if (alive) { setData(d); setError(null) } })
      .catch((e: Error) => { if (alive) setError(e.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [path, enabled])

  return { data, loading, error }
}
