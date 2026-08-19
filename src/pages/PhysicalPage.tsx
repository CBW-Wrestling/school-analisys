import { BarRow } from '../components/BarRow'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { PageIntro } from '../components/PageIntro'
import { useSupabaseRows } from '../lib/data'
import type { PhysicalRow } from '../types'

export function PhysicalPage() {
  const { rows } = useSupabaseRows<PhysicalRow>('vw_physical_dashboard')

  const numericAverage = (field: keyof PhysicalRow) => {
    const values = rows.map((row) => Number(String(row[field]).replace(',', '.'))).filter((v) => v > 0)
    return values.length ? (values.reduce((total, v) => total + v, 0) / values.length).toFixed(1) : '—'
  }

  const statesRanking = Object.entries(
    rows.reduce<Record<string, number>>((all, row) => {
      all[row.Estado] = (all[row.Estado] || 0) + 1
      return all
    }, {})
  ).sort((a, b) => b[1] - a[1])

  return (
    <main className="analysis-page">
      <PageHeader active="physical" />
      <PageIntro eyebrow="AVALIAÇÃO FÍSICA" title="Indicadores para orientar o desenvolvimento." text="Medições antropométricas e de força registradas em 302 avaliações de atletas." />
      <section className="analysis-content">
        <div className="result-kpis">
          <Metric label="Avaliações válidas" value={String(rows.length)} />
          <Metric label="Estatura média" value={`${numericAverage('Estatura (cm)')} cm`} />
          <Metric label="Envergadura média" value={`${numericAverage('Envergadura (cm)')} cm`} />
          <Metric label="Prensão direita média" value={numericAverage('Prensão manual (D)')} />
        </div>
        <div className="analysis-grid">
          <section className="analysis-panel">
            <p className="eyebrow">DISTRIBUIÇÃO</p>
            <h3>Avaliações por estado</h3>
            {statesRanking.slice(0, 7).map(([label, count]) => (
              <BarRow key={label} label={label} value={count} total={rows.length} />
            ))}
          </section>
          <section className="analysis-panel">
            <p className="eyebrow">ESTILOS</p>
            <h3>Registros por modalidade</h3>
            {Object.entries(
              rows.reduce<Record<string, number>>((all, row) => {
                all[row.Estilo] = (all[row.Estilo] || 0) + 1
                return all
              }, {})
            ).map(([label, count]) => (
              <BarRow key={label} label={label} value={count} total={rows.length} />
            ))}
          </section>
        </div>
      </section>
    </main>
  )
}
