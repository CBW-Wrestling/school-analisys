import { ResponsiveBar } from '@nivo/bar'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { useApiRows } from '../lib/api'
import type { CompetitionRow, MotorRow, ProfileRow } from '../types'

const SOCIAL_DIMS: { key: keyof ProfileRow; label: string; eyebrow: string }[] = [
  { key: 'tempoPratica',       label: 'Tempo de Prática',       eyebrow: 'EXPERIÊNCIA' },
  { key: 'localPratica',       label: 'Local de Prática',       eyebrow: 'AMBIENTE'   },
  { key: 'flagOutraModalidade', label: 'Pratica Outro Esporte?', eyebrow: 'MULTIESPORTE' },
  { key: 'iniciouNaLuta',      label: 'Começou pela Luta?',     eyebrow: 'ORIGEM'     },
]

const THEME = {
  text: { fontSize: 11, fill: '#5e6f80' },
  axis: {
    ticks: { text: { fill: '#5e6f80', fontSize: 11 } },
    legend: { text: { fill: '#5e6f80', fontSize: 11 } },
  },
  grid: { line: { stroke: '#dce6e4' } },
  tooltip: {
    container: {
      background: '#fff',
      color: '#102f5c',
      fontSize: 12,
      border: '1px solid #dce6e4',
      borderRadius: 4,
      boxShadow: '0 4px 12px rgba(16,47,92,.08)',
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
        <path d={d} stroke="#102f5c" strokeWidth={2} fill="none" strokeDasharray="5 4" strokeLinejoin="round" />
      )}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#fff" stroke="#102f5c" strokeWidth={2} />
      ))}
      <text x={last.x + 10} y={last.y + 4} fontSize={10} fontWeight={700} fill="#102f5c" textAnchor="start">
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
          <text key={i} x={x} y={minY - 5} textAnchor="middle" fontSize={11} fontWeight={800} fill="#102f5c">
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
    () => Array.from(new Set(motorRows.map((r) => r.estilo))).filter(Boolean).sort(),
    [motorRows]
  )
  const allCompetencias = useMemo(
    () => Array.from(new Set(motorRows.map((r) => r.competencia))).filter(Boolean).sort(),
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
    <main className="explorer-page">
      <PageHeader active="explorer" />

      <div className="explorer-layout">
        <aside className="explorer-filters">
          <section className="filter-group">
            <div className="filter-group-header">
              <p className="eyebrow">COMPETIÇÕES</p>
              <div className="filter-actions">
                <button onClick={() => setSelectedEvents(competitions.map((c) => c.code))}>Todas</button>
                <button onClick={() => setSelectedEvents([])}>Limpar</button>
              </div>
            </div>
            {competitions.map((c) => (
              <label key={c.id} className="filter-check">
                <input type="checkbox" checked={selectedEvents.includes(c.code)} onChange={() => toggleEvent(c.code)} />
                <span>{c.name}</span>
                {c.year && <small>{c.year}</small>}
              </label>
            ))}
          </section>

          <section className="filter-group">
            <div className="filter-group-header">
              <p className="eyebrow">ESTILOS</p>
              <div className="filter-actions">
                <button onClick={() => setSelectedStyles(allStyles)}>Todos</button>
                <button onClick={() => setSelectedStyles([])}>Limpar</button>
              </div>
            </div>
            {allStyles.map((style) => (
              <label key={style} className="filter-check">
                <input type="checkbox" checked={selectedStyles.includes(style)} onChange={() => toggleStyle(style)} />
                <span>{style}</span>
              </label>
            ))}
          </section>

          <section className="filter-group">
            <div className="filter-group-header">
              <p className="eyebrow">COMPETÊNCIAS</p>
              <div className="filter-actions">
                <button onClick={() => setSelectedCompetencias(allCompetencias)}>Todas</button>
                <button onClick={() => setSelectedCompetencias([])}>Limpar</button>
              </div>
            </div>
            {allCompetencias.map((comp) => (
              <label key={comp} className="filter-check">
                <input type="checkbox" checked={selectedCompetencias.includes(comp)} onChange={() => toggleCompetencia(comp)} />
                <span>{comp}</span>
              </label>
            ))}
          </section>
        </aside>

        <div className="explorer-content">
          <div className="result-kpis">
            <Metric label="Movimentos avaliados" value={loading ? '—' : String(total)} />
            <Metric label="Execuções completas" value={loading ? '—' : String(complete)} />
            <Metric label="Taxa de domínio" value={loading ? '—' : total ? `${Math.round((complete / total) * 100)}%` : '—'} />
            <Metric label="Eventos selecionados" value={String(selectedEvents.length)} />
          </div>

          {loading ? (
            <p className="explorer-loading">Carregando dados...</p>
          ) : (
            <>
              <div className="explorer-charts">
                <section className="explorer-chart">
                  <p className="eyebrow">TÉCNICO · RESULTADO</p>
                  <h3>Qualidade da execução por evento</h3>
                  <div className="chart-area">
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
                </section>

                <section className="explorer-chart">
                  <p className="eyebrow">TÉCNICO · COMPETÊNCIA</p>
                  <h3>Movimentos por competência e evento</h3>
                  <div className="chart-area">
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
                </section>
              </div>

              {/* Drill-down por competência */}
              {allCompetencias
                .filter((comp) => selectedCompetencias.includes(comp))
                .map((comp) => {
                  const allAvs = avaliacoesByComp[comp] ?? []
                  // filter preserves allAvs order regardless of toggle order
                  const rawSel = selectedAvaliacoes[comp] ?? allAvs
                  const selAvs = allAvs.filter((av) => rawSel.includes(av))
                  const compRows = filtered.filter((r) => r.Competência === comp)
                  const compComplete = compRows.filter((r) => r.Resultado === 'Completo').length
                  const isExpanded = expandedCompetencia === comp

                  // grouped bar: X = selAvs, keys = competitions (chartKeys)
                  const resultados = Array.from(
                    new Set(compRows.map((r) => r.Resultado || 'Sem registro'))
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
                    <section key={comp} className="competencia-card">
                      <button
                        className="competencia-header"
                        onClick={() => setExpandedCompetencia(isExpanded ? null : comp)}
                      >
                        <div className="competencia-info">
                          <p className="eyebrow">TÉCNICO · MOTOR</p>
                          <h3>{comp}</h3>
                        </div>
                        <div className="competencia-stats">
                          <span>{compRows.length} registros</span>
                          <span>
                            {compRows.length
                              ? `${Math.round((compComplete / compRows.length) * 100)}% domínio`
                              : '—'}
                          </span>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="competencia-detail">
                          {/* movement filter */}
                          <div className="avaliacao-filter">
                            <div className="avaliacao-filter-header">
                              <p className="eyebrow">MOVIMENTOS</p>
                              <div className="filter-actions">
                                <button onClick={() => setSelectedAvaliacoes((p) => ({ ...p, [comp]: allAvs }))}>
                                  Todos
                                </button>
                                <button onClick={() => setSelectedAvaliacoes((p) => ({ ...p, [comp]: [] }))}>
                                  Limpar
                                </button>
                              </div>
                            </div>
                            <div className="avaliacao-checks">
                              {allAvs.map((av) => (
                                <label key={av} className="filter-check filter-check--pill">
                                  <input
                                    type="checkbox"
                                    checked={selAvs.includes(av)}
                                    onChange={() => toggleAvaliacao(comp, av)}
                                  />
                                  <span>{av}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* per-movement stacked charts: X = competitions */}
                          <div className="comp-breakdowns">
                            {perAvCharts.map(({ av, data }) => {
                              const isAvExpanded = expandedAvs[comp] === av
                              return (
                                <section
                                  key={av}
                                  className={`explorer-chart${isAvExpanded ? ' explorer-chart--fullwidth' : ''}`}
                                >
                                  <div className="chart-title-row">
                                    <h3>{av}</h3>
                                    <button
                                      className="expand-av-btn"
                                      onClick={() => toggleExpandAv(comp, av)}
                                      title={isAvExpanded ? 'Recolher' : 'Expandir'}
                                    >
                                      {isAvExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>
                                  </div>
                                  <div className={`chart-area${isAvExpanded ? ' chart-area--expanded' : ' chart-area--tall'}`}>
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
                                </section>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </section>
                  )
                })}

              {/* ── PERFIL SOCIAL ─────────────────────────── */}
              <div className="explorer-section-divider">
                <p className="eyebrow">PERFIL DO ATLETA</p>
                <h2>Dados socioesportivos</h2>
              </div>

              <div className="result-kpis">
                <Metric label="Atletas com perfil" value={profileLoading ? '—' : String(profileFiltered.length)} />
                <Metric
                  label="Fazem outro esporte"
                  value={profileLoading ? '—' : (() => {
                    const sim = profileFiltered.filter((r) => r.flag_outra_modalidade === 'sim').length
                    return profileFiltered.length ? `${Math.round((sim / profileFiltered.length) * 100)}%` : '—'
                  })()}
                />
                <Metric
                  label="Iniciaram pela luta"
                  value={profileLoading ? '—' : (() => {
                    const sim = profileFiltered.filter((r) => r.iniciou_na_luta === 'sim').length
                    return profileFiltered.length ? `${Math.round((sim / profileFiltered.length) * 100)}%` : '—'
                  })()}
                />
                <Metric label="Eventos" value={String(selectedEvents.length)} />
              </div>

              {profileLoading ? (
                <p className="explorer-loading">Carregando perfis...</p>
              ) : (
                SOCIAL_DIMS.map(({ key, label, eyebrow }) => {
                  const isOpen = expandedSocial === key
                  const data = isOpen ? socialChartData(key) : []
                  return (
                    <section key={key} className="competencia-card">
                      <button
                        className="competencia-header"
                        onClick={() => setExpandedSocial(isOpen ? null : key)}
                      >
                        <div className="competencia-info">
                          <p className="eyebrow">{eyebrow}</p>
                          <h3>{label}</h3>
                        </div>
                        <div className="competencia-stats">
                          <span>{profileFiltered.length} registros</span>
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="competencia-detail">
                          <section className="explorer-chart">
                            <h3>{label} por competição</h3>
                            <div className="chart-area chart-area--tall">
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
                          </section>
                        </div>
                      )}
                    </section>
                  )
                })
              )}

            </>
          )}
        </div>
      </div>
    </main>
  )
}
