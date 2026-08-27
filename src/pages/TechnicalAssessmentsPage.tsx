import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { useApiRows } from '../lib/api'
import type { CompetitionRow, MotorRow } from '../types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { explorerMockCompetitions, explorerMockMotorRows } from '../mocks/explorer'

const DIMENSIONS = ['Acrobacias', 'Pé', 'Solo'] as const
const REGION_ORDER = ['Sudeste', 'Centro-Oeste', 'Nordeste', 'Sul', 'Norte']
const REGION_BY_STATE: Record<string, string> = {
  AC: 'Norte', AL: 'Nordeste', AM: 'Norte', AP: 'Norte', BA: 'Nordeste', CE: 'Nordeste', DF: 'Centro-Oeste', ES: 'Sudeste', GO: 'Centro-Oeste', MA: 'Nordeste', MG: 'Sudeste', MS: 'Centro-Oeste', MT: 'Centro-Oeste', PA: 'Norte', PB: 'Nordeste', PE: 'Nordeste', PI: 'Nordeste', PR: 'Sul', RJ: 'Sudeste', RN: 'Nordeste', RO: 'Norte', RR: 'Norte', RS: 'Sul', SC: 'Sul', SE: 'Nordeste', SP: 'Sudeste', TO: 'Norte',
}

