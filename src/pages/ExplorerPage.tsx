import { ResponsiveBar } from '@nivo/bar'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { useApiRows } from '../lib/api'
import type { CompetitionRow, MotorRow, ProfileRow } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Toggle } from '@/components/ui/toggle'

const SOCIAL_DIMS: { key: keyof ProfileRow; label: string; eyebrow: string }[] = [
  { key: 'tempoPratica',       label: 'Tempo de Prática',       eyebrow: 'EXPERIÊNCIA' },
  { key: 'localPratica',       label: 'Local de Prática',       eyebrow: 'AMBIENTE'   },
  { key: 'flagOutraModalidade', label: 'Pratica Outro Esporte?', eyebrow: 'MULTIESPORTE' },
  { key: 'iniciouNaLuta',      label: 'Começou pela Luta?',     eyebrow: 'ORIGEM'     },
]

const THEME = {
  text: { fontSize: 11, fill: 'var(--muted-foreground)' },
  axis: {
    ticks: { text: { fill: 'var(--muted-foreground)', fontSize: 11 } },
    legend: { text: { fill: 'var(--muted-foreground)', fontSize: 11 } },
  },
  grid: { line: { stroke: 'var(--line)' } },
  tooltip: {
    container: {
      background: 'var(--paper)',
      color: 'var(--navy)',
      fontSize: 12,
      border: '1px solid var(--line)',
      borderRadius: 4,
      boxShadow: '0 4px 12px color-mix(in srgb, var(--navy) 8%, transparent)',
    },
  },
}

function barLegends(count: number) {
  if (count <= 1) return []
  return [
    {
      dataFrom: 'keys' as const,
      anchor: 'bottom' as const,
      direction: 'row' as const,
      translateY: 52,
      itemWidth: 120,
      itemHeight: 14,
      symbolSize: 10,
      symbolShape: 'circle' as const,
    },
  ]
}

function barMargin(eventCount: number) {
  return { top: 10, right: 20, bottom: eventCount > 1 ? 58 : 40, left: 50 }
}

// custom layer: line connecting the per-movement average across all selected competitions
function AverageLine({ bars }: any) {
  const groupMap = new Map<string, { xs: number[]; ys: number[]; total: number }>()
  for (const bar of bars) {
    const idx = String(bar.data.indexValue)
    if (!groupMap.has(idx)) groupMap.set(idx, { xs: [], ys: [], total: 0 })
    const g = groupMap.get(idx)!
    g.xs.push(bar.x + bar.width / 2)
    g.ys.push(bar.y)
    g.total += Number(bar.data.value) || 0
  }
  const points = Array.from(groupMap.values())
    .map((g) => ({
      x: g.xs.reduce((s, v) => s + v, 0) / g.xs.length,
      y: g.ys.reduce((s, v) => s + v, 0) / g.ys.length,
      total: g.total,
    }))
    .sort((a, b) => a.x - b.x)
  if (points.length === 0) return null
  const avg = points.reduce((s, p) => s + p.total, 0) / points.length
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const last = points[points.length - 1]
  return (
    <g>
      {points.length > 1 && (
        <path d={d} stroke="var(--navy)" strokeWidth={2} fill="none" strokeDasharray="5 4" strokeLinejoin="round" />
      )}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--paper)" stroke="var(--navy)" strokeWidth={2} />
      ))}
      <text x={last.x + 10} y={last.y + 4} fontSize={10} fontWeight={700} fill="var(--navy)" textAnchor="start">
        {`ø ${avg.toFixed(1)}`}
      </text>
    </g>
  )
}

// custom layer: total label on top of each stacked bar
function StackTotals({ bars }: any) {
  const totals = new Map<string, { x: number; minY: number; total: number }>()
  for (const bar of bars) {
    const idx = String(bar.data.indexValue)
    const cx = bar.x + bar.width / 2
    const val = Number(bar.data.value) || 0
    if (!totals.has(idx)) {
      totals.set(idx, { x: cx, minY: bar.y, total: val })
    } else {
      const e = totals.get(idx)!
      e.total += val
      if (bar.y < e.minY) e.minY = bar.y
    }
  }
  return (
    <g>
      {Array.from(totals.values()).map(({ x, minY, total }, i) =>
        total > 0 ? (
          <text key={i} x={x} y={minY - 5} textAnchor="middle" fontSize={11} fontWeight={800} fill="var(--navy)">
            {total}
          </text>
        ) : null
      )}
    </g>
  )
}

