import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { PageHeader } from '../components/PageHeader'
import { useApiRows } from '../lib/api'
import { REGION_BY_STATE, completionPctByEstado, visibleMotorRows } from '../lib/motorScore'
import { competitionCodesForScope, useReportingScope, withReportingScope } from '../lib/reportingScope'
import type { CompetitionRow, MotorRow } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

const ALL_STATE_CODES = Object.keys(REGION_BY_STATE).sort()

export function StateExecutionPage() {
  const { rows: competitions, loading: competitionsLoading } = useApiRows<CompetitionRow>('/api/competitions')
  const { rows: motorRows, loading: motorLoading } = useApiRows<MotorRow>('/api/dashboard/motor')
  const { scope } = useReportingScope()
  const scopedCompetitionCodes = useMemo(() => competitionCodesForScope(scope, competitions), [scope, competitions])
  const loading = competitionsLoading || motorLoading

  const rows = useMemo(() => visibleMotorRows(
    motorRows.filter((row) => scope.styles.includes(row.estilo ?? '') && scopedCompetitionCodes.includes(row.eventIdentifier ?? '')),
  ), [motorRows, scope.styles, scopedCompetitionCodes])

  const stateData = useMemo(() => completionPctByEstado(rows, ALL_STATE_CODES), [rows])
  const chartWidth = Math.max(stateData.length * 64, 640)

  return (
    <PageHeader active="motor" breadcrumb={[{ label: 'Raio-X do tapete', href: withReportingScope('?view=motor') }, { label: 'Execução por UF' }]}>
      <div className="@container/main">
        <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl leading-none tracking-tight">Execução por UF — todos os estados</h1>
            <p className="text-sm text-muted-foreground">Percentuais de execução completa, parcial e não completada nas 27 unidades federativas, no recorte global atual.</p>
          </div>

          <Card>
            <CardHeader>
              <CardDescription>EXECUÇÃO POR UF</CardDescription>
              <CardTitle>Percentuais de execução por estado</CardTitle>
              <p className="text-sm text-muted-foreground">Estados ordenados do maior para o menor desempenho técnico. Role horizontalmente para ver todos.</p>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-96 w-full rounded-lg" /> : (
                <div className="overflow-x-auto">
                  <ChartContainer
                    config={{ completo: { label: 'Execução completa', color: 'var(--chart-1)' }, parcial: { label: 'Execução parcial', color: 'var(--chart-4)' }, naoCompletou: { label: 'Não completada', color: 'var(--destructive)' } }}
                    className="h-96"
                    style={{ width: chartWidth, minWidth: '100%' }}
                    role="img"
                    aria-label="Barras empilhadas a cem por cento com execução completa, parcial e não completada por todos os estados."
                  >
                    <BarChart data={stateData} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="estado" axisLine={false} tickLine={false} tickMargin={8} interval={0} />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} width={42} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value, name, item) => (
                        <span className="flex w-full items-center justify-between gap-3">
                          <span className="flex items-center gap-1.5"><span className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} aria-hidden />{name}</span>
                          <span className="font-mono font-medium tabular-nums">{Number(value).toFixed(0)}%</span>
                        </span>
                      )} />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="completo" stackId="execucao" fill="var(--color-completo)" radius={[0, 0, 3, 3]} />
                      <Bar dataKey="parcial" stackId="execucao" fill="var(--color-parcial)" />
                      <Bar dataKey="naoCompletou" stackId="execucao" fill="var(--color-naoCompletou)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </PageHeader>
  )
}
