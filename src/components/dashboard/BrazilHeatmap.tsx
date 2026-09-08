import type { ReactNode } from 'react'
import brazil from '@svg-maps/brazil'
import { Activity, Gauge, Landmark, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { Cell, Label, Pie, PieChart } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '../InfoTooltip'
import { AVERAGE_SCORE_EXPLANATION } from '../../lib/motorScore'
import { ENGAGEMENT_EXPLANATION } from '../../lib/physicalMetrics'
import { Z_SCORE_EXPLANATION, zScoreFor } from '../../lib/zscore'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

type StateValue = {
  code: string
  name: string
  count: number
  score: number | null
  engagement: number
  dimensions: { label: string; score: number | null }[]
}

type Props = {
  values: StateValue[]
  selectedState: string | null
  nationalAverage: number | null
  nationalStdDev: number | null
  loading?: boolean
  showEngagement?: boolean
  countLabel?: string
  onSelect: (state: string | null) => void
}

const stateNames: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
}

function colorForValue(value: StateValue, maximum: number) {
  if (value.count === 0) return 'var(--muted)'
  const intensity = Math.max(0.18, value.count / Math.max(maximum, 1))
  return `color-mix(in oklab, var(--chart-2) ${Math.round(18 + intensity * 62)}%, var(--background))`
}

