import { PageHeader } from '../components/PageHeader'
import { MetricCards } from '../components/default-dashboard/MetricCards'
import { PerformanceOverview } from '../components/default-dashboard/PerformanceOverview'
import { SubscriberOverview } from '../components/default-dashboard/SubscriberOverview'

// Réplica da tela "dashboard/default" do next-shadcn-admin-dashboard (dados mockados, layout idêntico).
export function DefaultPage() {
  return (
    <PageHeader active="default">
      <div className="@container/main flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <MetricCards />
        <PerformanceOverview />
        <SubscriberOverview />
      </div>
    </PageHeader>
  )
}
