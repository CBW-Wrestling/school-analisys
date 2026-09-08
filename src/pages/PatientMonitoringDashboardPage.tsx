import { PageHeader } from '../components/PageHeader'
import { PatientMonitoring } from '../components/patient-monitoring-dashboard/PatientMonitoring'
import { patients } from '../components/patient-monitoring-dashboard/data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function PatientMonitoringDashboardPage() {
  return (
    <PageHeader active="patient-monitoring">
      <div className="@container/main flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Alert>
          <AlertTitle>Visão de demonstração</AlertTitle>
          <AlertDescription>Os indicadores e registros desta tela são exemplos de interface e não representam dados da plataforma.</AlertDescription>
        </Alert>
        <PatientMonitoring patients={patients} />
      </div>
    </PageHeader>
  )
}
