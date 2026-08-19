import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// -----------------------------------------------------------------
// LEITURA
// Substitui o antigo useWorkbookRows(url) que lia .xlsx.
// Mesma assinatura de retorno (T[]) — as telas não precisam mudar,
// só trocar a fonte: useSupabaseRows<ProfileRow>('vw_profile_dashboard')
// -----------------------------------------------------------------
export function useSupabaseRows<T>(view: string) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)

      // O Supabase retorna no máximo 1000 linhas por requisição.
      // Paginamos com .range() em blocos até trazer todos os registros.
      const PAGE = 1000
      let from = 0
      const all: T[] = []

      while (true) {
        const { data, error } = await supabase
          .from(view)
          .select('*')
          .range(from, from + PAGE - 1)

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
  }, [view])

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