import { useMemo, useState } from 'react'
import { Fragment } from 'react'
import { Bar, BarChart, CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { ChevronRight } from 'lucide-react'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { useApiRows } from '../lib/api'
import { pearsonCorrelation } from '../lib/correlation'
import { aggregateByStyleAndWeight, parseMetric } from '../lib/physicalMetrics'
import { competitionCodesForScope, useReportingScope } from '../lib/reportingScope'
import { cn } from '@/lib/utils'
import type { CompetitionRow, PhysicalRow } from '../types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function fmtCm(value: number | null) {
  return value === null ? '—' : `${value.toFixed(1)} cm`
}

function DistributionBarChart({ data, loading, color = 'var(--chart-1)' }: { data: { label: string; count: number }[]; loading: boolean; color?: string }) {
  if (loading) return <Skeleton className="h-56 w-full rounded-lg" />
  if (!data.length) return <p className="text-sm text-muted-foreground">Nenhum dado no recorte atual.</p>
  return (
    <ChartContainer config={{ count: { label: 'Avaliações', color } }} className="aspect-auto h-56 w-full">
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={8} />
        <YAxis axisLine={false} tickLine={false} width={32} allowDecimals={false} />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="count" name="Avaliações" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

export function PhysicalPage() {
  const { rows: physicalRows, loading: rowsLoading, error: rowsError } = useApiRows<PhysicalRow>('/api/dashboard/physical')
  const { rows: competitions, loading: competitionsLoading } = useApiRows<CompetitionRow>('/api/competitions')
  const { scope } = useReportingScope()
  const scopedCompetitionCodes = useMemo(() => competitionCodesForScope(scope, competitions), [scope, competitions])
  const scopedPhysicalRows = useMemo(() => physicalRows.filter((row) => scopedCompetitionCodes.includes(row.eventIdentifier ?? '') && scope.styles.includes(row.estilo ?? '')), [physicalRows, scopedCompetitionCodes, scope.styles])
  const [expandedStyles, setExpandedStyles] = useState<Set<string>>(new Set())
  const loading = rowsLoading || competitionsLoading

  const fmt = (v: number | null | undefined) => v != null ? `${v} cm` : '—'
  const fmtKgf = (v: number | null | undefined) => v != null ? `${v} kgf` : '—'
  const averageMetric = (field: keyof PhysicalRow) => {
    const values = scopedPhysicalRows.map((row) => parseMetric(row[field] as string | null)).filter((value): value is number => value !== null)
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
  }
  const countBy = (field: 'estado' | 'estilo') => [...new Set(scopedPhysicalRows.map((row) => row[field]).filter((value): value is string => Boolean(value)))].map((value) => ({ label: value, count: scopedPhysicalRows.filter((row) => row[field] === value).length })).sort((first, second) => second.count - first.count)

  const styleWeightTable = aggregateByStyleAndWeight(scopedPhysicalRows)

  const scatterData = scopedPhysicalRows
    .map((row) => ({ x: parseMetric(row.enverguturaCm), y: parseMetric(row.prensaoManualD) }))
    .filter((point): point is { x: number; y: number } => point.x !== null && point.y !== null)
  const coefEnvergaduraPrensao = pearsonCorrelation(scatterData)

  const toggleStyle = (estilo: string) => setExpandedStyles((current) => {
    const next = new Set(current)
    if (next.has(estilo)) next.delete(estilo)
    else next.add(estilo)
    return next
  })

  return (
    <PageHeader active="physical">
      <div className="@container/main">
        <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl leading-none tracking-tight">Indicadores para orientar o desenvolvimento.</h1>
            <p className="max-w-[640px] text-sm text-muted-foreground">Medições antropométricas e de força registradas nas avaliações de atletas.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 @xl/main:grid-cols-4">
            <Metric label="Avaliações válidas" value={loading ? '—' : String(scopedPhysicalRows.length)} />
            <Metric label="Estatura média" value={loading ? '—' : fmt(averageMetric('estaturaCm'))} />
            <Metric label="Envergadura média" value={loading ? '—' : fmt(averageMetric('enverguturaCm'))} />
            <Metric label="Prensão direita média" value={loading ? '—' : fmtKgf(averageMetric('prensaoManualD'))} />
          </div>

          <div className="grid grid-cols-1 gap-4 @lg/main:grid-cols-2">
            <Card>
              <CardHeader>
                <CardDescription className="text-xs font-medium tracking-wide">DISTRIBUIÇÃO</CardDescription>
                <CardTitle>Avaliações por estado</CardTitle>
              </CardHeader>
              <CardContent>
                <DistributionBarChart loading={loading} data={countBy('estado').slice(0, 7)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription className="text-xs font-medium tracking-wide">ESTILOS</CardDescription>
                <CardTitle>Registros por modalidade</CardTitle>
              </CardHeader>
              <CardContent>
                <DistributionBarChart loading={loading} color="var(--chart-2)" data={countBy('estilo')} />
              </CardContent>
            </Card>
          </div>

          {rowsError && <Alert variant="destructive"><AlertDescription>Não foi possível carregar as avaliações físicas detalhadas.</AlertDescription></Alert>}

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-4 [.border-b]:pb-4">
              <CardDescription className="text-xs font-medium tracking-wide">DETALHAMENTO</CardDescription>
              <CardTitle>Médias por estilo e categoria de peso</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {rowsLoading ? <Skeleton className="mx-4 my-4 h-64 rounded-lg" /> : !styleWeightTable.length ? <p className="px-4 py-4 text-sm text-muted-foreground">Nenhuma avaliação física no recorte atual.</p> : (
                <div className="overflow-x-auto">
                <Table className="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4 **:data-[slot='table-cell']:py-3">
                  <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-medium **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
                    <TableRow><TableHead>Estilo</TableHead><TableHead>Envergadura</TableHead><TableHead>Estatura</TableHead><TableHead>Prensão (D)</TableHead><TableHead>Prensão (E)</TableHead><TableHead>Antebraço (D)</TableHead><TableHead>Antebraço (E)</TableHead></TableRow>
                  </TableHeader>
                  <TableBody className="**:data-[slot='table-row']:border-border/50">
                    {styleWeightTable.map(({ estilo, overall, weights }) => {
                      const isExpanded = expandedStyles.has(estilo)
                      const visibleWeights = weights.filter((w) => w.count > 0)
                      return (
                        <Fragment key={estilo}>
                          <TableRow
                            className={cn('cursor-pointer hover:bg-muted/30', visibleWeights.length === 0 && 'cursor-default hover:bg-transparent')}
                            role={visibleWeights.length ? 'button' : undefined}
                            tabIndex={visibleWeights.length ? 0 : undefined}
                            aria-expanded={visibleWeights.length ? isExpanded : undefined}
                            onClick={() => visibleWeights.length && toggleStyle(estilo)}
                            onKeyDown={(event) => {
                              if (visibleWeights.length && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); toggleStyle(estilo) }
                            }}
                          >
                            <TableCell className="font-medium">
                              <span className="flex items-center gap-1.5">
                                {visibleWeights.length > 0 && <ChevronRight className={cn('size-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} aria-hidden />}
                                {estilo}
                              </span>
                            </TableCell>
                            <TableCell>{fmtCm(overall.enverguturaCm)}</TableCell>
                            <TableCell>{fmtCm(overall.estaturaCm)}</TableCell>
                            <TableCell>{fmtCm(overall.prensaoManualD)}</TableCell>
                            <TableCell>{fmtCm(overall.prensaoManualE)}</TableCell>
                            <TableCell>{fmtCm(overall.forearmRightCm)}</TableCell>
                            <TableCell>{fmtCm(overall.forearmLeftCm)}</TableCell>
                          </TableRow>
                          {isExpanded && visibleWeights.map((w) => (
                            <TableRow key={`${estilo}-${w.peso}`} className="text-muted-foreground">
                              <TableCell className="pl-9">{w.peso ? `${w.peso} kg` : '—'}</TableCell>
                              <TableCell>{fmtCm(w.enverguturaCm)}</TableCell>
                              <TableCell>{fmtCm(w.estaturaCm)}</TableCell>
                              <TableCell>{fmtCm(w.prensaoManualD)}</TableCell>
                              <TableCell>{fmtCm(w.prensaoManualE)}</TableCell>
                              <TableCell>{fmtCm(w.forearmRightCm)}</TableCell>
                              <TableCell>{fmtCm(w.forearmLeftCm)}</TableCell>
                            </TableRow>
                          ))}
                        </Fragment>
                      )
                    })}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-medium tracking-wide">RELAÇÃO</CardDescription>
              <CardTitle>Envergadura × prensão manual (D)</CardTitle>
              <p className="text-sm text-muted-foreground">Coeficiente de correlação: {coefEnvergaduraPrensao === null ? '—' : coefEnvergaduraPrensao.toFixed(2)} (dado real, por avaliação).</p>
            </CardHeader>
            <CardContent>
              {rowsLoading ? <Skeleton className="h-64 w-full rounded-lg" /> : <ChartContainer config={{ prensao: { label: 'Prensão manual (D)', color: 'var(--chart-1)' } }} className="h-64 w-full" role="img" aria-label="Dispersão entre envergadura e prensão manual direita."><ScatterChart margin={{ top: 12, right: 12, bottom: 8, left: 0 }}><CartesianGrid vertical={false} /><XAxis type="number" dataKey="x" name="Envergadura (cm)" axisLine={false} tickLine={false} /><YAxis type="number" dataKey="y" name="Prensão (D)" axisLine={false} tickLine={false} width={32} /><ChartTooltip content={<ChartTooltipContent />} /><Scatter data={scatterData} fill="var(--color-prensao)" /></ScatterChart></ChartContainer>}
            </CardContent>
          </Card>
        </main>
      </div>
    </PageHeader>
  )
}



