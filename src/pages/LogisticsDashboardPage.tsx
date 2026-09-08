import { PageHeader } from '../components/PageHeader'
import { Logistics } from '../components/logistics-dashboard/Logistics'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function LogisticsDashboardPage() {
  return (
    <PageHeader active="logistics">
      <div className="@container/main flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Alert>
          <AlertTitle>Visão de demonstração</AlertTitle>
          <AlertDescription>Os indicadores e registros desta tela são exemplos de interface e não representam dados da plataforma.</AlertDescription>
        </Alert>
        <Logistics />
      </div>
    </PageHeader>
  )
}
