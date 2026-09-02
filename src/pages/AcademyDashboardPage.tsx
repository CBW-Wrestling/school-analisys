import { PageHeader } from '../components/PageHeader'
import { KpiCards } from '../components/academy-dashboard/KpiCards'
import { ClassSchedule } from '../components/academy-dashboard/ClassSchedule'
import { AssignmentStatus } from '../components/academy-dashboard/AssignmentStatus'
import { PerformanceHighlights } from '../components/academy-dashboard/PerformanceHighlights'
import { UpcomingEvents } from '../components/academy-dashboard/UpcomingEvents'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function AcademyDashboardPage() {
  return (
    <PageHeader active="academy">
      <div className="@container/main flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Alert>
          <AlertTitle>Visão de demonstração</AlertTitle>
          <AlertDescription>Os indicadores e registros desta tela são exemplos de interface e não representam dados da plataforma.</AlertDescription>
        </Alert>

        <KpiCards />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <ClassSchedule />
          </div>
          <div className="xl:col-span-7">
            <AssignmentStatus />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <PerformanceHighlights />
          </div>
          <div className="xl:col-span-4">
            <UpcomingEvents />
          </div>
        </div>
      </div>
    </PageHeader>
  )
}
