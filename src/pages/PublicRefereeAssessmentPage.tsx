import { ArrowLeft, ArrowRight, ClipboardCheck, Dumbbell, ShieldPlus } from 'lucide-react'
import { useState } from 'react'
import { AssessmentWizard } from '../components/AssessmentWizard'
import { SelectPairs } from '../components/Field'
import logo from '../assets/logo.svg'
import { useApiData } from '../lib/api'
import type { CompetitionRow, FormKind } from '../types'
import type { Referee } from '../lib/refereeApi'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type PublicCompetitionReferees = {
  competition: CompetitionRow
  referee?: Referee
  referees?: Referee[]
}

const publicKinds: Array<{ kind: FormKind; label: string; description: string; icon: typeof Dumbbell }> = [
  { kind: 'physical', label: 'Registro físico', description: 'Medidas antropométricas do atleta.', icon: Dumbbell },
  { kind: 'motor', label: 'Registro motor', description: 'Movimentos técnicos avaliados pelo árbitro.', icon: ShieldPlus },
]

export function PublicRefereeAssessmentPage() {
  const params = new URLSearchParams(window.location.search)
  const accessToken = params.get('token') ?? ''
  const competitionCode = params.get('competition') ?? ''
  const [refereeId, setRefereeId] = useState('')
  const [kind, setKind] = useState<FormKind | null>(null)
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

  if (kind && data && selectedReferee) {
    return (
      <AssessmentWizard
        key={`${kind}-${selectedReferee.id}`}
        kind={kind}
        onAnother={() => setKind(null)}
        lockedCompetition={data.competition}
        submitPath="/api/public/referee-assessments"
        buildSubmitBody={(payload) => accessToken ? { accessToken, payload } : { refereeId: selectedReferee.id, payload }}
        athletesPathForEvent={(code) => accessToken ? `/api/public/referee-assessments/${accessToken}/athletes` : `/api/public/competitions/${code}/athletes`}
        allowDuplicate={false}
        finishHref={accessToken ? `/?view=referee-assessment&token=${encodeURIComponent(accessToken)}` : `/?view=referee-assessment&competition=${encodeURIComponent(data.competition.code)}`}
        headerLabel={`${selectedReferee.name} · ${selectedReferee.state}`}
      />
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
            <h1 className="text-3xl font-medium leading-none tracking-tight">Registro físico e motor</h1>
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
            <div className="grid gap-3 sm:grid-cols-2">
              {publicKinds.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.kind}
                    type="button"
                    disabled={!selectedReferee}
                    className="flex min-h-32 flex-col items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/40 disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => setKind(item.kind)}
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
            <Button variant="outline" asChild>
              <a href="/"><ArrowLeft data-icon="inline-start" aria-hidden="true" /> Voltar</a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}