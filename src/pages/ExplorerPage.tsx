import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts'
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { useApiRows } from '../lib/api'
import { visibleMotorRows } from '../lib/motorScore'
import type { CompetitionRow, MotorRow, ProfileRow } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Toggle } from '@/components/ui/toggle'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

const SOCIAL_DIMS: { key: keyof ProfileRow; label: string; eyebrow: string }[] = [
  { key: 'tempoPratica',       label: 'Tempo de Prática',       eyebrow: 'EXPERIÊNCIA' },
  { key: 'localPratica',       label: 'Local de Prática',       eyebrow: 'AMBIENTE'   },
  { key: 'flagOutraModalidade', label: 'Pratica Outro Esporte?', eyebrow: 'MULTIESPORTE' },
  { key: 'iniciouNaLuta',      label: 'Começou pela Luta?',     eyebrow: 'ORIGEM'     },
]

function ExplorerBarChart({ data, keys, label, stacked = false, expanded = false }: { data: Record<string, string | number>[]; keys: string[]; label: string; stacked?: boolean; expanded?: boolean }) {
  return (
    <ChartContainer
      config={{}}
      className={expanded ? 'aspect-auto h-[420px] w-full' : 'aspect-auto h-[320px] w-full'}
      role="img"
      aria-label={label}
    >
      <BarChart data={data} margin={{ top: 12, right: 12, bottom: 12, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={8} angle={-15} textAnchor="end" height={52} />
        <YAxis axisLine={false} tickLine={false} width={34} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        {keys.length > 1 && <Legend verticalAlign="top" align="right" height={28} />}
        {keys.map((key, index) => (
          <Bar key={key} dataKey={key} stackId={stacked ? 'status' : undefined} fill={`var(--chart-${(index % 5) + 1})`} radius={3} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

function FilterSkeleton() {
  return <div className="grid gap-2.5"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-4/5" /><Skeleton className="h-5 w-3/5" /></div>
}

export function ExplorerPage() {
  const { rows: competitions, error: competitionsError } = useApiRows<CompetitionRow>('/api/competitions')
  const { rows: motorRows, loading, error: motorError } = useApiRows<MotorRow>('/api/dashboard/motor')
  const { rows: profileRows, loading: profileLoading, error: profileError } = useApiRows<ProfileRow>('/api/dashboard/profiles')
  const validMotorRows = useMemo(() => visibleMotorRows(motorRows), [motorRows])

  const allStyles = useMemo(
    () => Array.from(new Set(validMotorRows.map((r) => r.estilo))).filter((s): s is string => Boolean(s)).sort(),
    [validMotorRows]
  )
  const allCompetencias = useMemo(
    () => Array.from(new Set(validMotorRows.map((r) => r.competencia))).filter((c): c is string => Boolean(c)).sort(),
    [validMotorRows]
  )

  // all movements grouped by competência
  const avaliacoesByComp = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const row of validMotorRows) {
      if (!row.competencia || !row.avaliacao) continue
      if (!map[row.competencia]) map[row.competencia] = []
      if (!map[row.competencia].includes(row.avaliacao)) map[row.competencia].push(row.avaliacao)
    }
    return map
  }, [validMotorRows])

  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedCompetencias, setSelectedCompetencias] = useState<string[]>([])
  const [expandedCompetencia, setExpandedCompetencia] = useState<string | null>(null)
  const [selectedAvaliacoes, setSelectedAvaliacoes] = useState<Record<string, string[]>>({})
  const [expandedAvs, setExpandedAvs] = useState<Record<string, string | null>>({})
  const [expandedSocial, setExpandedSocial] = useState<string | null>(null)

  const toggleExpandAv = (comp: string, av: string) =>
    setExpandedAvs((p) => ({ ...p, [comp]: p[comp] === av ? null : av }))

  // maps code → "Nome Ano" for chart labels
  const eventLabel = useMemo(() => {
    const map: Record<string, string> = {}
    for (const c of competitions)
      map[c.code] = c.year ? `${c.name} ${c.year}` : c.name
    return map
  }, [competitions])

  // chart keys use formatted names instead of raw codes
  const chartKeys = useMemo(
    () => selectedEvents.map((ev) => eventLabel[ev] ?? ev),
    [selectedEvents, eventLabel]
  )

  const toggleAvaliacao = (comp: string, av: string) => {
    setSelectedAvaliacoes((prev) => {
      const current = prev[comp] ?? avaliacoesByComp[comp] ?? []
      return { ...prev, [comp]: current.includes(av) ? current.filter((x) => x !== av) : [...current, av] }
    })
  }


  useEffect(() => {
    if (competitions.length > 0 && selectedEvents.length === 0)
      setSelectedEvents(competitions.map((c) => c.code))
  }, [competitions, selectedEvents])

  useEffect(() => {
    if (allStyles.length > 0 && selectedStyles.length === 0) setSelectedStyles(allStyles)
  }, [allStyles, selectedStyles])

  useEffect(() => {
    if (allCompetencias.length > 0 && selectedCompetencias.length === 0)
      setSelectedCompetencias(allCompetencias)
  }, [allCompetencias, selectedCompetencias])

  useEffect(() => {
    if (Object.keys(avaliacoesByComp).length > 0 && Object.keys(selectedAvaliacoes).length === 0)
      setSelectedAvaliacoes(Object.fromEntries(Object.entries(avaliacoesByComp).map(([k, v]) => [k, v])))
  }, [avaliacoesByComp, selectedAvaliacoes])

  const filtered = useMemo(
    () =>
      validMotorRows.filter(
        (r) =>
          selectedEvents.includes(r.eventIdentifier ?? '') &&
          (selectedStyles.length === 0 || selectedStyles.includes(r.estilo ?? '')) &&
          (selectedCompetencias.length === 0 || selectedCompetencias.includes(r.competencia ?? ''))
      ),
    [validMotorRows, selectedEvents, selectedStyles, selectedCompetencias]
  )

  const profileFiltered = useMemo(
    () =>
      profileRows.filter(
        (r) =>
          selectedEvents.includes(r.eventIdentifier ?? '') &&
          (selectedStyles.length === 0 || selectedStyles.includes(r.estilo ?? ''))
      ),
    [profileRows, selectedEvents, selectedStyles]
  )

  const socialChartData = (dimKey: keyof ProfileRow) => {
    const cats = Array.from(new Set(profileFiltered.map((r) => String(r[dimKey] || 'Sem registro')))).sort()
    return cats.map((cat) => {
      const obj: Record<string, string | number> = { label: cat }
      for (const ev of selectedEvents)
        obj[eventLabel[ev] ?? ev] = profileFiltered.filter(
          (r) => r.eventIdentifier === ev && String(r[dimKey] || 'Sem registro') === cat
        ).length
      return obj
    })
  }

  const total = filtered.length
  const complete = filtered.filter((r) => r.resultado === 'COMPLETE').length

  const allResultados = useMemo(
    () => Array.from(new Set(validMotorRows.map((r) => r.resultado || 'Sem registro'))),
    [validMotorRows]
  )

  const resultadoData = useMemo(
    () =>
      allResultados.map((resultado) => {
        const obj: Record<string, string | number> = { label: resultado }
        for (const ev of selectedEvents)
          obj[eventLabel[ev] ?? ev] = filtered.filter(
            (r) => r.eventIdentifier === ev && (r.resultado || 'Sem registro') === resultado
          ).length
        return obj
      }),
    [filtered, selectedEvents, eventLabel, allResultados]
  )

  const competenciaData = useMemo(
    () =>
      allCompetencias
        .filter((c) => selectedCompetencias.includes(c))
        .map((comp) => {
          const obj: Record<string, string | number> = { label: comp }
          for (const ev of selectedEvents)
              obj[eventLabel[ev] ?? ev] = filtered.filter((r) => r.eventIdentifier === ev && r.competencia === comp).length
          return obj
        }),
    [filtered, selectedEvents, eventLabel, allCompetencias, selectedCompetencias]
  )

  const toggleEvent = (code: string) =>
    setSelectedEvents((p) => (p.includes(code) ? p.filter((e) => e !== code) : [...p, code]))
  const toggleStyle = (style: string) =>
    setSelectedStyles((p) => (p.includes(style) ? p.filter((s) => s !== style) : [...p, style]))
  const toggleCompetencia = (c: string) =>
    setSelectedCompetencias((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))

  const resetFilters = () => {
    setSelectedEvents(competitions.map((competition) => competition.code))
    setSelectedStyles(allStyles)
    setSelectedCompetencias(allCompetencias)
    setSelectedAvaliacoes(avaliacoesByComp)
  }

  const hasCustomFilters =
    selectedEvents.length !== competitions.length || competitions.some((competition) => !selectedEvents.includes(competition.code)) ||
    selectedStyles.length !== allStyles.length || allStyles.some((style) => !selectedStyles.includes(style)) ||
    selectedCompetencias.length !== allCompetencias.length || allCompetencias.some((competencia) => !selectedCompetencias.includes(competencia))

  return (
    <PageHeader active="explorer">
      <div className="@container/main">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Análise exploratória</p>
            <h1 className="text-3xl leading-none tracking-tight text-foreground">Leitura da base</h1>
            <p className="text-sm text-muted-foreground">Cruze eventos, estilos e competências para encontrar padrões de execução.</p>
          </div>
          <Button variant="outline" size="sm" onClick={resetFilters} disabled={!hasCustomFilters}>
            <RotateCcw aria-hidden="true" />
            Restaurar filtros
          </Button>
        </div>

        {competitionsError && (
          <Alert variant="destructive"><AlertDescription>Não foi possível carregar as competições.</AlertDescription></Alert>
        )}
        {motorError && (
          <Alert variant="destructive"><AlertDescription>Não foi possível carregar os dados técnicos.</AlertDescription></Alert>
        )}
        {profileError && (
          <Alert variant="destructive"><AlertDescription>Não foi possível carregar os perfis.</AlertDescription></Alert>
        )}

        <div className="grid grid-cols-2 gap-4 @xl/main:grid-cols-4">
          <Metric loading={loading} label="Movimentos avaliados" value={String(total)} />
          <Metric loading={loading} label="Execuções completas" value={String(complete)} />
          <Metric loading={loading} label="Taxa de domínio" value={total ? `${Math.round((complete / total) * 100)}%` : '—'} />
          <Metric loading={loading} label="Eventos selecionados" value={String(selectedEvents.length)} />
        </div>

        <aside className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-medium tracking-wide">COMPETIÇÕES</CardDescription>
              <CardAction className="flex gap-1">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSelectedEvents(competitions.map((c) => c.code))}>Todas</Button>
                <span className="text-muted-foreground">·</span>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSelectedEvents([])}>Limpar</Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <fieldset className="flex flex-col gap-2.5">
              <legend className="sr-only">Competições</legend>
              {loading ? <FilterSkeleton /> : competitions.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={selectedEvents.includes(c.code)} onCheckedChange={() => toggleEvent(c.code)} />
                  <span className="flex-1">{c.name}</span>
                  {c.year && <small className="font-mono text-xs text-muted-foreground">{c.year}</small>}
                </label>
              ))}
              </fieldset>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-medium tracking-wide">ESTILOS</CardDescription>
              <CardAction className="flex gap-1">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSelectedStyles(allStyles)}>Todos</Button>
                <span className="text-muted-foreground">·</span>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSelectedStyles([])}>Limpar</Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <fieldset className="flex flex-col gap-2.5">
              <legend className="sr-only">Estilos</legend>
              {loading ? <FilterSkeleton /> : allStyles.map((style) => (
                <label key={style} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={selectedStyles.includes(style)} onCheckedChange={() => toggleStyle(style)} />
                  <span>{style}</span>
                </label>
              ))}
              </fieldset>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-medium tracking-wide">COMPETÊNCIAS</CardDescription>
              <CardAction className="flex gap-1">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSelectedCompetencias(allCompetencias)}>Todas</Button>
                <span className="text-muted-foreground">·</span>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSelectedCompetencias([])}>Limpar</Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <fieldset className="flex flex-col gap-2.5">
              <legend className="sr-only">Competências</legend>
              {loading ? <FilterSkeleton /> : allCompetencias.map((comp) => (
                <label key={comp} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={selectedCompetencias.includes(comp)} onCheckedChange={() => toggleCompetencia(comp)} />
                  <span>{comp}</span>
                </label>
              ))}
              </fieldset>
            </CardContent>
          </Card>
        </aside>
        <div className="min-w-0">
          {loading ? (
            <div className="grid gap-4 @2xl/main:grid-cols-2"><Skeleton className="h-[320px] w-full rounded-lg" /><Skeleton className="h-[320px] w-full rounded-lg" /></div>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-1 gap-4 @2xl/main:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardDescription className="text-xs font-medium tracking-wide">TÉCNICO · RESULTADO</CardDescription>
                    <CardTitle>Qualidade da execução por evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExplorerBarChart data={resultadoData} keys={chartKeys} label="Gráfico de barras que compara os resultados de execução entre eventos selecionados." />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardDescription className="text-xs font-medium tracking-wide">TÉCNICO · COMPETÊNCIA</CardDescription>
                    <CardTitle>Movimentos por competência e evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExplorerBarChart data={competenciaData} keys={chartKeys} label="Gráfico de barras que compara movimentos por competência entre eventos selecionados." />
                  </CardContent>
                </Card>
              </div>

              {/* Drill-down por competência */}
              {allCompetencias
                .filter((comp) => selectedCompetencias.includes(comp))
                .map((comp) => {
                  const allAvs = avaliacoesByComp[comp] ?? []
                  // filter preserves allAvs order regardless of toggle order
                  const rawSel = selectedAvaliacoes[comp] ?? allAvs
                  const selAvs = allAvs.filter((av) => rawSel.includes(av))
                  const compRows = filtered.filter((r) => r.competencia === comp)
                  const compComplete = compRows.filter((r) => r.resultado === 'COMPLETE').length
                  const isExpanded = expandedCompetencia === comp

                  // grouped bar: X = selAvs, keys = competitions (chartKeys)
                  const resultados = Array.from(
                    new Set(compRows.map((r) => r.resultado || 'Sem registro'))
                  ).sort()

                  // one stacked chart per movement: X = competitions, stacked by status
                  const perAvCharts = selAvs.map((av) => {
                    const data = selectedEvents.map((ev) => {
                      const obj: Record<string, string | number> = { label: eventLabel[ev] ?? ev }
                      for (const res of resultados)
                        obj[res] = compRows.filter(
                          (r) => r.eventIdentifier === ev && r.avaliacao === av && (r.resultado || 'Sem registro') === res
                        ).length
                      return obj
                    })
                    return { av, data }
                  })

                  return (
                    <Collapsible
                      key={comp}
                      open={isExpanded}
                      onOpenChange={(open) => setExpandedCompetencia(open ? comp : null)}
                      className="mb-3 rounded-xl border bg-card"
                    >
                      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
                        <div>
                          <p className="mb-0.5 text-xs font-medium tracking-wide text-muted-foreground">TÉCNICO · MOTOR</p>
                          <h3 className="font-heading text-sm font-medium text-foreground">{comp}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                          <span>{compRows.length} registros</span>
                          <span>
                            {compRows.length
                              ? `${Math.round((compComplete / compRows.length) * 100)}% domínio`
                              : '—'}
                          </span>
                          {isExpanded ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="px-5 pb-5">
                        {/* movement filter */}
                        <div className="mb-3.5 rounded-lg bg-muted/50 p-3.5">
                          <div className="mb-2.5 flex items-center justify-between gap-3">
                            <p id={`movements-label-${comp}`} className="text-xs font-medium tracking-wide text-muted-foreground">MOVIMENTOS</p>
                            <div className="flex gap-1">
                              <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSelectedAvaliacoes((p) => ({ ...p, [comp]: allAvs }))}>
                                Todos
                              </Button>
                              <span className="text-muted-foreground">·</span>
                              <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSelectedAvaliacoes((p) => ({ ...p, [comp]: [] }))}>
                                Limpar
                              </Button>
                            </div>
                          </div>
                          <div role="group" aria-labelledby={`movements-label-${comp}`} className="flex flex-wrap gap-1.5">
                            {allAvs.map((av) => (
                              <Toggle
                                key={av}
                                size="sm"
                                variant="outline"
                                pressed={selAvs.includes(av)}
                                onPressedChange={() => toggleAvaliacao(comp, av)}
                                className="rounded-full text-xs"
                              >
                                {av}
                              </Toggle>
                            ))}
                          </div>
                        </div>

                        {/* per-movement stacked charts: X = competitions */}
                        <div className="grid grid-cols-1 gap-4 @2xl/main:grid-cols-2">
                          {perAvCharts.map(({ av, data }) => {
                            const isAvExpanded = expandedAvs[comp] === av
                            return (
                              <Card key={av} className={isAvExpanded ? '@2xl/main:col-span-2' : undefined}>
                                <CardHeader>
                                  <CardTitle className="text-sm">{av}</CardTitle>
                                  <CardAction>
                                    <Button
                                      variant="outline"
                                      size="icon-sm"
                                      onClick={() => toggleExpandAv(comp, av)}
                                      aria-label={isAvExpanded ? `Recolher gráfico de ${av}` : `Expandir gráfico de ${av}`}
                                      title={isAvExpanded ? 'Recolher' : 'Expandir'}
                                    >
                                      {isAvExpanded ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
                                    </Button>
                                  </CardAction>
                                </CardHeader>
                                <CardContent>
                                    <ExplorerBarChart data={data} keys={resultados} label={`Gráfico de barras empilhadas dos resultados de ${av} por evento.`} stacked expanded={isAvExpanded} />
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}

              {/* ── PERFIL SOCIAL ─────────────────────────── */}
              <div className="mt-7 mb-4 border-t pt-6">
                <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground">PERFIL DO ATLETA</p>
                <h2 className="font-heading text-xl font-semibold text-foreground">Dados socioesportivos</h2>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4 @xl/main:grid-cols-4">
                <Metric label="Atletas com perfil" value={profileLoading ? '—' : String(profileFiltered.length)} />
                <Metric
                  label="Fazem outro esporte"
                  value={profileLoading ? '—' : (() => {
                    const sim = profileFiltered.filter((r) => r.flagOutraModalidade === 'sim').length
                    return profileFiltered.length ? `${Math.round((sim / profileFiltered.length) * 100)}%` : '—'
                  })()}
                />
                <Metric
                  label="Iniciaram pela luta"
                  value={profileLoading ? '—' : (() => {
                    const sim = profileFiltered.filter((r) => r.iniciouNaLuta === 'sim').length
                    return profileFiltered.length ? `${Math.round((sim / profileFiltered.length) * 100)}%` : '—'
                  })()}
                />
                <Metric label="Eventos" value={String(selectedEvents.length)} />
              </div>

              {profileLoading ? (
                <p className="py-12 text-center text-sm text-muted-foreground">Carregando perfis...</p>
              ) : (
                SOCIAL_DIMS.map(({ key, label, eyebrow }) => {
                  const isOpen = expandedSocial === key
                  const data = isOpen ? socialChartData(key) : []
                  return (
                    <Collapsible
                      key={key}
                      open={isOpen}
                      onOpenChange={(open) => setExpandedSocial(open ? key : null)}
                      className="mb-3 rounded-xl border bg-card"
                    >
                      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
                        <div>
                          <p className="mb-0.5 text-xs font-medium tracking-wide text-muted-foreground">{eyebrow}</p>
                          <h3 className="font-heading text-sm font-medium text-foreground">{label}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                          <span>{profileFiltered.length} registros</span>
                          {isOpen ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="px-5 pb-5">
                        <div className="border-t pt-4">
                          <p className="mb-3 text-sm font-medium">{label} por competição</p>
                          <ExplorerBarChart data={data} keys={chartKeys} label={`Gráfico de barras de ${label.toLowerCase()} por competição.`} />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })
              )}

            </>
          )}
        </div>
      </div>
      </div>
    </PageHeader>
  )
}
