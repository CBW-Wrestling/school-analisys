import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// -----------------------------------------------------------------
// LEITURA
// Substitui o antigo useWorkbookRows(url) que lia .xlsx.
// Mesma assinatura de retorno (T[]) — as telas não precisam mudar,
// só trocar a fonte: useSupabaseRows<ProfileRow>('vw_profile_dashboard')
// -----------------------------------------------------------------
export function useSupabaseRows<T>(
  view: string,
  filter?: Record<string, string | number | boolean | null>,
  enabled = true
) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const filterKey = filter ? JSON.stringify(filter) : null

  useEffect(() => {
    if (!enabled) { setRows([]); setLoading(false); return }
    let alive = true
    const load = async () => {
      setLoading(true)

      // O Supabase retorna no máximo 1000 linhas por requisição.
      // Paginamos com .range() em blocos até trazer todos os registros.
      const PAGE = 1000
      let from = 0
      const all: T[] = []

      while (true) {
        let query = supabase.from(view).select('*')
        if (filter) {
          for (const [key, val] of Object.entries(filter)) {
            query = query.eq(key, val)
          }
        }
        const { data, error } = await query.range(from, from + PAGE - 1)

        if (error) {
          if (!alive) return
          console.error(`Erro lendo ${view}:`, error.message)
          setError(error.message)
          setRows([])
          setLoading(false)
          return
        }

        const batch = (data ?? []) as T[]
        all.push(...batch)

        // se veio menos que uma página cheia, acabou
        if (batch.length < PAGE) break
        from += PAGE
      }

      if (!alive) return
      setRows(all)
      setError(null)
      setLoading(false)
    }
    void load()
    return () => { alive = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, filterKey, enabled])

  return { rows, loading, error }
}

// -----------------------------------------------------------------
// RPC de leitura
// Para funções SECURITY DEFINER que retornam setof/table sem RLS.
// -----------------------------------------------------------------
export function useSupabaseRpc<T>(
  fn: string,
  params?: Record<string, string | number | boolean | null>,
  enabled = true
) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const paramsKey = params ? JSON.stringify(params) : null

  useEffect(() => {
    if (!enabled) { setRows([]); setLoading(false); return }
    let alive = true
    const load = async () => {
      setLoading(true)
      const { data, error: rpcError } = await supabase.rpc(fn, params ?? {})
      if (!alive) return
      if (rpcError) {
        console.error(`Erro no RPC ${fn}:`, rpcError.message)
        setError(rpcError.message)
        setRows([])
      } else {
        setRows((data ?? []) as T[])
        setError(null)
      }
      setLoading(false)
    }
    void load()
    return () => { alive = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, paramsKey, enabled])

  return { rows, loading, error }
}

// -----------------------------------------------------------------
// ESCRITA
// Envia um formulário inteiro para a RPC submit_assessment.
// A RPC resolve atleta/categoria/peso/entry e grava tudo numa transação.
// Só funciona autenticado (RLS + grant execute to authenticated).
// -----------------------------------------------------------------
export type SubmitPayload = {
  kind: 'profile' | 'physical' | 'motor'
  event: string
  name: string
  state: string
  style: string
  gender?: string
  weight: string | number
  age_code?: string
  // profile
  practice_time?: string
  practice_location?: string
  practice_location_name?: string
  weekly_frequency?: string
  practices_other_sport?: boolean
  other_sports?: string[]
  started_in_wrestling?: boolean
  birth?: string
  school?: string
  email?: string
  // physical
  arm_span_cm?: string
  height_cm?: string
  hand_grip_right?: string
  hand_grip_left?: string
  base_cm?: string
  forearm_right_cm?: string
  forearm_left_cm?: string
  placement?: string
  // motor
  results?: { movement: string; result: string }[]
}

export async function submitAssessment(payload: SubmitPayload) {
  const { data, error } = await supabase.rpc('submit_assessment', {
    payload,
  })
  if (error) {
    console.error('Erro no submit:', error.message)
    throw new Error(error.message)
  }
  return data
}