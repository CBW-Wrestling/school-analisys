import { apiGet, apiPost } from './api'
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
