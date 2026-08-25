import { BarRow } from '../components/BarRow'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { PageIntro } from '../components/PageIntro'
import { useApiData } from '../lib/api'
import type { PhysicalSummary } from '../types'

export function PhysicalPage() {
  const { data: summary, loading } = useApiData<PhysicalSummary>('/api/dashboard/physical/summary')

  const fmt = (v: number | null | undefined) => v != null ? `${v} cm` : '—'

  return (
    <PageHeader active="physical">
      <PageIntro eyebrow="AVALIAÇÃO FÍSICA" title="Indicadores para orientar o desenvolvimento." text="Medições antropométricas e de força registradas nas avaliações de atletas." />
      <section className="analysis-content">
        <div className="result-kpis">
          <Metric label="Avaliações válidas" value={loading ? '—' : String(summary?.totalAssessments ?? 0)} />
          <Metric label="Estatura média" value={loading ? '—' : fmt(summary?.averageHeight)} />
          <Metric label="Envergadura média" value={loading ? '—' : fmt(summary?.averageArmSpan)} />
          <Metric label="Pensão direita média" value={loading ? '—' : String(summary?.averageHandGripRight ?? '—')} />
        </div>
        <div className="analysis-grid">
          <section className="analysis-panel">
            <p className="eyebrow">DISTRIBUIÇÃO</p>
            <h3>Avaliações por estado</h3>
            {(summary?.byState ?? []).slice(0, 7).map(({ code, label, count }) => (
              <BarRow key={code} label={label} value={count} total={summary!.totalAssessments} />
            ))}
          </section>
          <section className="analysis-panel">
            <p className="eyebrow">ESTILOS</p>
            <h3>Registros por modalidade</h3>
            {(summary?.byStyle ?? []).map(({ code, label, count }) => (
              <BarRow key={code} label={label} value={count} total={summary!.totalAssessments} />
            ))}
          </section>
        </div>
      </section>
    </PageHeader>
  )
}

