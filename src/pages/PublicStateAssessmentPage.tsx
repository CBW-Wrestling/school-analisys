import { ArrowLeft, ArrowRight, ClipboardList, MapPinned } from 'lucide-react'
import { useState } from 'react'
import { AssessmentWizard } from '../components/AssessmentWizard'
import { AthleteProgressTable } from '../components/RegistrationProgressTables'
import logo from '../assets/logo.svg'
import { useApiData } from '../lib/api'
import type { CompetitionRow } from '../types'
import type { RegistrationStateAthletes } from '../lib/registrationProgress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type PublicStateContext = {
  competition: CompetitionRow
  state: { id: string; code: string; name: string }
}

export function PublicStateAssessmentPage() {
  const params = new URLSearchParams(window.location.search)
  const accessToken = params.get('token') ?? ''
  const [started, setStarted] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const { data, loading, error } = useApiData<PublicStateContext>(
    accessToken ? `/api/public/state-links/${accessToken}` : '/api/public/state-links/__missing__',
    Boolean(accessToken)
  )
  const { data: progressData, loading: progressLoading, error: progressError } = useApiData<RegistrationStateAthletes>(
    accessToken ? `/api/public/state-links/${accessToken}/progress` : '',
    Boolean(accessToken) && showProgress
  )

  if (started && data) {
    return (
      <AssessmentWizard
        key={`profile-${accessToken}`}
        kind="profile"
        onAnother={() => setStarted(false)}
        lockedCompetition={data.competition}
        submitPath="/api/public/state-assessments"
        buildSubmitBody={(payload) => ({ accessToken, payload })}
        athletesPathForEvent={() => `/api/public/state-links/${accessToken}/athletes`}
        allowDuplicate={false}
        finishHref={`/?view=state-assessment&token=${encodeURIComponent(accessToken)}`}
        headerLabel={`${data.state.name} (${data.state.code})`}
      />
    )
  }

  if (showProgress && data) {
    return (
      <main className="min-h-dvh bg-background text-foreground">
        <header className="flex h-12 w-full items-center justify-between border-b border-border bg-background px-4 md:px-6">
          <a className="flex items-center gap-2 text-sm font-semibold text-foreground" href="/">
            <img className="size-7 object-contain" src={logo} alt="" />
            <span>Dados sociais dos atletas</span>
          </a>
        </header>
        <section className="mx-auto flex w-full max-w-[960px] flex-col gap-6 p-6 md:p-10">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Pendências de {data.state.name} ({data.state.code})</h1>
            <Button variant="outline" size="sm" onClick={() => setShowProgress(false)}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> Voltar</Button>
          </div>
          {progressError && (
            <Alert variant="destructive">
              <AlertTitle>Não foi possível carregar as pendências</AlertTitle>
              <AlertDescription>{progressError}</AlertDescription>
            </Alert>
          )}
          <AthleteProgressTable athletes={progressData?.athletes ?? []} loading={progressLoading} />
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="flex h-12 w-full items-center justify-between border-b border-border bg-background px-4 md:px-6">
        <a className="flex items-center gap-2 text-sm font-semibold text-foreground" href="/">
          <img className="size-7 object-contain" src={logo} alt="" />
          <span>Dados sociais dos atletas</span>
        </a>
      </header>
      <section className="mx-auto flex w-full max-w-[760px] flex-col gap-6 p-6 md:p-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><MapPinned aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rota pública</p>
            <h1 className="text-3xl font-medium leading-none tracking-tight">Dados sociais dos atletas</h1>
          </div>
        </div>

        {!accessToken && (
          <Alert variant="destructive">
            <AlertTitle>Link incompleto</AlertTitle>
            <AlertDescription>Abra o link público gerado na tela de links por estado.</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível carregar o link</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{loading ? 'Carregando…' : data?.competition.name ?? 'Competição'}</CardTitle>
            <CardDescription>Preencha os dados sociais apenas dos atletas do seu estado.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {data?.state && (
              <dl className="rounded-lg border bg-muted/30 p-4">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Estado</dt>
                  <dd className="text-[14px] font-semibold text-foreground">{data.state.name} ({data.state.code})</dd>
                </div>
              </dl>
            )}
            <Button type="button" disabled={!data} onClick={() => setStarted(true)}>
              Iniciar preenchimento<ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
            {data && (
              <Button type="button" variant="outline" onClick={() => setShowProgress(true)}>
                <ClipboardList data-icon="inline-start" aria-hidden="true" /> Ver pendências dos meus atletas
              </Button>
            )}
            <Button variant="outline" asChild>
              <a href="/"><ArrowLeft data-icon="inline-start" aria-hidden="true" /> Voltar</a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