function dimensionFor(row: MotorRow): (typeof DIMENSIONS)[number] {
  const movement = (row.avaliacao ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (/ponte|acrob|rolamento/.test(movement)) return 'Acrobacias'
  if (/guarda|role|arranco|nelson|cruzeta|solo/.test(movement)) return 'Solo'
  return 'Pé'
}

function scoreFor(result: string | null) {
  return result === 'COMPLETE' ? 2 : result === 'INCOMPLETE' ? 1 : 0
}

function statusFor(result: string | null) {
  return result === 'COMPLETE' ? 'completo' : result === 'INCOMPLETE' ? 'parcial' : 'naoCompletou'
}

function labelForStyle(style: string) {
  if (style === 'FS' || style === 'Livre') return 'FS - Freestyle'
  if (style === 'GR' || style === 'Greco-romana') return 'GR - Greco-Romana'
  if (style === 'WW' || style === 'Feminino') return 'WW - Feminino'
  return style
}

export function TechnicalAssessmentsPage() {
  const { rows: competitionResponse, loading: competitionsLoading, error: competitionsError } = useApiRows<CompetitionRow>('/api/competitions')
  const { rows: motorResponse, loading: motorLoading, error: motorError } = useApiRows<MotorRow>('/api/dashboard/motor')
  const useMockCompetitions = !competitionsLoading && (Boolean(competitionsError) || competitionResponse.length === 0)
  const useMockMotorRows = !motorLoading && (Boolean(motorError) || motorResponse.length === 0)
  const competitions = useMockCompetitions ? explorerMockCompetitions : competitionResponse
  const motorRows = useMockMotorRows ? explorerMockMotorRows : motorResponse
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
  const averageScore = rows.length ? rows.reduce((total, row) => total + scoreFor(row.resultado), 0) / rows.length : null
  const completionRate = rows.length ? rows.filter((row) => row.resultado === 'COMPLETE').length / rows.length : null
  const regionalData = useMemo(() => REGION_ORDER.map((region) => {
    const regionalRows = rows.filter((row) => REGION_BY_STATE[row.estado ?? ''] === region)
    return { region, pontuacao: regionalRows.length ? Number((regionalRows.reduce((total, row) => total + scoreFor(row.resultado), 0) / regionalRows.length).toFixed(2)) : null, registros: regionalRows.length }
  }).filter((item) => item.registros), [rows])
  const stateData = useMemo(() => Array.from(new Set(rows.map((row) => row.estado).filter((state): state is string => Boolean(state)))).map((estado) => {
    const stateRows = rows.filter((row) => row.estado === estado)
    const total = stateRows.length
    const complete = stateRows.filter((row) => statusFor(row.resultado) === 'completo').length
    const partial = stateRows.filter((row) => statusFor(row.resultado) === 'parcial').length
    return { estado, completo: complete / total * 100, parcial: partial / total * 100, naoCompletou: (total - complete - partial) / total * 100, desempenho: stateRows.reduce((sum, row) => sum + scoreFor(row.resultado), 0) / total }
  }).sort((first, second) => second.desempenho - first.desempenho), [rows])
  const hasCustomFilters = dimensions.length !== DIMENSIONS.length || selectedStyles.length !== styles.length || selectedEvents.length !== events.length
  const resetFilters = () => { setDimensions([...DIMENSIONS]); setSelectedStyles(styles); setSelectedEvents(events.map((event) => event.value)) }

  return (
    <PageHeader active="explorer">
      <div className="@container/main">
        <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Avaliações técnicas</p><h1 className="text-3xl leading-none tracking-tight">Raio-X do tapete</h1><p className="text-sm text-muted-foreground">Priorize capacitação técnica por dimensão, estilo, região e estado.</p></div>
            <Button variant="outline" size="sm" onClick={resetFilters} disabled={!hasCustomFilters}><RotateCcw aria-hidden="true" />Restaurar filtros</Button>
          </div>

          {(useMockCompetitions || useMockMotorRows) && <Alert><AlertTitle>Visão de demonstração</AlertTitle><AlertDescription>Os dados técnicos desta tela são simulados porque uma ou mais fontes não estão disponíveis.</AlertDescription></Alert>}
          <p className="sr-only" aria-live="polite" aria-atomic="true">{loading ? 'Atualizando análise técnica.' : `${rows.length} movimentos no recorte atual.`}</p>

          <div className="grid gap-4 @2xl/main:grid-cols-[minmax(0,1fr)_minmax(360px,0.6fr)]">
            <Card><CardHeader><CardDescription>FILTROS RÁPIDOS</CardDescription><CardTitle className="text-lg">Recorte da análise</CardTitle></CardHeader><CardContent className="grid gap-5">
              <FilterGroup label="Dimensões técnicas" options={DIMENSIONS.map((value) => ({ value, label: value }))} value={dimensions} onChange={setDimensions} disabled={loading} />
              <FilterGroup label="Estilos de luta" options={styles.map((value) => ({ value, label: labelForStyle(value) }))} value={selectedStyles} onChange={setSelectedStyles} disabled={loading} />
              <FilterGroup label="Eventos e ano" options={events} value={selectedEvents} onChange={setSelectedEvents} disabled={loading} />
            </CardContent></Card>
            <div className="grid grid-cols-2 gap-4"><Metric loading={loading} label="Pontuação média" value={averageScore === null ? '—' : averageScore.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /><Metric loading={loading} label="Percentual de compleção" value={completionRate === null ? '—' : `${Math.round(completionRate * 100)}%`} /><Card className="col-span-2 bg-muted/35"><CardHeader><CardDescription>BASE ANALISADA</CardDescription><CardTitle className="font-mono text-2xl tabular-nums">{loading ? '—' : rows.length}</CardTitle><p className="text-sm text-muted-foreground">movimentos no recorte atual</p></CardHeader></Card></div>
          </div>

          {loading ? <div className="grid gap-4 @2xl/main:grid-cols-2"><Skeleton className="h-80 w-full rounded-lg" /><Skeleton className="h-80 w-full rounded-lg" /></div> : <div className="grid items-stretch gap-4 @2xl/main:grid-cols-2">
            <Card><CardHeader><CardDescription>PONTUAÇÃO TÉCNICA</CardDescription><CardTitle>Pontuação média por região</CardTitle><p className="text-sm text-muted-foreground">Escala de 0 a 2 pontos por execução registrada.</p></CardHeader><CardContent><h2 className="sr-only">Pontuação média por região</h2><p id="regional-chart-description" className="sr-only">A linha compara a pontuação média entre as regiões brasileiras no recorte selecionado.</p><ChartContainer config={{ pontuacao: { label: 'Pontuação média', color: 'var(--chart-1)' } }} className="h-80 w-full" role="img" aria-label="Linha da pontuação média de execução por região brasileira." aria-describedby="regional-chart-description"><LineChart data={regionalData} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="region" axisLine={false} tickLine={false} tickMargin={8} /><YAxis domain={[0, 2]} ticks={[0, 1, 2]} axisLine={false} tickLine={false} width={28} /><ChartTooltip content={<ChartTooltipContent />} /><Line type="monotone" dataKey="pontuacao" stroke="var(--color-pontuacao)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls /></LineChart></ChartContainer></CardContent></Card>
            <Card><CardHeader><CardDescription>EXECUÇÃO POR UF</CardDescription><CardTitle>Percentuais de execução por estado</CardTitle><p className="text-sm text-muted-foreground">Estados ordenados do maior para o menor desempenho técnico.</p></CardHeader><CardContent><h2 className="sr-only">Percentuais de execução por estado</h2><p id="state-chart-description" className="sr-only">Cada barra representa cem por cento dos movimentos avaliados em um estado e separa execução completa, parcial e não completada.</p><ChartContainer config={{ completo: { label: 'Completo', color: 'var(--chart-1)' }, parcial: { label: 'Parcial', color: 'var(--chart-4)' }, naoCompletou: { label: 'Não completou', color: 'var(--destructive)' } }} className="h-80 w-full" role="img" aria-label="Barras empilhadas a cem por cento com execução completa, parcial e não completada por estado." aria-describedby="state-chart-description"><BarChart data={stateData} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="estado" axisLine={false} tickLine={false} tickMargin={8} /><YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} width={42} /><ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => `${Number(value).toFixed(0)}%`} />} /><ChartLegend content={<ChartLegendContent />} /><Bar dataKey="completo" stackId="execucao" fill="var(--color-completo)" radius={[0, 0, 3, 3]} /><Bar dataKey="parcial" stackId="execucao" fill="var(--color-parcial)" /><Bar dataKey="naoCompletou" stackId="execucao" fill="var(--color-naoCompletou)" radius={[3, 3, 0, 0]} /></BarChart></ChartContainer></CardContent></Card>
          </div>}
        </main>
      </div>
    </PageHeader>
  )
}

function FilterGroup({ label, options, value, onChange, disabled }: { label: string; options: { value: string; label: string }[]; value: string[]; onChange: (value: string[]) => void; disabled: boolean }) {
  return <fieldset className="grid gap-2"><legend className="text-sm font-medium">{label}</legend><ToggleGroup type="multiple" variant="outline" size="sm" value={value} onValueChange={onChange} className="flex w-full flex-wrap justify-start gap-2" disabled={disabled}>{options.map((option) => <ToggleGroupItem key={option.value} value={option.value}>{option.label}</ToggleGroupItem>)}</ToggleGroup></fieldset>
}