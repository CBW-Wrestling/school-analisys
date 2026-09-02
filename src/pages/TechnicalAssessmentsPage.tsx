import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, Scatter, XAxis, YAxis } from 'recharts'
import { BookOpen, CheckCircle2, Crosshair, Database, Gauge, ListChecks, ListOrdered, Percent, RotateCcw, Target, Trophy } from 'lucide-react'
import { FilterDropdown } from '../components/FilterDropdown'
import { InfoTooltip } from '../components/InfoTooltip'
import { KpiCard } from '../components/KpiCard'
import { PageHeader } from '../components/PageHeader'
import { TabbedChartCard } from '../components/TabbedChartCard'
import { BrazilHeatmap } from '../components/dashboard/BrazilHeatmap'
import { apiGet, useApiRows } from '../lib/api'
import { PEARSON_EXPLANATION, pearsonCorrelation, regressionLine } from '../lib/correlation'
import { AVERAGE_SCORE_EXPLANATION, COMPLETION_EXPLANATION, REGION_BY_STATE, REGION_ORDER, average, completionPctByEstado, scoreByEstado, scoreFor, visibleMotorRows } from '../lib/motorScore'
import { competitionCodesForScope, useReportingScope, withReportingScope } from '../lib/reportingScope'
import { Z_SCORE_EXPLANATION, meanAndStdDev, zScoreFor } from '../lib/zscore'
import type { CompetitionRow, MotorRow, ResultRow } from '../types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const DIMENSIONS = ['Acrobacias', 'Pé', 'Solo'] as const
const RESULT_LABELS: Record<string, string> = {
  COMPLETE: 'Completa',
  INCOMPLETE: 'Incompleta',
  DID_NOT_DO: 'Não realizou',
  DOES_NOT_KNOW: 'Não sabe',
}

