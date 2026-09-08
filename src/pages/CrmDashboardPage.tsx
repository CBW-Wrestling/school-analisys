import { PageHeader } from '../components/PageHeader'
import { KpiCards } from '../components/crm-dashboard/KpiCards'
import { PipelineActivity } from '../components/crm-dashboard/PipelineActivity'
import { TaskReminders } from '../components/crm-dashboard/TaskReminders'
import { OpportunitiesSection } from '../components/crm-dashboard/OpportunitiesSection'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function CrmDashboardPage() {
  return (
    <PageHeader active="crm">
      <div className="@container/main flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Alert>
          <AlertTitle>Visão de demonstração</AlertTitle>
          <AlertDescription>Os indicadores e registros desta tela são exemplos de interface e não representam dados da plataforma.</AlertDescription>
        </Alert>
        <KpiCards />
        <PipelineActivity />
        <TaskReminders />
        <OpportunitiesSection />
      </div>
    </PageHeader>
  )
}
