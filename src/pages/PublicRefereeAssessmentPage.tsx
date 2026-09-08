import { ArrowLeft, ArrowRight, ClipboardCheck, ShieldPlus, Activity } from 'lucide-react'
import { useState } from 'react'
import { AssessmentWizard } from '../components/AssessmentWizard'
import { SelectPairs } from '../components/Field'
import { AthleteProgressTable, StateProgressTable } from '../components/RegistrationProgressTables'
import logo from '../assets/logo.svg'
import { useApiData } from '../lib/api'
import { useBackStack } from '../lib/useBackStack'
import type { CompetitionRow, FormKind } from '../types'
import type { Referee } from '../lib/refereeApi'
import type { RegistrationProgress, RegistrationStateAthletes } from '../lib/registrationProgress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type PublicCompetitionReferees = {
  competition: CompetitionRow
  referee?: Referee
  referees?: Referee[]
}

type RefereeScreen =
  | { name: 'menu' }
  | { name: 'progress-states' }
  | { name: 'progress-athletes'; stateCode: string; stateName: string }
  | { name: 'form'; kind: FormKind; entryId?: string }

const publicKinds: Array<{ kind: FormKind; label: string; description: string; icon: typeof ShieldPlus }> = [
  { kind: 'motor', label: 'Registro motor', description: 'Movimentos técnicos avaliados pelo árbitro.', icon: ShieldPlus },
]

/** Progresso motor agregado por estado (só leitura, sem login). */
function MotorProgressStates({ competitionCode, onBack, onSelectState }: {
  competitionCode: string
  onBack: () => void
  onSelectState: (stateCode: string, stateName: string) => void
}) {
  const { data, loading, error } = useApiData<RegistrationProgress>(
    `/api/public/competitions/${encodeURIComponent(competitionCode)}/registration-progress`
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Progresso motor por estado</h2>
        <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> Voltar</Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar o progresso</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {loading
        ? <p className="text-sm text-muted-foreground">Carregando…</p>
        : <StateProgressTable states={data?.states ?? []} registeredKey="motorRegistered" percentageKey="motorPercentage" statusKey="motorStatus" onSelectState={(state) => onSelectState(state.stateCode, state.stateName)} />
      }
    </div>
  )
}

/** Atletas de um estado, apenas com a coluna motora (responsabilidade do árbitro). */
function MotorProgressAthletes({ competitionCode, stateCode, stateName, onBack, onRegister }: {
  competitionCode: string
  stateCode: string
  stateName: string
  onBack: () => void
  onRegister: (entryId: string) => void
}) {
  const { data, loading, error } = useApiData<RegistrationStateAthletes>(
    `/api/public/competitions/${encodeURIComponent(competitionCode)}/registration-progress/states/${encodeURIComponent(stateCode)}/athletes`
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{stateName} ({stateCode})</h2>
        <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> Voltar</Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar os atletas</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <AthleteProgressTable athletes={data?.athletes ?? []} loading={loading} showSocial={false} onRegister={(athlete) => onRegister(athlete.entryId)} />
    </div>
  )
}

