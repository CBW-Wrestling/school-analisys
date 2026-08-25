import { BarRow } from '../components/BarRow'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { PageIntro } from '../components/PageIntro'
import { useApiData } from '../lib/api'
import type { MotorSummary } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function MotorPage() {
  const { data: summary, loading } = useApiData<MotorSummary>('/api/dashboard/motor/summary')

  return (
    <PageHeader active="motor">
      <PageIntro eyebrow="AVALIAÇÃO TÉCNICA" title="O movimento como base da evolução." text="Registros de movimentos fundamentais organizados por competência técnica." />
      <div className="@container/main">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-3.5 px-7 pb-3.5 @xl/main:grid-cols-4">
          <Metric label="Movimentos avaliados" value={loading ? '—' : String(summary?.totalMovements ?? 0)} />
          <Metric label="Execuções completas" value={loading ? '—' : String(summary?.completeCount ?? 0)} />
          <Metric label="Taxa de domínio" value={loading ? '—' : `${summary?.dominanceRate ?? 0}%`} />
          <Metric label="Competências" value={loading ? '—' : String(summary?.competenciesCount ?? 0)} />
        </div>
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-3.5 px-7 pb-14 @xl/main:grid-cols-2">
          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-bold tracking-wide">RESULTADO</CardDescription>
              <CardTitle>Qualidade da execução</CardTitle>
            </CardHeader>
            <CardContent>
              {(summary?.byResult ?? []).map(({ code, label, count }) => (
                <BarRow key={code} label={label} value={count} total={summary!.totalMovements} />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-bold tracking-wide">COBERTURA</CardDescription>
              <CardTitle>Movimentos por competência</CardTitle>
            </CardHeader>
            <CardContent>
              {(summary?.byCompetency ?? []).map(({ code, label, count }) => (
                <BarRow key={code} label={label} value={count} total={summary!.totalMovements} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageHeader>
  )
}

