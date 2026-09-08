import { PageHeader } from '../components/PageHeader'
import { CalendarPanel } from '../components/productivity-dashboard/CalendarPanel'
import { FocusCard } from '../components/productivity-dashboard/FocusCard'
import { ProjectsSection } from '../components/productivity-dashboard/ProjectsSection'
import { QuickActions } from '../components/productivity-dashboard/QuickActions'
import { QuoteCard } from '../components/productivity-dashboard/QuoteCard'
import { RecentNotesCard } from '../components/productivity-dashboard/RecentNotesCard'
import { SummaryCards } from '../components/productivity-dashboard/SummaryCards'
import { TasksSection } from '../components/productivity-dashboard/TasksSection'
import { WeeklySummaryCard } from '../components/productivity-dashboard/WeeklySummaryCard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function ProductivityDashboardPage() {
  return (
    <PageHeader active="productivity">
      <div className="@container/main flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Alert>
          <AlertTitle>Visão de demonstração</AlertTitle>
          <AlertDescription>Os indicadores e registros desta tela são exemplos de interface e não representam dados da plataforma.</AlertDescription>
        </Alert>
        <div className="grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-9">
            <div className="flex flex-col gap-6">
              <SummaryCards />
              <TasksSection />
              <ProjectsSection />
              <QuickActions />
              <QuoteCard />
            </div>
          </section>

          <section className="flex flex-col gap-6 lg:col-span-3">
            <CalendarPanel />
            <FocusCard />
            <RecentNotesCard />
            <WeeklySummaryCard />
          </section>
        </div>
      </div>
    </PageHeader>
  )
}
