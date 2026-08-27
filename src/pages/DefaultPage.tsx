import { PageHeader } from '../components/PageHeader'
import { MetricCards } from '../components/default-dashboard/MetricCards'
import { PerformanceOverview } from '../components/default-dashboard/PerformanceOverview'
import { SubscriberOverview } from '../components/default-dashboard/SubscriberOverview'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function DefaultPage() {
  return (
    <PageHeader active="default">
      <div className="@container/main flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Alert>
          <AlertTitle>Visão de demonstração</AlertTitle>
          <AlertDescription>Os indicadores e registros desta tela são exemplos de interface e não representam dados da plataforma.</AlertDescription>
        </Alert>
        <MetricCards />
        <PerformanceOverview />
        <SubscriberOverview />
      </div>
    </PageHeader>
  )
}
