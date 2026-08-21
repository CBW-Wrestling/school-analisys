import { ChevronDown, Medal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { useSupabaseRows } from '../lib/data'
import { AthleteDetailPage } from './AthleteDetailPage'
import type { CompetitionRow, ResultRow } from '../types'

export function ResultsPage() {
  const [competitionId, setCompetitionId] = useState<string>('')
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)

  const {
    rows: competitions,
    loading: competitionsLoading,
    error: competitionsError,
  } = useSupabaseRows<CompetitionRow>('competitions')

  useEffect(() => {
    if (!competitionId && competitions.length > 0) {
      setCompetitionId(competitions[0].id)
    }
  }, [competitions, competitionId])

  const {
    rows,
    loading: resultsLoading,
    error: resultsError,
  } = useSupabaseRows<ResultRow>(
    'vw_competition_results',
    competitionId ? { competition_id: competitionId } : undefined
  )

  const selectedCompetition = useMemo(
    () => competitions.find((c) => c.id === competitionId),
    [competitions, competitionId]
  )

  if (selectedEntry) {
    return (
      <main className="results-page">
        <PageHeader active="results" />
        <AthleteDetailPage
          entryId={selectedEntry}
          onBack={() => setSelectedEntry(null)}
        />
      </main>
    )
  }

  const fights = rows.reduce((total, row) => total + Number(row.countFights || 0), 0)
  const statesCount = new Set(rows.map((row) => row.teamAlternateName)).size
  const categories = new Set(rows.map((row) => row.weightCategoryShortName)).size
  const loading = competitionsLoading || resultsLoading

  return (
    <main className="results-page">
      <PageHeader active="results" />

      <section className="results-hero">
        <p className="eyebrow">RESULTADOS OFICIAIS</p>
        <h1>
          Classificações que contam
          <br />
          <em>a história no tapete.</em>
        </h1>
        <p>
          Dados de desempenho e pódio consolidados a partir
          dos resultados dos Jogos Escolares.
        </p>
      </section>

      <section className="results-content">
        <div className="results-toolbar">
          <div>
            <p className="eyebrow">RANKING POR EVENTO</p>
            <h2>Atletas classificados</h2>
          </div>

          <label className="event-select">
            <span>Competição</span>

            <select
              value={competitionId}
              onChange={(e) => setCompetitionId(e.target.value)}
              disabled={competitionsLoading}
            >
              {competitions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.name} · {competition.year}
                </option>
              ))}
            </select>

            <ChevronDown size={15} aria-hidden="true" />
          </label>
        </div>

        {competitionsError && (
          <div className="results-error">Não foi possível carregar as competições.</div>
        )}
        {resultsError && (
          <div className="results-error">Não foi possível carregar os resultados.</div>
        )}

        <div className="result-kpis">
          <Metric label="Atletas classificados" value={loading ? '—' : String(rows.length)} />
          <Metric label="Lutas registradas" value={loading ? '—' : String(fights)} />
          <Metric label="Categorias de peso" value={loading ? '—' : String(categories)} />
          <Metric label="Estados representados" value={loading ? '—' : String(statesCount)} />
        </div>

        <div className="results-layout">
          <section className="results-table">
            <div className="table-title">
              <div>
                <h3>Classificação geral</h3>
                <p>
                  {selectedCompetition
                    ? 'Ordenada por posição na categoria'
                    : 'Selecione uma competição'}
                </p>
              </div>
              {selectedCompetition && <span>{selectedCompetition.code}</span>}
            </div>

            <div className="table-scroll">
              <table>
                <caption className="sr-only">
                  Classificação dos atletas do evento selecionado
                </caption>
                <thead>
                  <tr>
                    <th>Pos.</th>
                    <th>Atleta</th>
                    <th>UF</th>
                    <th>Categoria</th>
                    <th>V-D</th>
                    <th>Pontos técnicos</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsLoading ? (
                    <tr><td colSpan={7}>Carregando resultados...</td></tr>
                  ) : rows.length === 0 ? (
                    <tr><td colSpan={7}>Nenhum resultado encontrado.</td></tr>
                  ) : (
                    rows.slice(0, 18).map((row) => (
                      <tr
                        key={row.entry_id}
                        className="result-row--clickable"
                        onClick={() => setSelectedEntry(row.entry_id)}
                        title="Ver detalhe do atleta"
                      >
                        <td className="rank">{row.rank}</td>
                        <td><strong>{row.fullName}</strong></td>
                        <td><span className="uf">{row.teamAlternateName}</span></td>
                        <td>{row.weightCategoryShortName}</td>
                        <td>{row.wins}-{row.losses}</td>
                        <td className="technical">{row.technicalPointsFor}</td>
                        <td className="positive">
                          {row.technicalPointsDiff >= 0
                            ? `+${row.technicalPointsDiff}`
                            : row.technicalPointsDiff}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="podium">
            <p className="eyebrow">DESTAQUES</p>
            <h3>Ouro por categoria</h3>

            {resultsLoading ? (
              <p>Carregando...</p>
            ) : rows.filter((row) => row.rank === 1).length === 0 ? (
              <p>Nenhum campeão encontrado.</p>
            ) : (
              rows
                .filter((row) => row.rank === 1)
                .slice(0, 4)
                .map((row, index) => (
                  <div
                    className="podium-row"
                    key={`${row.fullName}-${row.weightCategoryShortName}`}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>{row.fullName}</strong>
                      <small>
                        {row.teamAlternateName}
                        {' · '}
                        {row.weightCategoryShortName}
                      </small>
                    </div>
                    <Medal size={17} aria-hidden="true" />
                  </div>
                ))
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}