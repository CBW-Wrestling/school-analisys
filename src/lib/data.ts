// Compatibilidade — toda lógica de dados migrou para src/lib/api.ts
export { useApiRows as useSupabaseRows, useApiRows as useSupabaseRpc, useApiRows, useApiData, apiGet, apiPost } from './api'

export type SubmitPayload = Record<string, unknown>

export async function submitAssessment(payload: SubmitPayload) {
  const { apiPost } = await import('./api')
  return apiPost('/api/assessments', payload)
}
