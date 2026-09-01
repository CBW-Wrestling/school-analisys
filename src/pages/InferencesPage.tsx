import { useEffect, useMemo, useState } from 'react'
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'
import { Medal } from 'lucide-react'
import { FilterDropdown } from '../components/FilterDropdown'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { SearchableSelect } from '../components/SearchableSelect'
import { useApiRows } from '../lib/api'
import { buildInferenceSummary } from '../lib/inferenceSummary'
import { average, labelForStyle, scoreAndCompletionByCompetencia, scoreFor, visibleMotorRows } from '../lib/motorScore'
import { Z_SCORE_EXPLANATION, meanAndStdDev, zScoreFor } from '../lib/zscore'
import type { CompetitionRow, MotorRow, ResultRow } from '../types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function InferencesPage() {
  const { rows: competitions, loading: competitionsLoading, error: competitionsError } = useApiRows<CompetitionRow>('/api/competitions')
  const { rows: motorRows, loading: motorLoading, error: motorError } = useApiRows<MotorRow>('/api/dashboard/motor')
  const [competitionCode, setCompetitionCode] = useState('')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])

  useEffect(() => { if (!competitionCode && competitions.length) setCompetitionCode(competitions[0].code) }, [competitions, competitionCode])

  const styles = useMemo(() => Array.from(new Set(motorRows.map((row) => row.estilo).filter((style): style is string => Boolean(style)))).sort(), [motorRows])
  useEffect(() => { if (styles.length && selectedStyles.length === 0) setSelectedStyles(styles) }, [styles, selectedStyles])

  const selectedCompetition = competitions.find((competition) => competition.code === competitionCode)
  const { rows: results, loading: resultsLoading, error: resultsError } = useApiRows<ResultRow>(
    selectedCompetition ? `/api/results?competitionId=${encodeURIComponent(selectedCompetition.id)}` : '',
    Boolean(selectedCompetition),
  )

  const gold = results.filter((row) => row.rank === 1).length
  const silver = results.filter((row) => row.rank === 2).length
  const bronze = results.filter((row) => row.rank === 3).length
  const pointsFor = results.reduce((sum, row) => sum + (row.technicalPointsFor ?? 0), 0)
  const pointsDiff = results.reduce((sum, row) => sum + (row.technicalPointsDiff ?? 0), 0)
  const pointsAgainst = pointsFor - pointsDiff

  const eventRows = useMemo(() => visibleMotorRows(motorRows.filter((row) => row.eventIdentifier === competitionCode && selectedStyles.includes(row.estilo ?? ''))), [motorRows, competitionCode, selectedStyles])
  const competencyStats = useMemo(() => scoreAndCompletionByCompetencia(eventRows), [eventRows])
  const overallAverage = average(eventRows.map((row) => scoreFor(row.resultado)))
  const summaryText = buildInferenceSummary(overallAverage, competencyStats)

  const nationalStats = useMemo(() => meanAndStdDev(visibleMotorRows(motorRows).map((row) => scoreFor(row.resultado))), [motorRows])
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
            <div className="flex flex-wrap items-end gap-2">
              <FilterDropdown label="Estilos" options={styles.map((value) => ({ value, label: labelForStyle(value) }))} value={selectedStyles} onChange={setSelectedStyles} disabled={motorLoading} />
              <SearchableSelect className="w-64" placeholder="Competição" ariaLabel="Selecionar competição" disabled={competitionsLoading} value={competitionCode} onChange={setCompetitionCode} options={competitions.map((competition) => ({ value: competition.code, label: `${competition.name}${competition.year ? ` · ${competition.year}` : ''}` }))} />
            </div>
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
          {!resultsLoading && selectedCompetition && !results.length && <p className="text-sm text-muted-foreground">Nenhum resultado encontrado para esta competição.</p>}

          <div className="grid gap-4 @2xl/main:grid-cols-[minmax(0,1fr)_minmax(280px,0.5fr)]">
            {loading ? <Skeleton className="h-80 w-full rounded-lg" /> : !competencyStats.length ? <p className="text-sm text-muted-foreground">Nenhum dado técnico para esta competição.</p> : <Card><CardHeader><CardDescription>DESEMPENHO POR COMPETÊNCIA</CardDescription><CardTitle>Pontuação média e % de completação</CardTitle></CardHeader><CardContent><ChartContainer config={{ score: { label: 'Pontuação média', color: 'var(--chart-1)' }, completionPct: { label: '% Completação', color: 'var(--chart-2)' } }} className="h-72 w-full" role="img" aria-label="Barras de pontuação média e linha de percentual de completação por competência."><ComposedChart data={competencyStats} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="competencia" axisLine={false} tickLine={false} tickMargin={8} /><YAxis yAxisId="score" domain={[0, 2]} axisLine={false} tickLine={false} width={28} /><YAxis yAxisId="pct" orientation="right" domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} width={42} /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent />} /><Bar yAxisId="score" dataKey="score" fill="var(--color-score)" radius={4} /><Line yAxisId="pct" type="monotone" dataKey="completionPct" stroke="var(--color-completionPct)" strokeWidth={2.5} dot={{ r: 4 }} /></ComposedChart></ChartContainer></CardContent></Card>}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2"><CardDescription>COMPARATIVO NACIONAL</CardDescription><InferencesZScoreInfo /></div>
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

function InferencesZScoreInfo() {
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
