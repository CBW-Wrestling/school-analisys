import { BarRow } from '../components/BarRow'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { PageIntro } from '../components/PageIntro'
import { useSupabaseRows } from '../lib/data'
import type { ProfileRow } from '../types'

export function ProfilesPage() {
  const { rows } = useSupabaseRows<ProfileRow>('vw_profile_dashboard')
  const locations = new Set(rows.map((row) => row.local_pratica).filter(Boolean)).size
  const otherSports = rows.filter((row) => row.flag_outra_modalidade.toLowerCase() === 'sim').length
  const practices = Object.entries(
    rows.reduce<Record<string, number>>((all, row) => {
      const key = row.tempo_pratica || 'Não informado'
      all[key] = (all[key] || 0) + 1
      return all
    }, {})
  ).sort((a, b) => b[1] - a[1])

  return (
    <main className="analysis-page">
      <PageHeader active="profiles" />
      <PageIntro eyebrow="PERFIL DE ATLETAS" title="A base que constrói o atleta." text="Contexto de formação, tempo de prática e hábitos esportivos registrados nos eventos escolares." />
      <section className="analysis-content">
        <div className="result-kpis">
          <Metric label="Perfis coletados" value={String(rows.length)} />
          <Metric label="Locais de prática" value={String(locations)} />
          <Metric label="Praticam outra modalidade" value={String(otherSports)} />
          <Metric label="Estados na base" value={String(new Set(rows.map((row) => row.Estado)).size)} />
        </div>
        <div className="analysis-grid">
          <section className="analysis-panel">
            <p className="eyebrow">EXPERIÊNCIA</p>
            <h3>Tempo de prática</h3>
            {practices.slice(0, 5).map(([label, count]) => (
              <BarRow key={label} label={label} value={count} total={rows.length} />
            ))}
          </section>
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