export function PublicRefereeAssessmentPage() {
  const params = new URLSearchParams(window.location.search)
  const accessToken = params.get('token') ?? ''
  const competitionCode = params.get('competition') ?? ''
  const [refereeId, setRefereeId] = useState('')
  const { current: screen, push, pop, reset } = useBackStack<RefereeScreen>({ name: 'menu' })
  const publicPath = accessToken
    ? `/api/public/referee-assessments/${accessToken}`
    : competitionCode
      ? `/api/public/competitions/${competitionCode}/referees`
      : '/api/public/referee-assessments/__missing__'
  const { data, loading, error } = useApiData<PublicCompetitionReferees>(
    publicPath,
    Boolean(accessToken || competitionCode)
  )
  const selectedReferee = data?.referee ?? data?.referees?.find((referee) => referee.id === refereeId)

  if (screen.name === 'form' && data && selectedReferee) {
    return (
      <AssessmentWizard
        key={`${screen.kind}-${selectedReferee.id}-${screen.entryId ?? ''}`}
        kind={screen.kind}
        onAnother={() => reset({ name: 'menu' })}
        lockedCompetition={data.competition}
        submitPath="/api/public/referee-assessments"
        buildSubmitBody={(payload) => accessToken ? { accessToken, payload } : { refereeId: selectedReferee.id, payload }}
        athletesPathForEvent={(code) => accessToken ? `/api/public/referee-assessments/${accessToken}/athletes` : `/api/public/competitions/${code}/athletes`}
        allowDuplicate={false}
        finishHref={accessToken ? `/?view=referee-assessment&token=${encodeURIComponent(accessToken)}` : `/?view=referee-assessment&competition=${encodeURIComponent(data.competition.code)}`}
        headerLabel={`${selectedReferee.name} · ${selectedReferee.state}`}
        initialEntryId={screen.entryId}
      />
    )
  }

  if (screen.name === 'progress-states' && data) {
    return (
      <main className="min-h-dvh bg-background text-foreground">
        <header className="flex h-12 w-full items-center justify-between border-b border-border bg-background px-4 md:px-6">
          <a className="flex items-center gap-2 text-sm font-semibold text-foreground" href="/">
            <img className="size-7 object-contain" src={logo} alt="" />
            <span>Coleta de arbitragem</span>
          </a>
        </header>
        <section className="mx-auto flex w-full max-w-[960px] flex-col gap-6 p-6 md:p-10">
          <MotorProgressStates
            competitionCode={data.competition.code}
            onBack={pop}
            onSelectState={(stateCode, stateName) => push({ name: 'progress-athletes', stateCode, stateName })}
          />
        </section>
      </main>
    )
  }

  if (screen.name === 'progress-athletes' && data) {
    return (
      <main className="min-h-dvh bg-background text-foreground">
        <header className="flex h-12 w-full items-center justify-between border-b border-border bg-background px-4 md:px-6">
          <a className="flex items-center gap-2 text-sm font-semibold text-foreground" href="/">
            <img className="size-7 object-contain" src={logo} alt="" />
            <span>Coleta de arbitragem</span>
          </a>
        </header>
        <section className="mx-auto flex w-full max-w-[960px] flex-col gap-6 p-6 md:p-10">
          <MotorProgressAthletes
            competitionCode={data.competition.code}
            stateCode={screen.stateCode}
            stateName={screen.stateName}
            onBack={pop}
            onRegister={(entryId) => push({ name: 'form', kind: 'motor', entryId })}
          />
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="flex h-12 w-full items-center justify-between border-b border-border bg-background px-4 md:px-6">
        <a className="flex items-center gap-2 text-sm font-semibold text-foreground" href="/">
          <img className="size-7 object-contain" src={logo} alt="" />
          <span>Coleta de arbitragem</span>
        </a>
      </header>
      <section className="mx-auto flex w-full max-w-[760px] flex-col gap-6 p-6 md:p-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><ClipboardCheck aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rota pública</p>
            <h1 className="text-3xl font-medium leading-none tracking-tight">Registro motor</h1>
          </div>
        </div>

        {!accessToken && !competitionCode && (
          <Alert variant="destructive">
            <AlertTitle>Link incompleto</AlertTitle>
            <AlertDescription>Abra o link público gerado na tela de cadastro de árbitros.</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível carregar a competição</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{loading ? 'Carregando competição…' : data?.competition.name ?? 'Competição'}</CardTitle>
            <CardDescription>Escolha seu nome antes de registrar os dados dos atletas.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {data?.referees ? (
              <SelectPairs
                label="Árbitro"
                value={refereeId}
                placeholder={loading ? 'Carregando árbitros…' : data.referees.length ? 'Selecione seu nome' : 'Nenhum árbitro cadastrado'}
                options={data.referees.map((referee) => ({ label: `${referee.name} · ${referee.state}`, value: referee.id }))}
                onChange={setRefereeId}
                disabled={loading || data.referees.length === 0}
              />
            ) : data?.referee && (
              <dl className="rounded-lg border bg-muted/30 p-4">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Árbitro</dt>
                  <dd className="text-[14px] font-semibold text-foreground">{data.referee.name} · {data.referee.state}</dd>
                </div>
              </dl>
            )}
            <div className="grid gap-3">
              {publicKinds.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.kind}
                    type="button"
                    disabled={!selectedReferee}
                    className="flex min-h-32 flex-col items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/40 disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => push({ name: 'form', kind: item.kind })}
                  >
                    <span className="inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden="true" /></span>
                    <span className="flex flex-1 flex-col gap-1">
                      <strong className="text-sm font-semibold text-foreground">{item.label}</strong>
                      <span className="text-sm text-muted-foreground">{item.description}</span>
                    </span>
                    <ArrowRight className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
                  </button>
                )
              })}
            </div>
            {selectedReferee && (
              <p className="text-sm text-muted-foreground">Os registros serão salvos como {selectedReferee.name} ({selectedReferee.state}).</p>
            )}
            {data && (
              <Button type="button" variant="outline" disabled={!selectedReferee} onClick={() => push({ name: 'progress-states' })}>
                <Activity data-icon="inline-start" aria-hidden="true" /> Ver progresso motor por estado
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