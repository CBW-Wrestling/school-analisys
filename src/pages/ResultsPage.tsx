import { Medal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AthleteCell } from '../components/AthleteCell'
import { FilterDropdown } from '../components/FilterDropdown'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { apiGet, useApiRows } from '../lib/api'
import { competitionCodesForScope, useReportingScope, useScopedCompetitionAthletes } from '../lib/reportingScope'
import { AthleteDetailPage } from './AthleteDetailPage'
import type { CompetitionRow, ResultRow } from '../types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ResultsPage() {
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)
  const [rows, setRows] = useState<ResultRow[]>([])
  const [resultsLoading, setResultsLoading] = useState(false)
  const [resultsError, setResultsError] = useState<string | null>(null)

  const {
    rows: competitions,
    loading: competitionsLoading,
    error: competitionsError,
  } = useApiRows<CompetitionRow>('/api/competitions')
  const { scope } = useReportingScope()
  const scopedCompetitionCodes = useMemo(() => competitionCodesForScope(scope, competitions), [scope, competitions])
  const { athletes: scopedAthletes, loading: athletesLoading } = useScopedCompetitionAthletes(scope, competitions)

  useEffect(() => {
    const selectedCompetitions = competitions.filter((competition) => scopedCompetitionCodes.includes(competition.code))
    if (!selectedCompetitions.length) { setRows([]); setResultsLoading(false); return }
    let alive = true
    setResultsLoading(true)
    Promise.all(selectedCompetitions.map((competition) => apiGet<ResultRow[]>(`/api/results?competitionId=${encodeURIComponent(competition.id)}`)))
      .then((lists) => { if (alive) { setRows(lists.flat()); setResultsError(null) } })
      .catch(() => { if (alive) setResultsError('Não foi possível carregar os resultados.') })
      .finally(() => { if (alive) setResultsLoading(false) })
    return () => { alive = false }
  }, [competitions, scopedCompetitionCodes])

  const weightOptions = useMemo(() => [...new Set(rows.map((row) => row.weightCategoryShortName).filter((value): value is string => Boolean(value)))].sort(), [rows])
  const stateOptions = useMemo(() => [...new Set(rows.map((row) => row.teamAlternateName).filter((value): value is string => Boolean(value)))].sort(), [rows])
  const [selectedWeights, setSelectedWeights] = useState<string[]>([])
  const [selectedStates, setSelectedStates] = useState<string[]>([])

  useEffect(() => { setSelectedWeights([]); setSelectedStates([]) }, [scope.competitionCode, scope.year, scope.styles])
  useEffect(() => { if (weightOptions.length && selectedWeights.length === 0) setSelectedWeights(weightOptions) }, [weightOptions, selectedWeights])
  useEffect(() => { if (stateOptions.length && selectedStates.length === 0) setSelectedStates(stateOptions) }, [stateOptions, selectedStates])

  const scopedAthleteIds = useMemo(() => new Set(scopedAthletes.map((athlete) => athlete.entryId)), [scopedAthletes])
  const filteredRows = useMemo(() => rows.filter((row) =>
    scopedAthleteIds.has(row.entryId) && selectedWeights.includes(row.weightCategoryShortName ?? '') && selectedStates.includes(row.teamAlternateName ?? ''),
  ), [rows, scopedAthleteIds, selectedWeights, selectedStates])

  const selectedCompetition = useMemo(
    () => scope.competitionCode === 'all' ? null : competitions.find((competition) => competition.code === scope.competitionCode),
    [competitions, scope.competitionCode]
  )

  if (selectedEntry) {
    return (
      <PageHeader active="results">
        <AthleteDetailPage
          entryId={selectedEntry}
          onBack={() => setSelectedEntry(null)}
          backLabel="Resultados"
        />
      </PageHeader>
    )
  }

  const fights = filteredRows.reduce((total, row) => total + Number(row.countFights || 0), 0)
  const statesCount = new Set(filteredRows.map((row) => row.teamAlternateName)).size
  const categories = new Set(filteredRows.map((row) => row.weightCategoryShortName)).size
  const loading = competitionsLoading || resultsLoading || athletesLoading

  return (
    <PageHeader active="results">
      <div className="@container/main">
        <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl leading-none tracking-tight">Classificações oficiais</h1>
            <p className="text-sm text-muted-foreground">Desempenho e pódio consolidados a partir dos resultados dos Jogos Escolares.</p>
          </div>

          <div className="mb-4 flex flex-col items-start justify-between gap-3 @xl/main:flex-row @xl/main:items-end">
            <div>
              <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground">RANKING POR EVENTO</p>
              <h2 className="font-heading text-2xl font-semibold text-foreground">Atletas classificados</h2>
            </div>

            <div className="flex flex-wrap items-end gap-2">
              <FilterDropdown label="Categoria" options={weightOptions.map((value) => ({ value, label: value }))} value={selectedWeights} onChange={setSelectedWeights} disabled={resultsLoading} />
              <FilterDropdown label="UF" options={stateOptions.map((value) => ({ value, label: value }))} value={selectedStates} onChange={setSelectedStates} disabled={resultsLoading} />
            </div>
          </div>

          {competitionsError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>Não foi possível carregar as competições.</AlertDescription>
            </Alert>
          )}
          {resultsError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>Não foi possível carregar os resultados.</AlertDescription>
            </Alert>
          )}

          <div className="mb-4 grid grid-cols-2 gap-4 @xl/main:grid-cols-4">
            <Metric label="Atletas classificados" value={loading ? '—' : String(filteredRows.length)} />
            <Metric label="Lutas registradas" value={loading ? '—' : String(fights)} />
            <Metric label="Categorias de peso" value={loading ? '—' : String(categories)} />
            <Metric label="Estados representados" value={loading ? '—' : String(statesCount)} />
          </div>

          <div className="grid grid-cols-1 gap-4 @4xl/main:grid-cols-[7fr_3fr]">
            <Card className="gap-0 py-0">
              <CardHeader className="border-b py-4 [.border-b]:pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>Classificação geral</CardTitle>
                    <CardDescription>
                      {selectedCompetition
                        ? 'Ordenada por posição na categoria'
                        : 'Consolidada a partir do recorte global'}
                    </CardDescription>
                  </div>
                  {selectedCompetition && <Badge variant="outline" className="shrink-0">{selectedCompetition.code}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 px-0">
                <div className="overflow-x-auto">
                <Table className="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4 **:data-[slot='table-cell']:py-4">
                  <TableCaption className="sr-only">
                    Classificação dos atletas do evento selecionado
                  </TableCaption>
                  <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-medium **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
                    <TableRow>
                      <TableHead>Pos.</TableHead>
                      <TableHead>Atleta</TableHead>
                      <TableHead>UF</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>V-D</TableHead>
                      <TableHead>Pontos técnicos</TableHead>
                      <TableHead>Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-row']:hover:bg-muted/30">
                    {resultsLoading ? (
                      <TableRow><TableCell colSpan={7}>Carregando resultados...</TableCell></TableRow>
                    ) : filteredRows.length === 0 ? (
                      <TableRow><TableCell colSpan={7}>Nenhum resultado encontrado.</TableCell></TableRow>
                    ) : (
                      filteredRows.slice(0, 18).map((row) => (
                        <TableRow
                          key={row.entryId}
                          className="cursor-pointer"
                          onClick={() => setSelectedEntry(row.entryId)}
                          title="Ver detalhe do atleta"
                        >
                          <TableCell className="text-muted-foreground">{row.rank}</TableCell>
                          <TableCell className="font-medium"><AthleteCell name={row.fullName} /></TableCell>
                          <TableCell className="text-muted-foreground">{row.teamAlternateName}</TableCell>
                          <TableCell>{row.weightCategoryShortName}</TableCell>
                          <TableCell>{row.wins}-{row.losses}</TableCell>
                          <TableCell className="font-mono">{row.technicalPointsFor}</TableCell>
                          <TableCell className="font-mono">
                            {row.technicalPointsDiff != null && row.technicalPointsDiff >= 0
                              ? `+${row.technicalPointsDiff}`
                              : row.technicalPointsDiff}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
                <p className="px-4 pb-1 text-sm text-muted-foreground">Visualizando {Math.min(filteredRows.length, 18)} de {filteredRows.length.toLocaleString('pt-BR')} atletas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription className="text-xs font-medium tracking-wide">DESTAQUES</CardDescription>
                <CardTitle>Ouro por categoria</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {resultsLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : filteredRows.filter((row) => row.rank === 1).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum campeão encontrado.</p>
                ) : (
                  filteredRows
                    .filter((row) => row.rank === 1)
                    .slice(0, 4)
                    .map((row, index) => (
                      <div
                        className="flex items-center gap-3"
                        key={`${row.fullName}-${row.weightCategoryShortName}`}
                      >
                        <span className="font-mono text-sm text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                        <div className="flex-1">
                          <strong className="block text-sm font-medium">{row.fullName}</strong>
                          <small className="text-xs text-muted-foreground">
                            {row.teamAlternateName}
                            {' · '}
                            {row.weightCategoryShortName}
                          </small>
                        </div>
                        <Medal className="size-4 text-muted-foreground" aria-hidden="true" />
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </PageHeader>
  )
}