function dimensionFor(row: MotorRow): (typeof DIMENSIONS)[number] {
  if (row.dimension === 'Acrobacias' || row.dimension === 'Solo' || row.dimension === 'Pé') return row.dimension
  // fallback para movimentos não mapeados no enum do backend
  const movement = (row.avaliacao ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (/ponte|acrob|rolamento/.test(movement)) return 'Acrobacias'
  if (/guarda|role|arranco|nelson|cruzeta|solo/.test(movement)) return 'Solo'
  return 'Pé'
}

export function TechnicalAssessmentsPage() {
  const { rows: competitions, loading: competitionsLoading, error: competitionsError } = useApiRows<CompetitionRow>('/api/competitions')
  const { rows: motorRows, loading: motorLoading, error: motorError } = useApiRows<MotorRow>('/api/dashboard/motor')
  const loading = competitionsLoading || motorLoading
  const { scope } = useReportingScope()
  const scopedCompetitionCodes = useMemo(() => competitionCodesForScope(scope, competitions), [scope, competitions])
  const [dimensions, setDimensions] = useState<string[]>([])

  useEffect(() => { if (motorRows.length && dimensions.length === 0) setDimensions([...DIMENSIONS]) }, [motorRows, dimensions])

  const rows = useMemo(() => visibleMotorRows(
    motorRows.filter((row) =>
      dimensions.includes(dimensionFor(row)) && scope.styles.includes(row.estilo ?? '') && scopedCompetitionCodes.includes(row.eventIdentifier ?? ''),
    ),
  ), [motorRows, dimensions, scope.styles, scopedCompetitionCodes])
  const averageScore = average(rows.map((row) => scoreFor(row.resultado)))
  const completionRate = rows.length ? rows.filter((row) => row.resultado === 'COMPLETE').length / rows.length : null
  const overviewByResult = useMemo(() => {
    const resultCodes = [...new Set(rows.map((row) => row.resultado ?? 'SEM_REGISTRO'))]
    return resultCodes.map((code) => ({ code, label: RESULT_LABELS[code] ?? 'Sem registro', count: rows.filter((row) => (row.resultado ?? 'SEM_REGISTRO') === code).length }))
  }, [rows])
  const overviewByCompetency = useMemo(() => {
    const competencies = [...new Set(rows.map((row) => row.competencia).filter((value): value is string => Boolean(value)))].sort()
    return competencies.map((competency) => ({ code: competency, label: competency, count: rows.filter((row) => row.competencia === competency).length }))
  }, [rows])
  const resultPieData = useMemo(() => overviewByResult.map((item, index) => ({ ...item, fill: `var(--chart-${(index % 5) + 1})` })), [overviewByResult])
  const completedRows = rows.filter((row) => row.resultado === 'COMPLETE').length

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
  const [athleteScores, setAthleteScores] = useState<{ entryId: string; averageScore: number }[]>([])
  useEffect(() => {
    const ids = competitions.filter((competition) => scopedCompetitionCodes.includes(competition.code)).map((competition) => competition.id)
    if (!ids.length) { setResultRows([]); return }
    let alive = true
    setResultsLoading(true)
    Promise.all(ids.map((id) => apiGet<ResultRow[]>(`/api/results?competitionId=${encodeURIComponent(id)}`)))
      .then((lists) => { if (alive) setResultRows(lists.flat()) })
      .catch(() => { if (alive) setResultRows([]) })
      .finally(() => { if (alive) setResultsLoading(false) })
    return () => { alive = false }
  }, [scopedCompetitionCodes, competitions])

  useEffect(() => {
    const ids = competitions.filter((competition) => scopedCompetitionCodes.includes(competition.code)).map((competition) => competition.id)
    if (!ids.length) { setAthleteScores([]); return }
    let alive = true
    Promise.all(ids.map((id) => apiGet<{ entryId: string; averageScore: number }[]>(`/api/dashboard/motor/athlete-scores?competitionId=${encodeURIComponent(id)}`)))
      .then((lists) => { if (alive) setAthleteScores(lists.flat()) })
      .catch(() => { if (alive) setAthleteScores([]) })
    return () => { alive = false }
  }, [scopedCompetitionCodes, competitions])
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
  const rankRegression = regressionLine(rankScatter)
  const pointsRegression = regressionLine(pointsScatter)
  const winsRegression = regressionLine(winsScatter)

  const hasCustomFilters = dimensions.length !== DIMENSIONS.length
  const resetFilters = () => setDimensions([...DIMENSIONS])
  const [activeTab, setActiveTab] = useState('overview')

  const filterToolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <FilterDropdown label="Dimensões" options={DIMENSIONS.map((value) => ({ value, label: value }))} value={dimensions} onChange={setDimensions} disabled={loading} />
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
                <KpiCard loading={loading} icon={ListChecks} label="Movimentos válidos" value={String(rows.length)} />
                <KpiCard loading={loading} icon={CheckCircle2} label="Execuções completas" value={String(completedRows)} />
                <KpiCard loading={loading} icon={Target} label="Taxa de domínio" value={rows.length ? `${Math.round((completedRows / rows.length) * 100)}%` : '—'} />
                <KpiCard loading={loading} icon={BookOpen} label="Competências avaliadas" value={String(overviewByCompetency.length)} />
              </div>
              <p className="text-sm text-muted-foreground">Considera apenas movimentos aplicáveis ao estilo de cada atleta e os filtros selecionados.</p>
              <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardDescription className="text-xs font-medium tracking-wide">RESULTADO</CardDescription>
                    <CardTitle>Qualidade da execução</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? <Skeleton className="h-64 w-full" /> : !overviewByResult.length ? <p className="text-sm text-muted-foreground">Nenhum movimento válido no recorte atual.</p> : (
                      <div className="flex flex-col items-center gap-4">
                        <ChartContainer config={{ count: { label: 'Movimentos' } }} className="aspect-square max-h-56 w-full max-w-56 shrink-0" role="img" aria-label="Composição dos resultados de execução.">
                          <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(value, name, item) => (
                              <span className="flex w-full items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5"><span className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.payload?.fill }} aria-hidden />{name}</span>
                                <span className="font-mono font-medium tabular-nums">{value} · {rows.length ? Math.round((Number(value) / rows.length) * 100) : 0}%</span>
                              </span>
                            )} />} />
                            <Pie data={resultPieData} dataKey="count" nameKey="label" innerRadius={56} outerRadius={88} paddingAngle={2} cornerRadius={4} />
                          </PieChart>
                        </ChartContainer>
                        <div className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2">
                          {resultPieData.map((item) => (
                            <span key={item.code} className="flex items-center gap-1.5 text-sm">
                              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.fill }} aria-hidden />
                              {item.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription className="text-xs font-medium tracking-wide">COBERTURA</CardDescription>
                    <CardTitle>Movimentos por competência</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? <Skeleton className="h-64 w-full" /> : !overviewByCompetency.length ? <p className="text-sm text-muted-foreground">Nenhum movimento válido no recorte atual.</p> : (
                      <ChartContainer config={{ count: { label: 'Movimentos', color: 'var(--chart-2)' } }} className="h-64 w-full" role="img" aria-label="Movimentos por competência.">
                        <BarChart data={overviewByCompetency} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={8} interval={0} angle={-12} textAnchor="end" height={48} />
                          <YAxis axisLine={false} tickLine={false} allowDecimals={false} width={32} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" name="Movimentos" fill="var(--color-count)" radius={4} />
                        </BarChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="regional" className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
                <KpiCard loading={loading} icon={Gauge} label="Pontuação média" value={averageScore === null ? '—' : averageScore.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} info={<InfoTooltip label="O que é pontuação média?" content={AVERAGE_SCORE_EXPLANATION} />} />
                <KpiCard loading={loading} icon={Percent} label="Percentual de compleção" value={completionRate === null ? '—' : `${Math.round(completionRate * 100)}%`} info={<InfoTooltip label="O que é percentual de compleção?" content={COMPLETION_EXPLANATION} />} />
                <KpiCard loading={loading} icon={Database} label="Base analisada" value={loading ? '—' : String(rows.length)} description="movimentos no recorte atual" />
              </div>
              {loading ? <div className="grid gap-4 @2xl/main:grid-cols-2"><Skeleton className="h-80 w-full rounded-lg" /><Skeleton className="h-80 w-full rounded-lg" /></div> : !regionalData.length && !stateData.length ? <p className="text-sm text-muted-foreground">Nenhum movimento no recorte atual.</p> : <div className="grid items-stretch gap-4 @2xl/main:grid-cols-2">
                <Card><CardHeader><CardDescription>PONTUAÇÃO TÉCNICA</CardDescription><CardTitle>Pontuação média por região</CardTitle><p className="text-sm text-muted-foreground">Escala de 0 a 2 pontos por execução registrada.</p></CardHeader><CardContent><p id="regional-chart-description" className="sr-only">Barras comparam a pontuação média entre as regiões brasileiras no recorte selecionado.</p><ChartContainer config={{ pontuacao: { label: 'Pontuação média', color: 'var(--chart-1)' } }} className="h-80 w-full" role="img" aria-label="Barras da pontuação média de execução por região brasileira." aria-describedby="regional-chart-description"><BarChart data={regionalData} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="region" axisLine={false} tickLine={false} tickMargin={8} /><YAxis domain={[0, 2]} ticks={[0, 1, 2]} axisLine={false} tickLine={false} width={28} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="pontuacao" fill="var(--color-pontuacao)" radius={4} /></BarChart></ChartContainer></CardContent></Card>
                <Card><CardHeader><CardDescription>EXECUÇÃO POR UF</CardDescription><CardTitle>Percentuais de execução por estado</CardTitle><p className="text-sm text-muted-foreground">Estados ordenados do maior para o menor desempenho técnico.</p><CardAction><Button variant="outline" size="sm" asChild><a href={withReportingScope('?view=motor-states')}>Exibir todos</a></Button></CardAction></CardHeader><CardContent><p id="state-chart-description" className="sr-only">Cada barra representa cem por cento dos movimentos avaliados em um estado e separa execução completa, parcial e não completada.</p><ChartContainer config={{ completo: { label: 'Execução completa', color: 'var(--chart-1)' }, parcial: { label: 'Execução parcial', color: 'var(--chart-4)' }, naoCompletou: { label: 'Não completada', color: 'var(--destructive)' } }} className="h-80 w-full" role="img" aria-label="Barras empilhadas a cem por cento com execução completa, parcial e não completada por estado." aria-describedby="state-chart-description"><BarChart data={stateData} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="estado" axisLine={false} tickLine={false} tickMargin={8} /><YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} width={42} /><ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value, name, item) => (
                  <span className="flex w-full items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5"><span className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} aria-hidden />{name}</span>
                    <span className="font-mono font-medium tabular-nums">{Number(value).toFixed(0)}%</span>
                  </span>
                )} />} /><ChartLegend content={<ChartLegendContent />} /><Bar dataKey="completo" stackId="execucao" fill="var(--color-completo)" radius={[0, 0, 3, 3]} /><Bar dataKey="parcial" stackId="execucao" fill="var(--color-parcial)" /><Bar dataKey="naoCompletou" stackId="execucao" fill="var(--color-naoCompletou)" radius={[3, 3, 0, 0]} /></BarChart></ChartContainer></CardContent></Card>
              </div>}
            </TabsContent>

            <TabsContent value="zscore" className="flex flex-col gap-4">
              <div className="flex items-center gap-2"><h2 className="text-lg font-semibold">Comparação por Z-Score</h2><InfoTooltip label="O que é Z-Score?" content={Z_SCORE_EXPLANATION} /></div>
              <BrazilHeatmap loading={loading} values={zScoreMapValues} selectedState={selectedZScoreState} nationalAverage={nationalStats.mean} nationalStdDev={nationalStats.stdDev} showEngagement={false} countLabel="Movimentos válidos" onSelect={setSelectedZScoreState} />
              {loading ? <Skeleton className="h-72 w-full rounded-lg" /> : !zScoreBarData.length ? <p className="text-sm text-muted-foreground">Nenhum estado com dados suficientes para calcular Z-Score no recorte atual.</p> : <Card><CardHeader><CardDescription>RANKING ESTADUAL</CardDescription><CardTitle>Z-Score por estado</CardTitle><p className="text-sm text-muted-foreground">Estados ordenados do maior para o menor Z-Score técnico. Verde acima da média nacional, vermelho abaixo.</p></CardHeader><CardContent><p id="zscore-chart-description" className="sr-only">Barras ordenadas do maior para o menor Z-Score por estado, em verde quando acima da média nacional e em vermelho quando abaixo.</p><ChartContainer config={{ zScore: { label: 'Z-Score', color: 'var(--chart-2)' } }} className="h-72 w-full" role="img" aria-label="Barras do Z-Score técnico por estado." aria-describedby="zscore-chart-description"><BarChart data={zScoreBarData} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="estado" axisLine={false} tickLine={false} tickMargin={8} /><YAxis axisLine={false} tickLine={false} width={36} /><ChartTooltip content={<ChartTooltipContent formatter={(value, name, item) => (
                <span className="flex w-full items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5"><span className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} aria-hidden />{name}</span>
                  <span className="font-mono font-medium tabular-nums">{Number(value) >= 0 ? '+' : ''}{Number(value).toFixed(2)}</span>
                </span>
              )} />} /><Bar dataKey="zScore" radius={[3, 3, 3, 3]}>{zScoreBarData.map((entry) => <Cell key={entry.estado} fill={entry.zScore >= 0 ? 'var(--chart-1)' : 'var(--destructive)'} stroke={entry.estado === selectedZScoreState ? 'var(--foreground)' : 'transparent'} strokeWidth={2} />)}</Bar></BarChart></ChartContainer></CardContent></Card>}
            </TabsContent>

            <TabsContent value="correlations" className="flex flex-col gap-4">
              <Alert><AlertDescription>A pontuação técnica por atleta usada nesta aba ainda é simulada — o backend não expõe esse cruzamento hoje (ver <code>BACKEND_GAPS.md</code>, GAP 1). Colocação, vitórias e pontos técnicos são dados reais.</AlertDescription></Alert>
              {!resultsLoading && !correlationRows.length ? <p className="text-sm text-muted-foreground">Nenhum resultado disponível para os eventos selecionados.</p> : <>
              <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
                <KpiCard loading={resultsLoading} icon={ListOrdered} label="Coeficiente vs. colocação" value={coefRank === null ? '—' : coefRank.toFixed(2)} info={<InfoTooltip label="O que é coeficiente de correlação?" content={PEARSON_EXPLANATION} />} />
                <KpiCard loading={resultsLoading} icon={Crosshair} label="Coeficiente vs. pontos técnicos" value={coefPoints === null ? '—' : coefPoints.toFixed(2)} />
                <KpiCard loading={resultsLoading} icon={Trophy} label="Coeficiente vs. vitórias" value={coefWins === null ? '—' : coefWins.toFixed(2)} />
              </div>
              {resultsLoading ? <Skeleton className="h-80 w-full rounded-lg" /> : <TabbedChartCard
                eyebrow="DISPERSÃO"
                title="Pontuação técnica × desempenho competitivo"
                description="A reta pontilhada mostra a tendência calculada a partir dos próprios pontos."
                tabs={[
                  {
                    value: 'colocacao',
                    label: 'vs. Colocação',
                    content: (
                      <ChartContainer config={{ score: { label: 'Pontuação', color: 'var(--chart-1)' } }} className="h-72 w-full" role="img" aria-label="Dispersão entre pontuação técnica e colocação, com linha de tendência.">
                        <ComposedChart margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis type="number" dataKey="x" name="Colocação" axisLine={false} tickLine={false} />
                          <YAxis type="number" dataKey="y" name="Pontuação" domain={[0, 2]} axisLine={false} tickLine={false} width={28} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Scatter data={rankScatter} dataKey="y" fill="var(--color-score)" />
                          <Line data={rankRegression} dataKey="y" stroke="var(--color-score)" strokeWidth={2} strokeDasharray="4 4" dot={false} activeDot={false} legendType="none" />
                        </ComposedChart>
                      </ChartContainer>
                    ),
                  },
                  {
                    value: 'pontos',
                    label: 'vs. Pontos técnicos',
                    content: (
                      <ChartContainer config={{ score: { label: 'Pontuação', color: 'var(--chart-1)' } }} className="h-72 w-full" role="img" aria-label="Dispersão entre pontuação técnica e pontos técnicos marcados, com linha de tendência.">
                        <ComposedChart margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis type="number" dataKey="x" name="Pontos técnicos" axisLine={false} tickLine={false} />
                          <YAxis type="number" dataKey="y" name="Pontuação" domain={[0, 2]} axisLine={false} tickLine={false} width={28} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Scatter data={pointsScatter} dataKey="y" fill="var(--color-score)" />
                          <Line data={pointsRegression} dataKey="y" stroke="var(--color-score)" strokeWidth={2} strokeDasharray="4 4" dot={false} activeDot={false} legendType="none" />
                        </ComposedChart>
                      </ChartContainer>
                    ),
                  },
                  {
                    value: 'vitorias',
                    label: 'vs. Vitórias',
                    content: (
                      <ChartContainer config={{ score: { label: 'Pontuação', color: 'var(--chart-1)' } }} className="h-72 w-full" role="img" aria-label="Dispersão entre pontuação técnica e número de vitórias, com linha de tendência.">
                        <ComposedChart margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis type="number" dataKey="x" name="Vitórias" axisLine={false} tickLine={false} />
                          <YAxis type="number" dataKey="y" name="Pontuação" domain={[0, 2]} axisLine={false} tickLine={false} width={28} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Scatter data={winsScatter} dataKey="y" fill="var(--color-score)" />
                          <Line data={winsRegression} dataKey="y" stroke="var(--color-score)" strokeWidth={2} strokeDasharray="4 4" dot={false} activeDot={false} legendType="none" />
                        </ComposedChart>
                      </ChartContainer>
                    ),
                  },
                ]}
              />}
              </>}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageHeader>
  )
}