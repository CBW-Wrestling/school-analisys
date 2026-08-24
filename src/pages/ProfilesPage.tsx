import { BarRow } from '../components/BarRow'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { PageIntro } from '../components/PageIntro'
import { useApiData } from '../lib/api'
import type { ProfileSummary } from '../types'

export function ProfilesPage() {
  const { data: summary, loading } = useApiData<ProfileSummary>('/api/dashboard/profiles/summary')

  return (
    <main className="analysis-page">
      <PageHeader active="profiles" />
      <PageIntro eyebrow="PERFIL DE ATLETAS" title="A base que constrói o atleta." text="Contexto de formação, tempo de prática e hábitos esportivos registrados nos eventos escolares." />
      <section className="analysis-content">
        <div className="result-kpis">
          <Metric label="Perfis coletados" value={loading ? '—' : String(summary?.totalProfiles ?? 0)} />
          <Metric label="Locais de prática" value={loading ? '—' : String(summary?.practiceLocationsCount ?? 0)} />
          <Metric label="Praticam outra modalidade" value={loading ? '—' : String(summary?.practicesOtherSport ?? 0)} />
          <Metric label="Estados na base" value={loading ? '—' : String(summary?.statesCount ?? 0)} />
        </div>
        <div className="analysis-grid">
          <section className="analysis-panel">
            <p className="eyebrow">EXPERIÊNCIA</p>
            <h3>Tempo de prática</h3>
            {(summary?.byPracticeTime ?? []).map(({ code, label, count }) => (
              <BarRow key={code} label={label} value={count} total={summary!.totalProfiles} />
            ))}
          </section>
          <section className="analysis-panel">
            <p className="eyebrow">FORMAÇÃO</p>
            <h3>Onde treinam</h3>
            {(summary?.byPracticeLocation ?? []).map(({ code, label, count }) => (
              <BarRow key={code} label={label} value={count} total={summary!.totalProfiles} />
            ))}
          </section>
          <section className="analysis-panel">
            <p className="eyebrow">ROTINA</p>
            <h3>Frequência semanal de treino</h3>
            {(summary?.byWeeklyFrequency ?? []).map(({ code, label, count }) => (
              <BarRow key={code} label={label} value={count} total={summary!.totalProfiles} />
            ))}
          </section>
        </div>
      </section>
    </main>
  )
}


          <section className="analysis-panel">
            <p className="eyebrow">FORMAÇÃO</p>
            <h3>Onde treinam</h3>
            {Object.entries(
              rows.reduce<Record<string, number>>((all, row) => {
                const key = row.local_pratica || 'Não informado'
                all[key] = (all[key] || 0) + 1
                return all
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .map(([label, count]) => (
                <BarRow key={label} label={label} value={count} total={rows.length} />
              ))}
          </section>
          <section className="analysis-panel">
            <p className="eyebrow">ROTINA</p>
            <h3>Frequência semanal de treino</h3>
            {Object.entries(
              rows.reduce<Record<string, number>>((all, row) => {
                const key = row.frequencia_semanal || 'Não informado'
                all[key] = (all[key] || 0) + 1
                return all
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .map(([label, count]) => (
                <BarRow key={label} label={label} value={count} total={rows.length} />
              ))}
          </section>
        </div>
      </section>
    </main>
  )
}