export function ExplorerPage() {
  const { rows: competitions } = useApiRows<CompetitionRow>('/api/competitions')
  const { rows: motorRows, loading } = useApiRows<MotorRow>('/api/dashboard/motor')
  const { rows: profileRows, loading: profileLoading } = useApiRows<ProfileRow>('/api/dashboard/profiles')

  const allStyles = useMemo(
    () => Array.from(new Set(motorRows.map((r) => r.estilo))).filter((s): s is string => Boolean(s)).sort(),
    [motorRows]
  )
  const allCompetencias = useMemo(
    () => Array.from(new Set(motorRows.map((r) => r.competencia))).filter((c): c is string => Boolean(c)).sort(),
    [motorRows]
  )

  // all movements grouped by competência
  const avaliacoesByComp = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const row of motorRows) {
      if (!row.competencia || !row.avaliacao) continue
      if (!map[row.competencia]) map[row.competencia] = []
      if (!map[row.competencia].includes(row.avaliacao)) map[row.competencia].push(row.avaliacao)
    }
    return map
  }, [motorRows])

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
      motorRows.filter(
        (r) =>
          selectedEvents.includes(r.eventIdentifier ?? '') &&
          (selectedStyles.length === 0 || selectedStyles.includes(r.estilo ?? '')) &&
          (selectedCompetencias.length === 0 || selectedCompetencias.includes(r.competencia ?? ''))
      ),
    [motorRows, selectedEvents, selectedStyles, selectedCompetencias]
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
    () => Array.from(new Set(motorRows.map((r) => r.resultado || 'Sem registro'))),
    [motorRows]
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

  return (
    <PageHeader active="explorer">
      <div className="@container/main">
      <div className="mx-auto max-w-[1300px] gap-6 px-7 py-7 @4xl/main:grid @4xl/main:grid-cols-[240px_1fr]">
        <aside className="mb-6 flex flex-col gap-4 @4xl/main:sticky @4xl/main:top-4 @4xl/main:mb-0 @4xl/main:self-start">
          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-bold tracking-wide">COMPETIÇÕES</CardDescription>
              <CardAction className="flex gap-1">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSelectedEvents(competitions.map((c) => c.code))}>Todas</Button>
                <span className="text-muted-foreground">·</span>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSelectedEvents([])}>Limpar</Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {competitions.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={selectedEvents.includes(c.code)} onCheckedChange={() => toggleEvent(c.code)} />
                  <span className="flex-1">{c.name}</span>
                  {c.year && <small className="font-mono text-xs text-muted-foreground">{c.year}</small>}
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-bold tracking-wide">ESTILOS</CardDescription>
              <CardAction className="flex gap-1">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSelectedStyles(allStyles)}>Todos</Button>
                <span className="text-muted-foreground">·</span>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSelectedStyles([])}>Limpar</Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {allStyles.map((style) => (
                <label key={style} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={selectedStyles.includes(style)} onCheckedChange={() => toggleStyle(style)} />
                  <span>{style}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-bold tracking-wide">COMPETÊNCIAS</CardDescription>
              <CardAction className="flex gap-1">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSelectedCompetencias(allCompetencias)}>Todas</Button>
                <span className="text-muted-foreground">·</span>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSelectedCompetencias([])}>Limpar</Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {allCompetencias.map((comp) => (
                <label key={comp} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={selectedCompetencias.includes(comp)} onCheckedChange={() => toggleCompetencia(comp)} />
                  <span>{comp}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0">
          <div className="mb-3.5 grid grid-cols-2 gap-3.5 @xl/main:grid-cols-4">
            <Metric label="Movimentos avaliados" value={loading ? '—' : String(total)} />
            <Metric label="Execuções completas" value={loading ? '—' : String(complete)} />
            <Metric label="Taxa de domínio" value={loading ? '—' : total ? `${Math.round((complete / total) * 100)}%` : '—'} />
            <Metric label="Eventos selecionados" value={String(selectedEvents.length)} />
          </div>

          {loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Carregando dados...</p>
          ) : (
            <>
              <div className="mb-3.5 grid grid-cols-1 gap-3.5 @2xl/main:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardDescription className="text-xs font-bold tracking-wide">TÉCNICO · RESULTADO</CardDescription>
                    <CardTitle>Qualidade da execução por evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[260px]">
                      <ResponsiveBar
                        data={resultadoData}
                        keys={chartKeys}
                        indexBy="label"
                        groupMode="grouped"
                        margin={barMargin(selectedEvents.length)}
                        padding={0.25}
                        innerPadding={2}
                        colors={{ scheme: 'tableau10' }}
                        theme={THEME}
                        axisBottom={{ tickRotation: -15, tickSize: 0, tickPadding: 6 }}
                        axisLeft={{ tickSize: 0, tickPadding: 8 }}
                        enableLabel={false}
                        borderRadius={2}
                        legends={barLegends(selectedEvents.length)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardDescription className="text-xs font-bold tracking-wide">TÉCNICO · COMPETÊNCIA</CardDescription>
                    <CardTitle>Movimentos por competência e evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[260px]">
                      <ResponsiveBar
                        data={competenciaData}
                        keys={chartKeys}
                        indexBy="label"
                        groupMode="grouped"
                        margin={barMargin(selectedEvents.length)}
                        padding={0.25}
                        innerPadding={2}
                        colors={{ scheme: 'tableau10' }}
                        theme={THEME}
                        axisBottom={{ tickRotation: -15, tickSize: 0, tickPadding: 6 }}
                        axisLeft={{ tickSize: 0, tickPadding: 8 }}
                        enableLabel={false}
                        borderRadius={2}
                        legends={barLegends(selectedEvents.length)}
                      />
                    </div>
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
                  const compComplete = compRows.filter((r) => r.resultado === 'Completo').length
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
                          <p className="mb-0.5 text-xs font-bold tracking-wide text-muted-foreground">TÉCNICO · MOTOR</p>
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
                            <p className="text-xs font-bold tracking-wide text-muted-foreground">MOVIMENTOS</p>
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
                          <div className="flex flex-wrap gap-1.5">
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
                        <div className="grid grid-cols-1 gap-3.5 @2xl/main:grid-cols-2">
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
                                      title={isAvExpanded ? 'Recolher' : 'Expandir'}
                                    >
                                      {isAvExpanded ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
                                    </Button>
                                  </CardAction>
                                </CardHeader>
                                <CardContent>
                                  <div className={isAvExpanded ? 'h-[420px]' : 'h-[320px]'}>
                                    <ResponsiveBar
                                      data={data}
                                      keys={resultados}
                                      indexBy="label"
                                      margin={{ top: 28, right: 60, bottom: 60, left: 44 }}
                                      padding={0.35}
                                      colors={{ scheme: 'tableau10' }}
                                      theme={THEME}
                                      axisBottom={{ tickRotation: -25, tickSize: 0, tickPadding: 6 }}
                                      axisLeft={{ tickSize: 0, tickPadding: 8 }}
                                      enableLabel={true}
                                      label={(d) => (Number(d.value) > 0 ? String(d.value) : '')}
                                      labelSkipHeight={14}
                                      labelTextColor={{ from: 'color', modifiers: [['darker', 2.5]] }}
                                      borderRadius={2}
                                      layers={['grid', 'axes', 'bars', StackTotals, AverageLine, 'markers', 'legends']}
                                      legends={[{
                                        dataFrom: 'keys',
                                        anchor: 'bottom',
                                        direction: 'row',
                                        translateY: 56,
                                        itemWidth: 120,
                                        itemHeight: 14,
                                        symbolSize: 10,
                                        symbolShape: 'circle',
                                      }]}
                                    />
                                  </div>
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
                <p className="mb-1 text-xs font-bold tracking-wide text-muted-foreground">PERFIL DO ATLETA</p>
                <h2 className="font-heading text-xl font-semibold text-foreground">Dados socioesportivos</h2>
              </div>

              <div className="mb-3.5 grid grid-cols-2 gap-3.5 @xl/main:grid-cols-4">
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
                          <p className="mb-0.5 text-xs font-bold tracking-wide text-muted-foreground">{eyebrow}</p>
                          <h3 className="font-heading text-sm font-medium text-foreground">{label}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                          <span>{profileFiltered.length} registros</span>
                          {isOpen ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="px-5 pb-5">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">{label} por competição</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[320px]">
                              <ResponsiveBar
                                data={data}
                                keys={chartKeys}
                                indexBy="label"
                                groupMode="grouped"
                                margin={{ top: 28, right: 60, bottom: 60, left: 44 }}
                                padding={0.3}
                                innerPadding={3}
                                colors={{ scheme: 'tableau10' }}
                                theme={THEME}
                                axisBottom={{ tickRotation: -20, tickSize: 0, tickPadding: 6 }}
                                axisLeft={{ tickSize: 0, tickPadding: 8 }}
                                enableLabel={true}
                                label={(d) => (Number(d.value) > 0 ? String(d.value) : '')}
                                labelSkipHeight={14}
                                labelTextColor={{ from: 'color', modifiers: [['darker', 2.5]] }}
                                borderRadius={2}
                                layers={['grid', 'axes', 'bars', AverageLine, 'markers', 'legends']}
                                legends={barLegends(selectedEvents.length)}
                              />
                            </div>
                          </CardContent>
                        </Card>
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
