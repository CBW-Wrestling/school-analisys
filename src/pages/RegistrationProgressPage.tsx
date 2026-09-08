import { Activity, ArrowLeft, ClipboardList, MapPin, Users } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { KpiCard } from '../components/KpiCard'
import { AthleteProgressTable, StateProgressTable } from '../components/RegistrationProgressTables'
import { useApiData } from '../lib/api'
import { useReportingScope } from '../lib/reportingScope'
import type { RegistrationProgress, RegistrationStateAthletes } from '../lib/registrationProgress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function StateAthletesView({
  competitionCode,
  stateCode,
  stateName,
  onBack,
}: {
  competitionCode: string
  stateCode: string
  stateName: string
  onBack: () => void
}) {
  const { data, loading, error } = useApiData<RegistrationStateAthletes>(
    `/api/dashboard/registration-progress/states/${encodeURIComponent(stateCode)}/athletes?competitionCode=${encodeURIComponent(competitionCode)}`
  )

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl leading-none tracking-tight">{stateName} ({stateCode})</h1>
          <p className="text-sm text-muted-foreground">Registros e pendências dos atletas deste estado.</p>
        </div>
        <Button variant="outline" onClick={onBack}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> Voltar</Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar os atletas</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <AthleteProgressTable athletes={data?.athletes ?? []} loading={loading} />
        </CardContent>
      </Card>
    </div>
  )
}

export function RegistrationProgressPage() {
  const { scope } = useReportingScope()
  const competitionCode = scope.competitionCode
  const hasCompetition = competitionCode !== 'all'
  const [selectedState, setSelectedState] = useState<{ code: string; name: string } | null>(null)
  const { data, loading, error } = useApiData<RegistrationProgress>(
    hasCompetition ? `/api/dashboard/registration-progress?competitionCode=${encodeURIComponent(competitionCode)}` : '',
    hasCompetition
  )

  const totalSocial = data?.states.reduce((sum, state) => sum + state.socialRegistered, 0) ?? 0
  const totalMotor = data?.states.reduce((sum, state) => sum + state.motorRegistered, 0) ?? 0
  const socialPct = data && data.totalAthletes > 0 ? (totalSocial / data.totalAthletes) * 100 : 0
  const motorPct = data && data.totalAthletes > 0 ? (totalMotor / data.totalAthletes) * 100 : 0

  if (selectedState && hasCompetition) {
    return (
      <PageHeader
        active="registration-progress"
        breadcrumb={[{ label: 'Resultados e análises' }, { label: 'Acompanhamento' }, { label: selectedState.name }]}
      >
        <StateAthletesView
          competitionCode={competitionCode}
          stateCode={selectedState.code}
          stateName={selectedState.name}
          onBack={() => setSelectedState(null)}
        />
      </PageHeader>
    )
  }

  return (
    <PageHeader
      active="registration-progress"
      breadcrumb={[{ label: 'Resultados e análises' }, { label: 'Acompanhamento' }]}
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl leading-none tracking-tight">Acompanhamento de cadastro</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Progresso de preenchimento por estado na competição selecionada acima, separado entre dados sociais (técnicos) e dados motores (árbitros). Clique em um estado para ver os atletas.
          </p>
        </div>

        {!hasCompetition && (
          <Alert>
            <AlertTitle>Selecione uma competição</AlertTitle>
            <AlertDescription>Escolha uma competição específica no filtro no topo da página para ver o acompanhamento por estado.</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível carregar o acompanhamento</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasCompetition && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard icon={Users} label="Atletas na competição" value={loading ? '—' : String(data?.totalAthletes ?? 0)} loading={loading} />
              <KpiCard icon={MapPin} label="Estados" value={loading ? '—' : String(data?.states.length ?? 0)} loading={loading} />
              <KpiCard icon={ClipboardList} label="Social registrado" value={loading ? '—' : `${socialPct.toFixed(1)}%`} description={loading ? undefined : `${totalSocial} de ${data?.totalAthletes ?? 0}`} loading={loading} />
              <KpiCard icon={Activity} label="Motora registrada" value={loading ? '—' : `${motorPct.toFixed(1)}%`} description={loading ? undefined : `${totalMotor} de ${data?.totalAthletes ?? 0}`} loading={loading} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{data?.competition.name ?? 'Competição'}</CardTitle>
                <CardDescription>Por estado, quantos atletas já tiveram os dados registrados. Clique em uma linha para ver o detalhe.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="social">
                  <TabsList>
                    <TabsTrigger value="social">Social</TabsTrigger>
                    <TabsTrigger value="motor">Motora</TabsTrigger>
                  </TabsList>
                  <TabsContent value="social" className="mt-4">
                    <StateProgressTable states={data?.states ?? []} registeredKey="socialRegistered" percentageKey="socialPercentage" statusKey="socialStatus" onSelectState={(state) => setSelectedState({ code: state.stateCode, name: state.stateName })} />
                  </TabsContent>
                  <TabsContent value="motor" className="mt-4">
                    <StateProgressTable states={data?.states ?? []} registeredKey="motorRegistered" percentageKey="motorPercentage" statusKey="motorStatus" onSelectState={(state) => setSelectedState({ code: state.stateCode, name: state.stateName })} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageHeader>
  )
}
