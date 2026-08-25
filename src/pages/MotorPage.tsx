import { BarRow } from '../components/BarRow'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { PageIntro } from '../components/PageIntro'
import { useApiData } from '../lib/api'
import type { MotorSummary } from '../types'

export function MotorPage() {
  const { data: summary, loading } = useApiData<MotorSummary>('/api/dashboard/motor/summary')

  return (
    <PageHeader active="motor">
      <PageIntro eyebrow="AVALIAÇÃO TÉCNICA" title="O movimento como base da evolução." text="Registros de movimentos fundamentais organizados por competência técnica." />
      <section className="analysis-content">
        <div className="result-kpis">
          <Metric label="Movimentos avaliados" value={loading ? '—' : String(summary?.totalMovements ?? 0)} />
          <Metric label="Execuções completas" value={loading ? '—' : String(summary?.completeCount ?? 0)} />
          <Metric label="Taxa de domínio" value={loading ? '—' : `${summary?.dominanceRate ?? 0}%`} />
          <Metric label="Competências" value={loading ? '—' : String(summary?.competenciesCount ?? 0)} />
        </div>
        <div className="analysis-grid">
          <section className="analysis-panel">
            <p className="eyebrow">RESULTADO</p>
            <h3>Qualidade da execução</h3>
            {(summary?.byResult ?? []).map(({ code, label, count }) => (
              <BarRow key={code} label={label} value={count} total={summary!.totalMovements} />
            ))}
          </section>
          <section className="analysis-panel">
            <p className="eyebrow">COBERTURA</p>
            <h3>Movimentos por competência</h3>
            {(summary?.byCompetency ?? []).map(({ code, label, count }) => (
              <BarRow key={code} label={label} value={count} total={summary!.totalMovements} />
            ))}
          </section>
        </div>
      </section>
    </PageHeader>
  )
}

