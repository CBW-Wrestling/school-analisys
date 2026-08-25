import { BarRow } from '../components/BarRow'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { PageIntro } from '../components/PageIntro'
import { useApiData } from '../lib/api'
import type { PhysicalSummary } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function PhysicalPage() {
  const { data: summary, loading } = useApiData<PhysicalSummary>('/api/dashboard/physical/summary')

  const fmt = (v: number | null | undefined) => v != null ? `${v} cm` : '—'

  return (
    <PageHeader active="physical">
      <PageIntro eyebrow="AVALIAÇÃO FÍSICA" title="Indicadores para orientar o desenvolvimento." text="Medições antropométricas e de força registradas nas avaliações de atletas." />
      <div className="@container/main">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-3.5 px-7 pb-3.5 @xl/main:grid-cols-4">
          <Metric label="Avaliações válidas" value={loading ? '—' : String(summary?.totalAssessments ?? 0)} />
          <Metric label="Estatura média" value={loading ? '—' : fmt(summary?.averageHeight)} />
          <Metric label="Envergadura média" value={loading ? '—' : fmt(summary?.averageArmSpan)} />
          <Metric label="Pensão direita média" value={loading ? '—' : String(summary?.averageHandGripRight ?? '—')} />
        </div>
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-3.5 px-7 pb-14 @xl/main:grid-cols-2">
          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-bold tracking-wide">DISTRIBUIÇÃO</CardDescription>
              <CardTitle>Avaliações por estado</CardTitle>
            </CardHeader>
            <CardContent>
              {(summary?.byState ?? []).slice(0, 7).map(({ code, label, count }) => (
                <BarRow key={code} label={label} value={count} total={summary!.totalAssessments} />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-bold tracking-wide">ESTILOS</CardDescription>
              <CardTitle>Registros por modalidade</CardTitle>
            </CardHeader>
            <CardContent>
              {(summary?.byStyle ?? []).map(({ code, label, count }) => (
                <BarRow key={code} label={label} value={count} total={summary!.totalAssessments} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageHeader>
  )
}

