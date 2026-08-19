import { BarRow } from '../components/BarRow'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { PageIntro } from '../components/PageIntro'
import { useSupabaseRows } from '../lib/data'
import type { MotorRow } from '../types'

export function MotorPage() {
  const { rows } = useSupabaseRows<MotorRow>('vw_motor_dashboard')
  const results = Object.entries(
    rows.reduce<Record<string, number>>((all, row) => {
      const key = row.Resultado || 'Sem registro'
      all[key] = (all[key] || 0) + 1
      return all
    }, {})
  )
  const competency = Object.entries(
    rows.reduce<Record<string, number>>((all, row) => {
      all[row.Competência] = (all[row.Competência] || 0) + 1
      return all
    }, {})
  )
  const complete = rows.filter((row) => row.Resultado === 'Completo').length

  return (
    <main className="analysis-page">
      <PageHeader active="motor" />
      <PageIntro eyebrow="AVALIAÇÃO TÉCNICA" title="O movimento como base da evolução." text="5.424 registros de movimentos fundamentais organizados por competência técnica." />
      <section className="analysis-content">
        <div className="result-kpis">
          <Metric label="Movimentos avaliados" value={String(rows.length)} />
          <Metric label="Execuções completas" value={String(complete)} />
          <Metric label="Taxa de domínio" value={rows.length ? `${Math.round((complete / rows.length) * 100)}%` : '—'} />
          <Metric label="Competências" value={String(competency.length)} />
        </div>
        <div className="analysis-grid">
          <section className="analysis-panel">
            <p className="eyebrow">RESULTADO</p>
            <h3>Qualidade da execução</h3>
            {results.map(([label, count]) => (
              <BarRow key={label} label={label} value={count} total={rows.length} />
            ))}
          </section>
          <section className="analysis-panel">
            <p className="eyebrow">COBERTURA</p>
            <h3>Movimentos por competência</h3>
            {competency.map(([label, count]) => (
              <BarRow key={label} label={label} value={count} total={rows.length} />
            ))}
          </section>
        </div>
      </section>
    </main>
  )
}