function StatTile({ icon: Icon, label, value, description, info }: { icon: LucideIcon; label: string; value: string; description?: string; info?: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground"><Icon className="size-3.5" aria-hidden /></span>
      <div className="grid min-w-0 gap-0.5">
        <p className="flex items-center gap-1 text-xs text-muted-foreground">{label}{info}</p>
        <p className="font-semibold leading-tight tabular-nums">{value}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}

function CoverageGauge({ value, label, description, info }: { value: number; label: string; description: string; info?: ReactNode }) {
  const data = [{ name: 'covered', value }, { name: 'rest', value: Math.max(100 - value, 0) }]
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-2.5">
      <ChartContainer config={{ covered: { label, color: 'var(--chart-2)' } }} className="aspect-square h-20 w-20 shrink-0">
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Pie data={data} dataKey="value" innerRadius={26} outerRadius={38} startAngle={90} endAngle={-270} strokeWidth={0}>
            <Cell fill="var(--color-covered)" />
            <Cell fill="var(--muted)" />
            <Label content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-sm font-semibold tabular-nums">{value}%</tspan>
                  </text>
                )
              }
            }} />
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="grid min-w-0 gap-0.5">
        <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}{info}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function ScoreComparisonCard({ localScore, zScore, info }: { localScore: number | null; zScore: number | null; info?: ReactNode }) {
  const positive = zScore !== null && zScore >= 0
  const Trend = positive ? TrendingUp : TrendingDown
  return (
    <Card className="gap-3 py-3 shadow-none">
      <CardHeader className="px-3">
        <CardDescription>Pontuação técnica</CardDescription>
        <CardAction>{info}</CardAction>
      </CardHeader>
      <CardContent className="px-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none tracking-tight tabular-nums">{localScore === null ? '—' : localScore.toFixed(2)}</span>
          {zScore !== null && (
            <Badge variant="outline" className={cn('gap-1', positive ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400')}>
              <Trend aria-hidden />
              <span className="tabular-nums">{positive ? '+' : ''}{zScore.toFixed(2)}</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function DimensionBars({ title, dimensions, info }: { title: string; dimensions: { label: string; score: number | null }[]; info?: ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2.5">
      <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}{info}</p>
      <div className="mt-2 grid gap-2.5">
        {dimensions.map((dimension) => (
          <div key={dimension.label} className="grid gap-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate">{dimension.label}</span>
              <span className="font-medium tabular-nums">{dimension.score === null ? '—' : dimension.score.toFixed(2)}</span>
            </div>
            <Progress value={dimension.score === null ? 0 : dimension.score / 2 * 100} aria-label={`${dimension.label}: ${dimension.score === null ? 'sem dados' : dimension.score.toFixed(2)}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function BrazilHeatmap({ values, selectedState, nationalAverage, nationalStdDev, loading = false, showEngagement = true, countLabel = 'Atletas com perfil', onSelect }: Props) {
  const lookup = new Map(values.map((value) => [value.code.toLowerCase(), value]))
  const maximum = Math.max(...values.map((value) => value.count), 1)
  const statesWithData = values.filter((value) => value.count > 0)
  const totalCount = values.reduce((sum, value) => sum + value.count, 0)
  const nationalEngagement = statesWithData.length ? Math.round(statesWithData.reduce((sum, value) => sum + value.engagement, 0) / statesWithData.length) : 0
  const dimensionLabels = [...new Set(values.flatMap((value) => value.dimensions.map((dimension) => dimension.label)))]
  const nationalDimensions = dimensionLabels.map((label) => {
    const scores = values.flatMap((value) => value.dimensions).filter((dimension) => dimension.label === label && dimension.score !== null).map((dimension) => dimension.score as number)
    return { label, score: scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null }
  })

  return (
    <Card className="@container/card min-w-0">
      <CardHeader>
        <CardDescription>MAPA NACIONAL</CardDescription>
        <CardTitle>Termômetro nacional</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 @4xl/card:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <div className="flex min-h-72 items-center justify-center rounded-lg border bg-muted/20 p-3">
          {loading ? <Skeleton className="h-64 w-full max-w-[520px] rounded-lg" /> : null}
          {!loading && (
          <TooltipProvider>
            <svg viewBox={brazil.viewBox} className="h-auto max-h-[420px] w-full max-w-[520px]" role="img" aria-label="Mapa interativo do Brasil por estado">
              {brazil.locations.map((location: (typeof brazil.locations)[number]) => {
              const value = lookup.get(location.id) ?? { code: location.id.toUpperCase(), name: location.name, count: 0, score: null, engagement: 0, dimensions: [] }
              const stateName = stateNames[value.code] ?? value.name
              const isSelected = selectedState === value.code
              const hasData = value.count > 0
              const zScore = zScoreFor(value.score, nationalAverage, nationalStdDev)

              return (
                <Tooltip key={location.id}>
                  <TooltipTrigger asChild>
                    <path
                      d={location.path}
                      tabIndex={hasData ? 0 : -1}
                      role={hasData ? 'button' : undefined}
                      aria-label={`${stateName} (${value.code}): ${value.count} ${countLabel.toLowerCase()}${value.score === null ? '' : `, média ${value.score.toFixed(2)}`}`}
                      className={cn('stroke-background stroke-[1.5] outline-none transition-opacity', hasData ? 'cursor-pointer hover:opacity-80 focus-visible:stroke-foreground' : 'cursor-default', isSelected && 'stroke-foreground stroke-[3]')}
                      style={{ fill: colorForValue(value, maximum) }}
                      onClick={hasData ? () => onSelect(isSelected ? null : value.code) : undefined}
                      onKeyDown={hasData ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onSelect(isSelected ? null : value.code)
                        }
                      } : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="grid gap-0.5"><strong>{stateName} ({value.code})</strong><span>{value.count} {countLabel.toLowerCase()}</span><span>{value.score === null ? 'Média técnica: sem dados' : `Média técnica: ${value.score.toFixed(2)}`}</span><span>{zScore === null ? 'Z-Score: sem dados' : `Z-Score: ${zScore >= 0 ? '+' : ''}${zScore.toFixed(2)}`}</span></div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
            </svg>
          </TooltipProvider>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado selecionado</p>
            <p className="mt-1 text-lg font-semibold">{selectedState ? stateNames[selectedState] : 'Brasil inteiro'}</p>
          </div>
          {loading ? <div className="grid gap-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-24 w-full" /></div> : selectedState && lookup.get(selectedState.toLowerCase()) ? (() => {
            const selected = lookup.get(selectedState.toLowerCase())!
            const zScore = zScoreFor(selected.score, nationalAverage, nationalStdDev)
            return (
              <>
                <ScoreComparisonCard localScore={selected.score} zScore={zScore} info={<InfoTooltip label="O que é Z-Score?" content={Z_SCORE_EXPLANATION} />} />
                {showEngagement && <CoverageGauge value={selected.engagement} label="Cobertura física" description="dos atletas do estado com avaliação física registrada" info={<InfoTooltip label="O que é cobertura física?" content={ENGAGEMENT_EXPLANATION} />} />}
                <DimensionBars title="Raio-X das dimensões" dimensions={selected.dimensions} info={<InfoTooltip label="O que é score por dimensão?" content={AVERAGE_SCORE_EXPLANATION} />} />
                <div className="rounded-md bg-muted/50 p-3 text-sm">{selected.dimensions.length && selected.dimensions.some((dimension) => dimension.score !== null) ? `Diferente do cenário nacional, a principal oportunidade de desenvolvimento em ${stateNames[selected.code]} está em ${selected.dimensions.reduce((lowest, current) => (current.score !== null && (lowest.score === null || current.score < lowest.score) ? current : lowest)).label}.` : 'Ainda não há dados técnicos suficientes para uma inferência regional.'}</div>
              </>
            )
          })() : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <StatTile icon={Landmark} label="Estados com dados" value={String(statesWithData.length)} />
                <StatTile icon={Gauge} label="Média nacional" value={nationalAverage === null ? '—' : nationalAverage.toFixed(2)} info={<InfoTooltip label="O que é pontuação média?" content={AVERAGE_SCORE_EXPLANATION} />} />
              </div>
              <StatTile icon={Activity} label={countLabel} value={totalCount.toLocaleString('pt-BR')} description={`${countLabel.toLowerCase()} em todo o país`} />
              {showEngagement && <CoverageGauge value={nationalEngagement} label="Cobertura física média" description="dos atletas com avaliação física registrada" info={<InfoTooltip label="O que é cobertura física?" content={ENGAGEMENT_EXPLANATION} />} />}
              {nationalDimensions.length > 0 && <DimensionBars title="Raio-X das dimensões (nacional)" dimensions={nationalDimensions} info={<InfoTooltip label="O que é score por dimensão?" content={AVERAGE_SCORE_EXPLANATION} />} />}
              <p className="text-sm text-muted-foreground">Selecione um estado no mapa para ver o comparativo local. Quando não há dados, o estado aparece com tom neutro e sem inferência.</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
