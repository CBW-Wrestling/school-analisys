import { Info } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  PHYSICAL_MEASURES,
  PROFILE_FIELDS,
  competencies,
  competencyScore,
  motorScore,
  pointLabel,
  pointTick,
  useProfileLabels,
} from '../lib/evolution'
import { PHYSICAL_ENABLED } from '../lib/features'
import { AVERAGE_SCORE_EXPLANATION } from '../lib/motorScore'
import type { AthleteEvolution } from '../types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

type TrendDatum = { tick: string; competition: string; value: number | null; count?: number }

const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

// Uma série por gráfico: a cor só marca a linha, o título diz o que é.
function TrendChart({
  data,
  label,
  unit,
  domain,
  ticks,
  className,
}: {
  data: TrendDatum[]
  label: string
  unit?: string
  domain?: [number, number]
  ticks?: number[]
  className?: string
}) {
  const config = { value: { label, color: 'var(--chart-1)' } } satisfies ChartConfig
  return (
    <ChartContainer config={config} className={cn('aspect-auto w-full', className)} aria-label={`${label} por competição`}>
      <LineChart accessibilityLayer data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="tick" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
        <YAxis
          domain={domain ?? ['auto', 'auto']}
          ticks={ticks}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(value: number) => decimal.format(value)}
        />
        <ChartTooltip
          cursor={{ stroke: 'var(--border)' }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => (payload?.[0]?.payload as TrendDatum | undefined)?.competition}
              formatter={(value, _name, item) => {
                const datum = item.payload as TrendDatum
                return (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-mono font-medium text-foreground tabular-nums">
                      {decimal.format(Number(value))}{unit ? ` ${unit}` : ''}
                      {datum.count != null ? ` · ${datum.count} mov.` : ''}
                    </span>
                  </div>
                )
              }}
            />
          }
        />
        <Line
          dataKey="value"
          type="linear"
          stroke="var(--color-value)"
          strokeWidth={2}
          dot={{ r: 4, fill: 'var(--color-value)', stroke: 'var(--background)', strokeWidth: 2 }}
          activeDot={{ r: 5, stroke: 'var(--background)', strokeWidth: 2 }}
          connectNulls
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  )
}

const MOTOR_DOMAIN: [number, number] = [0, 2]
const MOTOR_TICKS = [0, 0.5, 1, 1.5, 2]

function EmptyNote({ children }: { children: string }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

export function AthleteEvolutionTab({ evolution }: { evolution: AthleteEvolution }) {
  const labels = useProfileLabels()
  const points = evolution.points

  if (points.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sem avaliações</CardTitle>
          <CardDescription>Nenhuma avaliação de perfil, físico ou técnica registrada para este atleta. A evolução aparece quando ele for avaliado numa competição.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const motorPoints = points.filter((point) => motorScore(point).score != null)
  const motorData: TrendDatum[] = motorPoints.map((point) => {
    const { score, count } = motorScore(point)
    return { tick: pointTick(point), competition: pointLabel(point), value: score, count }
  })
  const competencyList = competencies(motorPoints)
  const physicalPoints = points.filter((point) => point.physical != null)
  const profilePoints = points.filter((point) => point.profile != null)

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {points.length === 1 && (
        <Alert>
          <Info />
          <AlertTitle>Uma competição avaliada</AlertTitle>
          <AlertDescription>Abaixo estão os valores de {pointLabel(points[0])}. A comparação aparece a partir da segunda competição avaliada.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Técnica motora</CardTitle>
          <CardDescription>{AVERAGE_SCORE_EXPLANATION} Um ponto por competição.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {motorData.length === 0 ? (
            <EmptyNote>Nenhuma avaliação técnica registrada.</EmptyNote>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Nota média</h3>
                <TrendChart data={motorData} label="Nota média" domain={MOTOR_DOMAIN} ticks={MOTOR_TICKS} className="h-68" />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium">Por competência</h3>
                <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-2 @6xl/main:grid-cols-3">
                  {competencyList.map((competency) => (
                    <div key={competency} className="flex flex-col gap-1 rounded-lg border p-3">
                      <span className="text-sm text-muted-foreground">{competency}</span>
                      <TrendChart
                        data={motorPoints.map((point) => {
                          const { score, count } = competencyScore(point, competency)
                          return { tick: pointTick(point), competition: pointLabel(point), value: score, count }
                        })}
                        label={competency}
                        domain={MOTOR_DOMAIN}
                        ticks={[0, 1, 2]}
                        className="h-40"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {PHYSICAL_ENABLED && (
        <Card>
          <CardHeader>
            <CardTitle>Físico</CardTitle>
            <CardDescription>Medidas de cada competição avaliada.</CardDescription>
          </CardHeader>
          <CardContent>
            {physicalPoints.length === 0 ? (
              <EmptyNote>Nenhuma avaliação física registrada.</EmptyNote>
            ) : (
              <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-2 @6xl/main:grid-cols-3">
                {PHYSICAL_MEASURES.map((measure) => (
                  <div key={measure.key} className="flex flex-col gap-1 rounded-lg border p-3">
                    <span className="text-sm text-muted-foreground">{measure.label} ({measure.unit})</span>
                    <TrendChart
                      data={physicalPoints.map((point) => ({ tick: pointTick(point), competition: pointLabel(point), value: point.physical?.[measure.key] ?? null }))}
                      label={measure.label}
                      unit={measure.unit}
                      className="h-40"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4 [.border-b]:pb-4">
          <CardTitle>Perfil social</CardTitle>
          <CardDescription>Uma linha por competição, da mais antiga para a mais recente. "Mudou" marca o que é diferente da competição anterior.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {profilePoints.length === 0 ? (
            <div className="p-4"><EmptyNote>Nenhum perfil social registrado.</EmptyNote></div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4">
                <TableCaption className="sr-only">Perfil social de {evolution.name} por competição</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competição</TableHead>
                    {PROFILE_FIELDS.map((field) => <TableHead key={field.key}>{field.label}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profilePoints.map((point, index) => {
                    const previous = index > 0 ? profilePoints[index - 1].profile : null
                    return (
                      <TableRow key={point.entryId}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{pointLabel(point)}</span>
                            <span className="text-xs text-muted-foreground">{point.competition.year ?? '—'}</span>
                          </div>
                        </TableCell>
                        {PROFILE_FIELDS.map((field) => {
                          const value = field.format(point.profile!, labels)
                          const changed = previous != null && field.format(previous, labels) !== value
                          return (
                            <TableCell key={field.key} className="whitespace-normal">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={cn(changed && 'font-medium')}>{value}</span>
                                {changed && <Badge variant="outline">mudou</Badge>}
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
