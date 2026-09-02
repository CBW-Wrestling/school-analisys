import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '../components/PageHeader'
import { AnalyticsKpiStrip } from '../components/analytics-dashboard/AnalyticsKpiStrip'
import { AnalyticsToolbar } from '../components/analytics-dashboard/AnalyticsToolbar'
import { RealtimeVisitors } from '../components/analytics-dashboard/RealtimeVisitors'
import { TopPages } from '../components/analytics-dashboard/TopPages'
import { TopTrafficSources } from '../components/analytics-dashboard/TopTrafficSources'
import { TrafficQuality } from '../components/analytics-dashboard/TrafficQuality'

export function AnalyticsDashboardPage() {
  return (
    <PageHeader active="analytics">
      <div className="@container/main flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Alert>
          <AlertTitle>Visão de demonstração</AlertTitle>
          <AlertDescription>Os indicadores e registros desta tela são exemplos de interface e não representam dados da plataforma.</AlertDescription>
        </Alert>

        <Tabs defaultValue="overview" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList className="gap-1">
              <TabsTrigger value="overview">Visão geral</TabsTrigger>
              <TabsTrigger value="audience">Audiência</TabsTrigger>
              <TabsTrigger value="acquisition">Aquisição</TabsTrigger>
              <TabsTrigger value="engagement">Engajamento</TabsTrigger>
              <TabsTrigger value="conversions">Conversões</TabsTrigger>
            </TabsList>

            <AnalyticsToolbar />
          </div>

          <TabsContent value="overview" className="flex flex-col gap-4">
            <AnalyticsKpiStrip />

            <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
              <div className="xl:col-span-7">
                <TrafficQuality />
              </div>
              <div className="xl:col-span-5">
                <RealtimeVisitors />
              </div>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
              <div className="xl:col-span-7">
                <TopPages />
              </div>
              <div className="xl:col-span-5 xl:col-start-8">
                <TopTrafficSources />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audience">
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
              Visão de audiência em breve.
            </div>
          </TabsContent>

          <TabsContent value="acquisition">
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
              Visão de aquisição em breve.
            </div>
          </TabsContent>

          <TabsContent value="engagement">
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
              Visão de engajamento em breve.
            </div>
          </TabsContent>

          <TabsContent value="conversions">
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
              Visão de conversões em breve.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageHeader>
  )
}
