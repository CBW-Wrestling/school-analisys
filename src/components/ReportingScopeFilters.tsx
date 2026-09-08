import { useMemo } from 'react'
import { FilterDropdown } from './FilterDropdown'
import { SearchableSelect } from './SearchableSelect'
import { useApiRows } from '../lib/api'
import { WRESTLING_STYLES, useReportingScope } from '../lib/reportingScope'
import type { CompetitionRow } from '../types'
import { Button } from '@/components/ui/button'

export function ReportingScopeFilters() {
  const { rows: competitions, loading } = useApiRows<CompetitionRow>('/api/competitions')
  const { scope, updateScope } = useReportingScope()
  const years = useMemo(() => [...new Set(competitions.map((competition) => competition.year).filter((year): year is number => year !== null))].sort((first, second) => second - first), [competitions])
  const availableCompetitions = useMemo(() => competitions.filter((competition) => scope.year === 'all' || String(competition.year) === scope.year), [competitions, scope.year])
  const hasCustomScope = scope.year !== 'all' || scope.competitionCode !== 'all' || scope.styles.length !== WRESTLING_STYLES.length || WRESTLING_STYLES.some((style) => !scope.styles.includes(style))

  return (
    <div className="border-b bg-muted/20">
      <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-end justify-end gap-2 px-4 py-4 md:px-6">
        <SearchableSelect className="w-32" triggerId="scope-year" placeholder="Todos os anos" value={scope.year} onChange={(year) => updateScope({ year, competitionCode: 'all' })} options={[{ value: 'all', label: 'Todos os anos' }, ...years.map((year) => ({ value: String(year), label: String(year) }))]} disabled={loading} />
        <SearchableSelect className="w-56" triggerId="scope-competition" placeholder="Todas as competições" value={scope.competitionCode} onChange={(competitionCode) => updateScope({ competitionCode })} options={[{ value: 'all', label: 'Todas as competições' }, ...availableCompetitions.map((competition) => ({ value: competition.code, label: `${competition.name}${competition.year ? ` · ${competition.year}` : ''}` }))]} disabled={loading} />
        <FilterDropdown label="Estilos" options={WRESTLING_STYLES.map((style) => ({ value: style, label: style }))} value={scope.styles} onChange={(styles) => updateScope({ styles })} disabled={loading} />
        <Button size="sm" variant="ghost" disabled={!hasCustomScope} onClick={() => updateScope({ year: 'all', competitionCode: 'all', styles: [...WRESTLING_STYLES] })}>Limpar</Button>
      </div>
    </div>
  )
}