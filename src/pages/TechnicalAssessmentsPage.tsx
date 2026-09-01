import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, Scatter, ScatterChart, XAxis, YAxis } from 'recharts'
import { Info, RotateCcw } from 'lucide-react'
import { BarRow } from '../components/BarRow'
import { FilterDropdown } from '../components/FilterDropdown'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { BrazilHeatmap } from '../components/dashboard/BrazilHeatmap'
import { apiGet, useApiData, useApiRows } from '../lib/api'
import { pearsonCorrelation } from '../lib/correlation'
import { REGION_BY_STATE, REGION_ORDER, average, completionPctByEstado, labelForStyle, scoreByEstado, scoreFor } from '../lib/motorScore'
import { Z_SCORE_EXPLANATION, meanAndStdDev, zScoreFor } from '../lib/zscore'
import { mockAthleteMotorScores } from '../mocks/dashboard-gaps'
import type { CompetitionRow, MotorRow, MotorSummary, ResultRow } from '../types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const DIMENSIONS = ['Acrobacias', 'Pé', 'Solo'] as const

function dimensionFor(row: MotorRow): (typeof DIMENSIONS)[number] {
  const movement = (row.avaliacao ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (/ponte|acrob|rolamento/.test(movement)) return 'Acrobacias'
  if (/guarda|role|arranco|nelson|cruzeta|solo/.test(movement)) return 'Solo'
  return 'Pé'
}

function ZScoreInfo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="inline-flex items-center text-muted-foreground hover:text-foreground" aria-label="O que é Z-Score?">
            <Info className="size-4" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">{Z_SCORE_EXPLANATION}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function TechnicalAssessmentsPage() {
  const { data: summary, loading: summaryLoading } = useApiData<MotorSummary>('/api/dashboard/motor/summary')
  const { rows: competitions, loading: competitionsLoading, error: competitionsError } = useApiRows<CompetitionRow>('/api/competitions')
  const { rows: motorRows, loading: motorLoading, error: motorError } = useApiRows<MotorRow>('/api/dashboard/motor')
  const loading = competitionsLoading || motorLoading
  const styles = useMemo(() => Array.from(new Set(motorRows.map((row) => row.estilo).filter((style): style is string => Boolean(style)))).sort(), [motorRows])
  const events = useMemo(() => competitions.map((competition) => ({ value: competition.code, label: `${competition.name}${competition.year ? ` - ${competition.year}` : ''}` })), [competitions])
  const [dimensions, setDimensions] = useState<string[]>([])
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  useEffect(() => { if (motorRows.length && dimensions.length === 0) setDimensions([...DIMENSIONS]) }, [motorRows, dimensions])
  useEffect(() => { if (styles.length && selectedStyles.length === 0) setSelectedStyles(styles) }, [styles, selectedStyles])
  useEffect(() => { if (events.length && selectedEvents.length === 0) setSelectedEvents(events.map((event) => event.value)) }, [events, selectedEvents])

  const rows = useMemo(() => motorRows.filter((row) =>
    dimensions.includes(dimensionFor(row)) && selectedStyles.includes(row.estilo ?? '') && selectedEvents.includes(row.eventIdentifier ?? ''),
  ), [motorRows, dimensions, selectedStyles, selectedEvents])
  const averageScore = average(rows.map((row) => scoreFor(row.resultado)))
  const completionRate = rows.length ? rows.filter((row) => row.resultado === 'COMPLETE').length / rows.length : null

  const regionalData = useMemo(() => REGION_ORDER.map((region) => {
    const regionalRows = rows.filter((row) => REGION_BY_STATE[row.estado ?? ''] === region)
    return { region, pontuacao: regionalRows.length ? Number((average(regionalRows.map((row) => scoreFor(row.resultado))) ?? 0).toFixed(2)) : null, registros: regionalRows.length }
  }).filter((item) => item.registros), [rows])
  const stateData = useMemo(() => completionPctByEstado(rows), [rows])

  const estadoScores = useMemo(() => scoreByEstado(rows), [rows])
  const nationalStats = useMemo(() => meanAndStdDev(estadoScores.map((item) => item.score).filter((value): value is number => value !== null)), [estadoScores])
  const [selectedZScoreState, setSelectedZScoreState] = useState<string | null>(null)
  const zScoreMapValues = useMemo(() => estadoScores.map((item) => ({ code: item.estado, name: item.estado, count: item.count, score: item.score, engagement: 0, dimensions: [] })), [estadoScores])
  const zScoreBarData = useMemo(() => estadoScores
    .map((item) => ({ estado: item.estado, zScore: zScoreFor(item.score, nationalStats.mean, nationalStats.stdDev) }))
    .filter((item): item is { estado: string; zScore: number } => item.zScore !== null)
    .sort((first, second) => second.zScore - first.zScore), [estadoScores, nationalStats])

  // Correlações: cruza resultados reais (/api/results) com pontuação técnica por atleta (mock, ver GAP 1 no BACKEND_GAPS.md)
  const [resultRows, setResultRows] = useState<ResultRow[]>([])
  const [resultsLoading, setResultsLoading] = useState(false)
  useEffect(() => {
    const ids = competitions.filter((competition) => selectedEvents.includes(competition.code)).map((competition) => competition.id)
    if (!ids.length) { setResultRows([]); return }
    let alive = true
    setResultsLoading(true)
    Promise.all(ids.map((id) => apiGet<ResultRow[]>(`/api/results?competitionId=${encodeURIComponent(id)}`)))
      .then((lists) => { if (alive) setResultRows(lists.flat()) })
      .catch(() => { if (alive) setResultRows([]) })
      .finally(() => { if (alive) setResultsLoading(false) })
    return () => { alive = false }
  }, [selectedEvents, competitions])

  const athleteScores = useMemo(() => mockAthleteMotorScores(resultRows), [resultRows])
  const scoreByEntryId = useMemo(() => new Map(athleteScores.map((item) => [item.entryId, item.averageScore])), [athleteScores])
  const correlationRows = useMemo(() => resultRows
    .filter((row) => row.rank !== null)
    .map((row) => ({ ...row, score: scoreByEntryId.get(row.entryId) ?? 0 })), [resultRows, scoreByEntryId])
  const rankScatter = correlationRows.map((row) => ({ x: row.rank as number, y: row.score }))
  const winsScatter = correlationRows.filter((row) => row.wins !== null).map((row) => ({ x: row.wins as number, y: row.score }))
  const pointsScatter = correlationRows.filter((row) => row.technicalPointsFor !== null).map((row) => ({ x: row.technicalPointsFor as number, y: row.score }))
  const coefRank = pearsonCorrelation(rankScatter)
  const coefWins = pearsonCorrelation(winsScatter)
  const coefPoints = pearsonCorrelation(pointsScatter)

  const hasCustomFilters = dimensions.length !== DIMENSIONS.length || selectedStyles.length !== styles.length || selectedEvents.length !== events.length
  const resetFilters = () => { setDimensions([...DIMENSIONS]); setSelectedStyles(styles); setSelectedEvents(events.map((event) => event.value)) }
  const [activeTab, setActiveTab] = useState('overview')

  const filterToolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <FilterDropdown label="Dimensões" options={DIMENSIONS.map((value) => ({ value, label: value }))} value={dimensions} onChange={setDimensions} disabled={loading} />
      <FilterDropdown label="Estilos" options={styles.map((value) => ({ value, label: labelForStyle(value) }))} value={selectedStyles} onChange={setSelectedStyles} disabled={loading} />
      <FilterDropdown label="Eventos" options={events} value={selectedEvents} onChange={setSelectedEvents} disabled={loading} />
      <Button variant="ghost" size="sm" onClick={resetFilters} disabled={!hasCustomFilters}><RotateCcw aria-hidden="true" />Restaurar</Button>
    </div>
  )

  return (
    <PageHeader active="motor">
      <div className="@container/main">
        <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex flex-col gap-1"><h1 className="text-3xl leading-none tracking-tight">Raio-X do tapete</h1><p className="text-sm text-muted-foreground">Visão geral, recorte regional, comparação nacional e correlações de desempenho técnico.</p></div>

          {competitionsError && <Alert variant="destructive"><AlertDescription>Não foi possível carregar as competições.</AlertDescription></Alert>}
          {motorError && <Alert variant="destructive"><AlertDescription>Não foi possível carregar os dados técnicos.</AlertDescription></Alert>}
          <p className="sr-only" aria-live="polite" aria-atomic="true">{loading ? 'Atualizando análise técnica.' : `${rows.length} movimentos no recorte atual.`}</p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="overview">Visão geral</TabsTrigger>
                <TabsTrigger value="regional">Regional</TabsTrigger>
                <TabsTrigger value="zscore">Mapa Z-Score</TabsTrigger>
                <TabsTrigger value="correlations">Correlações</TabsTrigger>
              </TabsList>
              {activeTab !== 'overview' && filterToolbar}
            </div>

            <TabsContent value="overview" className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 @xl/main:grid-cols-4">
                <Metric label="Movimentos avaliados" value={summaryLoading ? '—' : String(summary?.totalMovements ?? 0)} />
                <Metric label="Execuções completas" value={summaryLoading ? '—' : String(summary?.completeCount ?? 0)} />
                <Metric label="Taxa de domínio" value={summaryLoading ? '—' : `${summary?.dominanceRate ?? 0}%`} />
                <Metric label="Competências" value={summaryLoading ? '—' : String(summary?.competenciesCount ?? 0)} />
              </div>
              <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
                <Card><CardHeader><CardDescription className="text-xs font-medium tracking-wide">RESULTADO</CardDescription><CardTitle>Qualidade da execução</CardTitle></CardHeader><CardContent>{(summary?.byResult ?? []).map(({ code, label, count }) => <BarRow key={code} label={label} value={count} total={summary!.totalMovements} />)}</CardContent></Card>
                <Card><CardHeader><CardDescription className="text-xs font-medium tracking-wide">COBERTURA</CardDescription><CardTitle>Movimentos por competência</CardTitle></CardHeader><CardContent>{(summary?.byCompetency ?? []).map(({ code, label, count }) => <BarRow key={code} label={label} value={count} total={summary!.totalMovements} />)}</CardContent></Card>
              </div>
            </TabsContent>

            <TabsContent value="regional" className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3"><Metric loading={loading} label="Pontuação média" value={averageScore === null ? '—' : averageScore.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /><Metric loading={loading} label="Percentual de compleção" value={completionRate === null ? '—' : `${Math.round(completionRate * 100)}%`} /><Card className="bg-muted/35"><CardHeader><CardDescription>BASE ANALISADA</CardDescription><CardTitle className="font-mono text-2xl tabular-nums">{loading ? '—' : rows.length}</CardTitle><p className="text-sm text-muted-foreground">movimentos no recorte atual</p></CardHeader></Card></div>
              {loading ? <div className="grid gap-4 @2xl/main:grid-cols-2"><Skeleton className="h-80 w-full rounded-lg" /><Skeleton className="h-80 w-full rounded-lg" /></div> : !regionalData.length && !stateData.length ? <p className="text-sm text-muted-foreground">Nenhum movimento no recorte atual.</p> : <div className="grid items-stretch gap-4 @2xl/main:grid-cols-2">
                <Card><CardHeader><CardDescription>PONTUAÇÃO TÉCNICA</CardDescription><CardTitle>Pontuação média por região</CardTitle><p className="text-sm text-muted-foreground">Escala de 0 a 2 pontos por execução registrada.</p></CardHeader><CardContent><p id="regional-chart-description" className="sr-only">A linha compara a pontuação média entre as regiões brasileiras no recorte selecionado.</p><ChartContainer config={{ pontuacao: { label: 'Pontuação média', color: 'var(--chart-1)' } }} className="h-80 w-full" role="img" aria-label="Linha da pontuação média de execução por região brasileira." aria-describedby="regional-chart-description"><LineChart data={regionalData} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="region" axisLine={false} tickLine={false} tickMargin={8} /><YAxis domain={[0, 2]} ticks={[0, 1, 2]} axisLine={false} tickLine={false} width={28} /><ChartTooltip content={<ChartTooltipContent />} /><Line type="monotone" dataKey="pontuacao" stroke="var(--color-pontuacao)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls /></LineChart></ChartContainer></CardContent></Card>
                <Card><CardHeader><CardDescription>EXECUÇÃO POR UF</CardDescription><CardTitle>Percentuais de execução por estado</CardTitle><p className="text-sm text-muted-foreground">Estados ordenados do maior para o menor desempenho técnico.</p></CardHeader><CardContent><p id="state-chart-description" className="sr-only">Cada barra representa cem por cento dos movimentos avaliados em um estado e separa execução completa, parcial e não completada.</p><ChartContainer config={{ completo: { label: 'Completo', color: 'var(--chart-1)' }, parcial: { label: 'Parcial', color: 'var(--chart-4)' }, naoCompletou: { label: 'Não completou', color: 'var(--destructive)' } }} className="h-80 w-full" role="img" aria-label="Barras empilhadas a cem por cento com execução completa, parcial e não completada por estado." aria-describedby="state-chart-description"><BarChart data={stateData} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="estado" axisLine={false} tickLine={false} tickMargin={8} /><YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} width={42} /><ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => `${Number(value).toFixed(0)}%`} />} /><ChartLegend content={<ChartLegendContent />} /><Bar dataKey="completo" stackId="execucao" fill="var(--color-completo)" radius={[0, 0, 3, 3]} /><Bar dataKey="parcial" stackId="execucao" fill="var(--color-parcial)" /><Bar dataKey="naoCompletou" stackId="execucao" fill="var(--color-naoCompletou)" radius={[3, 3, 0, 0]} /></BarChart></ChartContainer></CardContent></Card>
              </div>}
            </TabsContent>

            <TabsContent value="zscore" className="flex flex-col gap-4">
              <div className="flex items-center gap-2"><h2 className="text-lg font-semibold">Comparação por Z-Score</h2><ZScoreInfo /></div>
              <BrazilHeatmap loading={loading} values={zScoreMapValues} selectedState={selectedZScoreState} nationalAverage={nationalStats.mean} nationalStdDev={nationalStats.stdDev} onSelect={setSelectedZScoreState} />
              {loading ? <Skeleton className="h-72 w-full rounded-lg" /> : !zScoreBarData.length ? <p className="text-sm text-muted-foreground">Nenhum estado com dados suficientes para calcular Z-Score no recorte atual.</p> : <Card><CardHeader><CardDescription>RANKING ESTADUAL</CardDescription><CardTitle>Z-Score por estado</CardTitle><p className="text-sm text-muted-foreground">Estados ordenados do maior para o menor Z-Score técnico.</p></CardHeader><CardContent><p id="zscore-chart-description" className="sr-only">Barras ordenadas do maior para o menor Z-Score por estado.</p><ChartContainer config={{ zScore: { label: 'Z-Score', color: 'var(--chart-2)' } }} className="h-72 w-full" role="img" aria-label="Barras do Z-Score técnico por estado." aria-describedby="zscore-chart-description"><BarChart data={zScoreBarData} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="estado" axisLine={false} tickLine={false} tickMargin={8} /><YAxis axisLine={false} tickLine={false} width={36} /><ChartTooltip content={<ChartTooltipContent formatter={(value) => Number(value).toFixed(2)} />} /><Bar dataKey="zScore" fill="var(--color-zScore)" radius={[3, 3, 3, 3]} /></BarChart></ChartContainer></CardContent></Card>}
            </TabsContent>

            <TabsContent value="correlations" className="flex flex-col gap-4">
              <Alert><AlertDescription>A pontuação técnica por atleta usada nesta aba ainda é simulada — o backend não expõe esse cruzamento hoje (ver <code>BACKEND_GAPS.md</code>, GAP 1). Colocação, vitórias e pontos técnicos são dados reais.</AlertDescription></Alert>
              {!resultsLoading && !correlationRows.length ? <p className="text-sm text-muted-foreground">Nenhum resultado disponível para os eventos selecionados.</p> : <>
              <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
                <Metric loading={resultsLoading} label="Coeficiente vs. colocação" value={coefRank === null ? '—' : coefRank.toFixed(2)} />
                <Metric loading={resultsLoading} label="Coeficiente vs. pontos técnicos" value={coefPoints === null ? '—' : coefPoints.toFixed(2)} />
                <Metric loading={resultsLoading} label="Coeficiente vs. vitórias" value={coefWins === null ? '—' : coefWins.toFixed(2)} />
              </div>
              {resultsLoading ? <Skeleton className="h-80 w-full rounded-lg" /> : <div className="grid gap-4 @2xl/main:grid-cols-3">
                <Card><CardHeader><CardDescription>DISPERSÃO</CardDescription><CardTitle className="text-base">Pontuação × colocação</CardTitle></CardHeader><CardContent><ChartContainer config={{ score: { label: 'Pontuação', color: 'var(--chart-1)' } }} className="h-64 w-full" role="img" aria-label="Dispersão entre pontuação técnica e colocação."><ScatterChart margin={{ top: 12, right: 12, bottom: 8, left: 0 }}><CartesianGrid vertical={false} /><XAxis type="number" dataKey="x" name="Colocação" axisLine={false} tickLine={false} /><YAxis type="number" dataKey="y" name="Pontuação" domain={[0, 2]} axisLine={false} tickLine={false} width={28} /><ChartTooltip content={<ChartTooltipContent />} /><Scatter data={rankScatter} fill="var(--color-score)" /></ScatterChart></ChartContainer></CardContent></Card>
                <Card><CardHeader><CardDescription>DISPERSÃO</CardDescription><CardTitle className="text-base">Pontuação × pontos técnicos</CardTitle></CardHeader><CardContent><ChartContainer config={{ score: { label: 'Pontuação', color: 'var(--chart-1)' } }} className="h-64 w-full" role="img" aria-label="Dispersão entre pontuação técnica e pontos técnicos marcados."><ScatterChart margin={{ top: 12, right: 12, bottom: 8, left: 0 }}><CartesianGrid vertical={false} /><XAxis type="number" dataKey="x" name="Pontos técnicos" axisLine={false} tickLine={false} /><YAxis type="number" dataKey="y" name="Pontuação" domain={[0, 2]} axisLine={false} tickLine={false} width={28} /><ChartTooltip content={<ChartTooltipContent />} /><Scatter data={pointsScatter} fill="var(--color-score)" /></ScatterChart></ChartContainer></CardContent></Card>
                <Card><CardHeader><CardDescription>DISPERSÃO</CardDescription><CardTitle className="text-base">Pontuação × vitórias</CardTitle></CardHeader><CardContent><ChartContainer config={{ score: { label: 'Pontuação', color: 'var(--chart-1)' } }} className="h-64 w-full" role="img" aria-label="Dispersão entre pontuação técnica e número de vitórias."><ScatterChart margin={{ top: 12, right: 12, bottom: 8, left: 0 }}><CartesianGrid vertical={false} /><XAxis type="number" dataKey="x" name="Vitórias" axisLine={false} tickLine={false} /><YAxis type="number" dataKey="y" name="Pontuação" domain={[0, 2]} axisLine={false} tickLine={false} width={28} /><ChartTooltip content={<ChartTooltipContent />} /><Scatter data={winsScatter} fill="var(--color-score)" /></ScatterChart></ChartContainer></CardContent></Card>
              </div>}
              </>}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageHeader>
  )
}