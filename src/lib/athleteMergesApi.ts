import { apiGet, apiPost } from './api'
import { apiErrorOf } from './seriesLinksApi'
import type { MergeCandidateGroup, MergeGroupStatus, MergeHistory, MergeResult, Page } from '../types'

export function getMergeCandidates(params: { status?: MergeGroupStatus; page?: number; size?: number } = {}) {
  const q = new URLSearchParams({ page: String(params.page ?? 0), size: String(params.size ?? 20) })
  if (params.status) q.set('status', params.status)
  return apiGet<Page<MergeCandidateGroup>>(`/api/athlete-merges/candidates?${q}`)
}

// expectedNormalizedName é o do grupo revisado: se os registros mudaram, o backend responde 409.
export function mergeAthletes(survivorId: string, mergedIds: string[], expectedNormalizedName: string) {
  return apiPost<MergeResult>('/api/athlete-merges', { survivorId, mergedIds, expectedNormalizedName })
}

export function dismissMergeGroup(athleteIds: string[]) {
  return apiPost<void>('/api/athlete-merges/dismissals', { athleteIds })
}

export function getMergeHistory(page = 0, size = 20) {
  return apiGet<Page<MergeHistory>>(`/api/athlete-merges/history?page=${page}&size=${size}`)
}

// Todos os grupos prováveis, de todas as páginas. Lidos antes de unificar: cada unificação tira o
// grupo da lista e mudaria a paginação no meio do lote.
export async function getAllLikelyGroups(): Promise<MergeCandidateGroup[]> {
  const size = 100
  const groups: MergeCandidateGroup[] = []
  for (let page = 0; ; page++) {
    const result = await getMergeCandidates({ status: 'LIKELY', page, size })
    groups.push(...result.content)
    if (result.content.length < size || groups.length >= result.totalElements) return groups
  }
}

export type BulkMergeFailure = { group: MergeCandidateGroup; message: string }

// Um grupo por chamada, cada um na sua transação no backend: uma falha (ex.: 409 de grupo
// alterado) não interrompe os outros.
export async function mergeLikelyGroups(
  groups: MergeCandidateGroup[],
  onProgress: (done: number) => void,
): Promise<{ merged: number; failures: BulkMergeFailure[] }> {
  let merged = 0
  const failures: BulkMergeFailure[] = []
  for (const [index, group] of groups.entries()) {
    const survivor = group.suggestedSurvivorId
    try {
      if (!survivor) throw new Error('Sem registro sugerido para ficar.')
      const others = group.athletes.map((a) => a.athleteId).filter((id) => id !== survivor)
      await mergeAthletes(survivor, others, group.normalizedName)
      merged++
    } catch (err) {
      failures.push({ group, message: apiErrorOf(err, 'Não foi possível unificar.').message })
    }
    onProgress(index + 1)
  }
  return { merged, failures }
}
