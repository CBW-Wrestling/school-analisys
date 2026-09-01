import { useEffect, useMemo, useState } from 'react'
import { apiGet } from './api'
import type { CompetitionAthlete, CompetitionRow } from '../types'

export const WRESTLING_STYLES = ['FS', 'GR', 'WW'] as const

export type ReportingScope = {
  year: string
  competitionCode: string
  styles: string[]
}

export function withReportingScope(href: string) {
  const [path, query = ''] = href.split('?')
  const targetParams = new URLSearchParams(query)
  const currentParams = new URLSearchParams(window.location.search)
  for (const key of ['year', 'competition', 'styles']) {
    const value = currentParams.get(key)
    if (value) targetParams.set(key, value)
  }
  return `${path}?${targetParams.toString()}`
}

function readScope(): ReportingScope {
  const params = new URLSearchParams(window.location.search)
  const styles = params.get('styles')?.split(',').filter(Boolean) ?? [...WRESTLING_STYLES]
  return {
    year: params.get('year') ?? 'all',
    competitionCode: params.get('competition') ?? 'all',
    styles,
  }
}

export function competitionCodesForScope(scope: ReportingScope, competitions: CompetitionRow[]) {
  if (scope.competitionCode !== 'all') return [scope.competitionCode]
  return competitions
    .filter((competition) => scope.year === 'all' || String(competition.year) === scope.year)
    .map((competition) => competition.code)
}

export function useScopedCompetitionAthletes(scope: ReportingScope, competitions: CompetitionRow[]) {
  const competitionCodes = useMemo(() => competitionCodesForScope(scope, competitions), [scope, competitions])
  const scopeKey = competitionCodes.join(',')
  const [athletes, setAthletes] = useState<CompetitionAthlete[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!competitionCodes.length) {
      setAthletes([])
      setLoading(false)
      return
    }
    let alive = true
    setLoading(true)
    Promise.all(competitionCodes.map((code) => apiGet<CompetitionAthlete[]>(`/api/competitions/${encodeURIComponent(code)}/athletes`)))
      .then((lists) => { if (alive) setAthletes(lists.flat()) })
      .catch(() => { if (alive) setAthletes([]) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [scopeKey])

  return { athletes: athletes.filter((athlete) => scope.styles.includes(athlete.style)), loading }
}

export function useReportingScope() {
  const [scope, setScope] = useState<ReportingScope>(readScope)

  useEffect(() => {
    const syncScope = () => setScope(readScope())
    window.addEventListener('popstate', syncScope)
    window.addEventListener('cbw-reporting-scope-change', syncScope)
    return () => {
      window.removeEventListener('popstate', syncScope)
      window.removeEventListener('cbw-reporting-scope-change', syncScope)
    }
  }, [])

  const updateScope = (changes: Partial<ReportingScope>) => {
    const next = { ...readScope(), ...changes }
    const params = new URLSearchParams(window.location.search)
    if (next.year === 'all') params.delete('year')
    else params.set('year', next.year)
    if (next.competitionCode === 'all') params.delete('competition')
    else params.set('competition', next.competitionCode)
    if (next.styles.length === WRESTLING_STYLES.length && WRESTLING_STYLES.every((style) => next.styles.includes(style))) params.delete('styles')
    else params.set('styles', next.styles.join(','))
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`)
    window.dispatchEvent(new Event('cbw-reporting-scope-change'))
  }

  return { scope, updateScope }
}