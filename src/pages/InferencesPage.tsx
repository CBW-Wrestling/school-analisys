import { useEffect, useMemo, useState } from 'react'
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'
import { Medal } from 'lucide-react'
import { FilterDropdown } from '../components/FilterDropdown'
import { InfoTooltip } from '../components/InfoTooltip'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { apiGet, useApiRows } from '../lib/api'
import { buildInferenceSummary } from '../lib/inferenceSummary'
import { AVERAGE_SCORE_EXPLANATION, COMPLETION_EXPLANATION, average, labelForStyle, scoreAndCompletionByCompetencia, scoreFor, visibleMotorRows } from '../lib/motorScore'
import { competitionCodesForScope, useReportingScope } from '../lib/reportingScope'
import { Z_SCORE_EXPLANATION, meanAndStdDev, zScoreFor } from '../lib/zscore'
import type { CompetitionRow, MotorRow, ResultRow } from '../types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

export function InferencesPage() {
  const { rows: competitions, loading: competitionsLoading, error: competitionsError } = useApiRows<CompetitionRow>('/api/competitions')
  const { rows: motorRows, loading: motorLoading, error: motorError } = useApiRows<MotorRow>('/api/dashboard/motor')
  const { scope } = useReportingScope()
  const scopedCompetitionCodes = useMemo(() => competitionCodesForScope(scope, competitions), [scope, competitions])
  const nationalCompetitionCodes = useMemo(() => competitionCodesForScope({ ...scope, competitionCode: 'all' }, competitions), [scope, competitions])
  const [results, setResults] = useState<ResultRow[]>([])
  const [resultsLoading, setResultsLoading] = useState(false)
  const [resultsError, setResultsError] = useState<string | null>(null)

  useEffect(() => {
    const selectedCompetitions = competitions.filter((competition) => scopedCompetitionCodes.includes(competition.code))
    if (!selectedCompetitions.length) { setResults([]); setResultsLoading(false); return }
    let alive = true
    setResultsLoading(true)
    Promise.all(selectedCompetitions.map((competition) => apiGet<ResultRow[]>(`/api/results?competitionId=${encodeURIComponent(competition.id)}`)))
      .then((lists) => { if (alive) { setResults(lists.flat()); setResultsError(null) } })
      .catch(() => { if (alive) setResultsError('Não foi possível carregar os resultados da competição.') })
      .finally(() => { if (alive) setResultsLoading(false) })
    return () => { alive = false }
  }, [competitions, scopedCompetitionCodes])

  const gold = results.filter((row) => row.rank === 1).length
  const silver = results.filter((row) => row.rank === 2).length
  const bronze = results.filter((row) => row.rank === 3).length
  const pointsFor = results.reduce((sum, row) => sum + (row.technicalPointsFor ?? 0), 0)
  const pointsDiff = results.reduce((sum, row) => sum + (row.technicalPointsDiff ?? 0), 0)
  const pointsAgainst = pointsFor - pointsDiff

  const eventRows = useMemo(() => visibleMotorRows(motorRows.filter((row) => scopedCompetitionCodes.includes(row.eventIdentifier ?? '') && scope.styles.includes(row.estilo ?? ''))), [motorRows, scopedCompetitionCodes, scope.styles])
  const nationalRows = useMemo(() => visibleMotorRows(motorRows.filter((row) => nationalCompetitionCodes.includes(row.eventIdentifier ?? '') && scope.styles.includes(row.estilo ?? ''))), [motorRows, nationalCompetitionCodes, scope.styles])
  const competencyStats = useMemo(() => scoreAndCompletionByCompetencia(eventRows), [eventRows])
  const overallAverage = average(eventRows.map((row) => scoreFor(row.resultado)))
  const summaryText = buildInferenceSummary(overallAverage, competencyStats)

  const nationalStats = useMemo(() => meanAndStdDev(nationalRows.map((row) => scoreFor(row.resultado))), [nationalRows])
  const eventZScore = zScoreFor(overallAverage, nationalStats.mean, nationalStats.stdDev)

  const loading = competitionsLoading || motorLoading

  return (
    <PageHeader active="inferences">
      <section className="mx-auto w-full max-w-[1400px] px-4 py-4 md:px-6">
        <h1 className="text-3xl leading-none tracking-tight">O retrato consolidado do desempenho.</h1>
        <p className="mt-1 max-w-[640px] text-sm text-muted-foreground">Medalhas, pontos técnicos e a principal oportunidade de desenvolvimento por competência.</p>
      </section>
      <div className="@container/main">
        <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1"><p className="text-sm text-muted-foreground">Selecione a competição para consolidar o relatório.</p></div>
            <p className="text-sm text-muted-foreground">Resultados e indicadores respeitam o recorte global acima.</p>
          </div>

          {competitionsError && <Alert variant="destructive"><AlertDescription>Não foi possível carregar as competições.</AlertDescription></Alert>}
          {motorError && <Alert variant="destructive"><AlertDescription>Não foi possível carregar os dados técnicos.</AlertDescription></Alert>}
          {resultsError && <Alert variant="destructive"><AlertDescription>Não foi possível carregar os resultados da competição.</AlertDescription></Alert>}

          <Card className="bg-muted/30"><CardContent className="py-4 text-sm">{loading ? <Skeleton className="h-5 w-full" /> : summaryText}</CardContent></Card>

          <div className="grid grid-cols-2 gap-4 @xl/main:grid-cols-5">
            <Metric loading={resultsLoading} label="Medalhas de ouro" value={String(gold)} />
            <Metric loading={resultsLoading} label="Medalhas de prata" value={String(silver)} />
            <Metric loading={resultsLoading} label="Medalhas de bronze" value={String(bronze)} />
            <Metric loading={resultsLoading} label="Pontos técnicos marcados" value={String(pointsFor)} />
            <Metric loading={resultsLoading} label="Pontos técnicos sofridos" value={String(pointsAgainst)} />
          </div>
          {!resultsLoading && scopedCompetitionCodes.length > 0 && !results.length && <p className="text-sm text-muted-foreground">Nenhum resultado encontrado no recorte global.</p>}

          <div className="grid gap-4 @2xl/main:grid-cols-[minmax(0,1fr)_minmax(280px,0.5fr)]">
            {loading ? <Skeleton className="h-80 w-full rounded-lg" /> : !competencyStats.length ? <p className="text-sm text-muted-foreground">Nenhum dado técnico para esta competição.</p> : <Card><CardHeader><CardDescription>DESEMPENHO POR COMPETÊNCIA</CardDescription><CardTitle className="flex items-center gap-2">Pontuação média e % de completação<InfoTooltip label="O que é pontuação média e % de completação?" content={<span className="flex flex-col gap-1"><span>{AVERAGE_SCORE_EXPLANATION}</span><span>{COMPLETION_EXPLANATION}</span></span>} /></CardTitle></CardHeader><CardContent><ChartContainer config={{ score: { label: 'Pontuação média', color: 'var(--chart-1)' }, completionPct: { label: '% Completação', color: 'var(--chart-2)' } }} className="h-72 w-full" role="img" aria-label="Barras de pontuação média e linha de percentual de completação por competência."><ComposedChart data={competencyStats} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="competencia" axisLine={false} tickLine={false} tickMargin={8} /><YAxis yAxisId="score" domain={[0, 2]} axisLine={false} tickLine={false} width={28} /><YAxis yAxisId="pct" orientation="right" domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} width={42} /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent />} /><Bar yAxisId="score" dataKey="score" fill="var(--color-score)" radius={4} /><Line yAxisId="pct" type="monotone" dataKey="completionPct" stroke="var(--color-completionPct)" strokeWidth={2.5} dot={{ r: 4 }} /></ComposedChart></ChartContainer></CardContent></Card>}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2"><CardDescription>COMPARATIVO NACIONAL</CardDescription><InfoTooltip label="O que é Z-Score?" content={Z_SCORE_EXPLANATION} /></div>
                <CardTitle className="flex items-center gap-2"><Medal className="size-4 text-muted-foreground" aria-hidden />Z-Score da competição</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {loading ? <Skeleton className="h-9 w-24" /> : <p className="font-mono text-3xl font-semibold tabular-nums">{eventZScore === null ? '—' : `${eventZScore >= 0 ? '+' : ''}${eventZScore.toFixed(2)}`}</p>}
                <p className="text-sm text-muted-foreground">Compara a pontuação técnica média desta competição com a média histórica nacional.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </PageHeader>
  )
}
