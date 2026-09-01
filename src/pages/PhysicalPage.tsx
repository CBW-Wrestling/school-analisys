import { useState } from 'react'
import { Fragment } from 'react'
import { Bar, BarChart, CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { ChevronRight } from 'lucide-react'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { useApiData, useApiRows } from '../lib/api'
import { pearsonCorrelation } from '../lib/correlation'
import { aggregateByStyleAndTier, parseMetric, WEIGHT_TIER_LABEL } from '../lib/physicalMetrics'
import { mockWeightTier } from '../mocks/dashboard-gaps'
import { cn } from '@/lib/utils'
import type { PhysicalRow, PhysicalSummary } from '../types'
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
  const { data: summary, loading } = useApiData<PhysicalSummary>('/api/dashboard/physical/summary')
  const { rows: physicalRows, loading: rowsLoading, error: rowsError } = useApiRows<PhysicalRow>('/api/dashboard/physical')
  const [expandedStyles, setExpandedStyles] = useState<Set<string>>(new Set())

  const fmt = (v: number | null | undefined) => v != null ? `${v} cm` : '—'
  const fmtKgf = (v: number | null | undefined) => v != null ? `${v} kgf` : '—'

  const tieredRows = mockWeightTier(physicalRows)
  const styleTierTable = aggregateByStyleAndTier(tieredRows)

  const scatterData = physicalRows
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
            <Metric label="Avaliações válidas" value={loading ? '—' : String(summary?.totalAssessments ?? 0)} />
            <Metric label="Estatura média" value={loading ? '—' : fmt(summary?.averageHeight)} />
            <Metric label="Envergadura média" value={loading ? '—' : fmt(summary?.averageArmSpan)} />
            <Metric label="Prensão direita média" value={loading ? '—' : fmtKgf(summary?.averageHandGripRight)} />
          </div>

          <div className="grid grid-cols-1 gap-4 @lg/main:grid-cols-2">
            <Card>
              <CardHeader>
                <CardDescription className="text-xs font-medium tracking-wide">DISTRIBUIÇÃO</CardDescription>
                <CardTitle>Avaliações por estado</CardTitle>
              </CardHeader>
              <CardContent>
                <DistributionBarChart loading={loading} data={(summary?.byState ?? []).slice(0, 7).map(({ label, count }) => ({ label, count }))} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription className="text-xs font-medium tracking-wide">ESTILOS</CardDescription>
                <CardTitle>Registros por modalidade</CardTitle>
              </CardHeader>
              <CardContent>
                <DistributionBarChart loading={loading} color="var(--chart-2)" data={(summary?.byStyle ?? []).map(({ label, count }) => ({ label, count }))} />
              </CardContent>
            </Card>
          </div>

          {rowsError && <Alert variant="destructive"><AlertDescription>Não foi possível carregar as avaliações físicas detalhadas.</AlertDescription></Alert>}

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-4 [.border-b]:pb-4">
              <CardDescription className="text-xs font-medium tracking-wide">DETALHAMENTO</CardDescription>
              <CardTitle>Médias por estilo e tier de peso</CardTitle>
              <p className="text-sm text-muted-foreground">Tier (Leve/Médio/Pesado) é uma aproximação por percentil — o backend ainda não expõe a classificação real (ver BACKEND_GAPS.md, GAP 2).</p>
            </CardHeader>
            <CardContent className="px-0">
              {rowsLoading ? <Skeleton className="mx-4 my-4 h-64 rounded-lg" /> : !styleTierTable.length ? <p className="px-4 py-4 text-sm text-muted-foreground">Nenhuma avaliação física no recorte atual.</p> : (
                <div className="overflow-x-auto">
                <Table className="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4 **:data-[slot='table-cell']:py-3">
                  <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-medium **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
                    <TableRow><TableHead>Estilo</TableHead><TableHead>Envergadura</TableHead><TableHead>Estatura</TableHead><TableHead>Prensão (D)</TableHead><TableHead>Prensão (E)</TableHead></TableRow>
                  </TableHeader>
                  <TableBody className="**:data-[slot='table-row']:border-border/50">
                    {styleTierTable.map(({ estilo, overall, tiers }) => {
                      const isExpanded = expandedStyles.has(estilo)
                      const visibleTiers = tiers.filter((tier) => tier.count > 0)
                      return (
                        <Fragment key={estilo}>
                          <TableRow
                            className={cn('cursor-pointer hover:bg-muted/30', visibleTiers.length === 0 && 'cursor-default hover:bg-transparent')}
                            role={visibleTiers.length ? 'button' : undefined}
                            tabIndex={visibleTiers.length ? 0 : undefined}
                            aria-expanded={visibleTiers.length ? isExpanded : undefined}
                            onClick={() => visibleTiers.length && toggleStyle(estilo)}
                            onKeyDown={(event) => {
                              if (visibleTiers.length && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); toggleStyle(estilo) }
                            }}
                          >
                            <TableCell className="font-medium">
                              <span className="flex items-center gap-1.5">
                                {visibleTiers.length > 0 && <ChevronRight className={cn('size-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} aria-hidden />}
                                {estilo}
                              </span>
                            </TableCell>
                            <TableCell>{fmtCm(overall.enverguturaCm)}</TableCell>
                            <TableCell>{fmtCm(overall.estaturaCm)}</TableCell>
                            <TableCell>{fmtCm(overall.prensaoManualD)}</TableCell>
                            <TableCell>{fmtCm(overall.prensaoManualE)}</TableCell>
                          </TableRow>
                          {isExpanded && visibleTiers.map((tier) => (
                            <TableRow key={`${estilo}-${tier.tier}`} className="text-muted-foreground">
                              <TableCell className="pl-9">{tier.tier ? WEIGHT_TIER_LABEL[tier.tier] : '—'}</TableCell>
                              <TableCell>{fmtCm(tier.enverguturaCm)}</TableCell>
                              <TableCell>{fmtCm(tier.estaturaCm)}</TableCell>
                              <TableCell>{fmtCm(tier.prensaoManualD)}</TableCell>
                              <TableCell>{fmtCm(tier.prensaoManualE)}</TableCell>
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



