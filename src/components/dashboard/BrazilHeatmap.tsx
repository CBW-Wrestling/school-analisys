import brazil from '@svg-maps/brazil'
import { MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { zScoreFor } from '../../lib/zscore'
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
  description?: string
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

export function BrazilHeatmap({ values, selectedState, nationalAverage, nationalStdDev, loading = false, showEngagement = true, countLabel = 'Atletas com perfil', description = 'Distribuição por estado dos atletas com perfil cadastrado.', onSelect }: Props) {
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
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" aria-hidden />
          Termômetro nacional
        </CardTitle>
        <CardDescription>{description}</CardDescription>
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
              const zScore = zScoreFor(value.score, nationalAverage, nationalStdDev)

              return (
                <Tooltip key={location.id}>
                  <TooltipTrigger asChild>
                    <path
                      d={location.path}
                      tabIndex={0}
                      role="button"
                      aria-label={`${stateName} (${value.code}): ${value.count} ${countLabel.toLowerCase()}${value.score === null ? '' : `, média ${value.score.toFixed(2)}`}`}
                      className={cn('cursor-pointer stroke-background stroke-[1.5] outline-none transition-opacity hover:opacity-80 focus-visible:stroke-foreground', isSelected && 'stroke-foreground stroke-[3]')}
                      style={{ fill: colorForValue(value, maximum) }}
                      onClick={() => onSelect(isSelected ? null : value.code)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onSelect(isSelected ? null : value.code)
                        }
                      }}
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
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado selecionado</p>
            <p className="mt-1 text-lg font-semibold">{selectedState ? stateNames[selectedState] : 'Brasil inteiro'}</p>
          </div>
          {loading ? <div className="grid gap-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-24 w-full" /></div> : selectedState && lookup.get(selectedState.toLowerCase()) ? (() => {
            const selected = lookup.get(selectedState.toLowerCase())!
            const difference = selected.score === null || nationalAverage === null ? null : selected.score - nationalAverage
            const zScore = zScoreFor(selected.score, nationalAverage, nationalStdDev)
            return (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border p-2"><p className="text-xs text-muted-foreground">Média local</p><p className="font-semibold tabular-nums">{selected.score === null ? '—' : selected.score.toFixed(2)}</p></div>
                  <div className="rounded-md border p-2"><p className="text-xs text-muted-foreground">Nacional</p><p className="font-semibold tabular-nums">{nationalAverage === null ? '—' : nationalAverage.toFixed(2)}</p></div>
                </div>
                <div className={cn('rounded-md border px-3 py-2 text-sm', zScore === null ? 'text-muted-foreground' : zScore >= 0 ? 'border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'border-red-500/30 text-red-700 dark:text-red-400')}>
                  {difference === null ? 'Comparativo indisponível' : `Variação: ${difference >= 0 ? '+' : ''}${difference.toFixed(2)}${zScore === null ? '' : ` | Z-Score: ${zScore >= 0 ? '+' : ''}${zScore.toFixed(2)}`}`}
                </div>
                {showEngagement && <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cobertura física</p><p className="mt-1 text-sm">{selected.engagement}% dos atletas do estado com avaliação física registrada</p></div>}
                <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Raio-X das dimensões</p><div className="mt-2 grid grid-cols-3 gap-2">{selected.dimensions.map((dimension) => <div key={dimension.label} className="grid min-w-0 gap-1.5"><div className="grid gap-1 text-xs"><span className="truncate" title={dimension.label}>{dimension.label}</span><span className="font-medium tabular-nums">{dimension.score === null ? '—' : dimension.score.toFixed(2)}</span></div><Progress value={dimension.score === null ? 0 : dimension.score / 2 * 100} aria-label={`${dimension.label}: ${dimension.score === null ? 'sem dados' : dimension.score.toFixed(2)}`} /></div>)}</div></div>
                <div className="rounded-md bg-muted/50 p-3 text-sm">{selected.dimensions.length && selected.dimensions.some((dimension) => dimension.score !== null) ? `Diferente do cenário nacional, a principal oportunidade de desenvolvimento em ${stateNames[selected.code]} está em ${selected.dimensions.reduce((lowest, current) => (current.score !== null && (lowest.score === null || current.score < lowest.score) ? current : lowest)).label}.` : 'Ainda não há dados técnicos suficientes para uma inferência regional.'}</div>
              </>
            )
          })() : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border p-2"><p className="text-xs text-muted-foreground">Estados com dados</p><p className="font-semibold tabular-nums">{statesWithData.length}</p></div>
                <div className="rounded-md border p-2"><p className="text-xs text-muted-foreground">Média nacional</p><p className="font-semibold tabular-nums">{nationalAverage === null ? '—' : nationalAverage.toFixed(2)}</p></div>
              </div>
              <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{countLabel}</p><p className="mt-1 text-sm">{totalCount.toLocaleString('pt-BR')} {countLabel.toLowerCase()} em todo o país</p></div>
              {showEngagement && <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cobertura física média</p><p className="mt-1 text-sm">{nationalEngagement}% dos atletas com avaliação física registrada</p></div>}
              {nationalDimensions.length > 0 && <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Raio-X das dimensões (nacional)</p><div className="mt-2 grid grid-cols-3 gap-2">{nationalDimensions.map((dimension) => <div key={dimension.label} className="grid min-w-0 gap-1.5"><div className="grid gap-1 text-xs"><span className="truncate" title={dimension.label}>{dimension.label}</span><span className="font-medium tabular-nums">{dimension.score === null ? '—' : dimension.score.toFixed(2)}</span></div><Progress value={dimension.score === null ? 0 : dimension.score / 2 * 100} aria-label={`${dimension.label}: ${dimension.score === null ? 'sem dados' : dimension.score.toFixed(2)}`} /></div>)}</div></div>}
              <p className="text-sm text-muted-foreground">Selecione um estado no mapa para ver o comparativo local. Quando não há dados, o estado aparece com tom neutro e sem inferência.</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
