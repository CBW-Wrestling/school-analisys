import { ArrowLeft, ArrowRight, Check, Copy } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { details, movements } from '../constants'
import { apiPost, useApiRows } from '../lib/api'
import type { Answers, CompetitionAthlete, CompetitionRow, FormKind, Props } from '../types'
import { Field, Select, SelectPairs } from './Field'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

type SubmitPayload = Record<string, unknown>

async function submitAssessment(payload: SubmitPayload) {
  return apiPost('/api/assessments', payload)
}

function buildPayload(kind: FormKind, answers: Answers): SubmitPayload {
  const base: SubmitPayload = {
    kind,
    event: answers.event,
    name: answers.name,
    state: answers.state,
    style: answers.style,
    gender: answers.gender,
    weight: answers.weight,
    age_code: answers.age_category_code,
    entry_id: answers.entry_id ?? undefined,
  }
  if (kind === 'profile') {
    return {
      ...base,
      practice_time: answers.practiceTime,
      practice_location: answers.place,
      practice_location_name: answers.locationName,
      weekly_frequency: answers.frequency,
      practices_other_sport: answers.otherSport === 'Sim',
      other_sports: Object.entries(answers)
        .filter(([k, v]) => k.startsWith('sport-') && Boolean(v))
        .map(([, v]) => v),
      school: answers.school,
    }
  }
  if (kind === 'physical') {
    return {
      ...base,
      arm_span_cm: answers['Envergadura (cm)'],
      height_cm: answers['Estatura (cm)'],
      hand_grip_right: answers['Prensão manual (D)'],
      hand_grip_left: answers['Prensão manual (E)'],
      base_cm: answers['Envergadura e base'],
      forearm_right_cm: answers['Antebraço (D)'],
      forearm_left_cm: answers['Antebraço (E)'],
      placement: answers.placement,
    }
  }
  const allMovements = Object.values(movements).flat()
  return {
    ...base,
    results: allMovements
      .filter(m => answers[m])
      .map(m => ({ movement: m, result: answers[m] })),
  }
}

function FieldsIntro({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

function IdentityFields({
  kind,
  answers,
  update,
  athletes,
  athletesLoading,
  athletesError,
  competitions,
  competitionsLoading,
}: {
  kind: FormKind
  answers: Answers
  update: (key: string, value: string) => void
  athletes: CompetitionAthlete[]
  athletesLoading: boolean
  athletesError: string | null
  competitions: CompetitionRow[]
  competitionsLoading: boolean
}) {
  function handleCompetitionChange(code: string) {
    update('event', code)
    update('entry_id', '')
    update('name', '')
    update('state', '')
    update('style', '')
    update('weight', '')
    update('gender', '')
    update('age_category_code', '')
  }

  function handleAthleteChange(entryId: string) {
    const found = athletes.find(a => a.entryId === entryId)
    if (!found) { update('entry_id', ''); update('name', ''); return }
    update('entry_id', found.entryId)
    update('name', found.athleteName)
    update('state', found.state)
    update('style', found.style)
    update('weight', String(found.weight))
    update('gender', found.gender)
    update('age_category_code', found.ageCategoryCode)
  }

  const competitionOptions = competitions.map(c => ({ label: c.name, value: c.code }))
  const athleteOptions = athletes.map(a => ({
    label: `${a.athleteName} · ${a.style} ${a.weight}kg`,
    value: a.entryId,
  }))

  return (
    <div className="flex flex-col gap-6">
      <FieldsIntro title="Identifique o atleta" text="Escolha a competição e selecione o atleta na lista." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectPairs
          label="Competição"
          value={answers.event || ''}
          placeholder={competitionsLoading ? 'Carregando competições…' : 'Selecione a competição'}
          options={competitionOptions}
          onChange={handleCompetitionChange}
          disabled={competitionsLoading}
        />
        <SelectPairs
          label="Atleta"
          value={answers.entry_id || ''}
          placeholder={
            !answers.event ? 'Escolha uma competição primeiro'
            : athletesLoading ? 'Carregando atletas…'
            : athletes.length === 0 ? 'Nenhum atleta encontrado'
            : 'Selecione o atleta'
          }
          options={athleteOptions}
          onChange={handleAthleteChange}
          disabled={!answers.event || athletesLoading}
        />
        {athletesError && (
          <p className="col-span-full text-sm text-destructive">
            {athletesError.includes('PGRST202') || athletesError.includes('schema cache')
              ? 'Configuração pendente: execute o arquivo sql/07_get_competition_athletes_rpc.sql no Supabase e recarregue o schema.'
              : `Erro ao carregar atletas: ${athletesError}`}
          </p>
        )}
        {kind !== 'profile' && answers.entry_id && (
          <Select label="Gênero" value={answers.gender || ''} options={['M', 'W']} onChange={(v) => update('gender', v)} />
        )}
        {kind === 'profile' && answers.entry_id && (
          <Field label="Escola" value={answers.school || ''} onChange={(v) => update('school', v)} />
        )}
      </div>
      {answers.entry_id && (
        <dl className="flex flex-wrap gap-x-6 gap-y-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex flex-col gap-0.5"><dt className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">Estado</dt><dd className="text-sm font-semibold text-foreground">{answers.state || '—'}</dd></div>
          <div className="flex flex-col gap-0.5"><dt className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">Estilo</dt><dd className="text-sm font-semibold text-foreground">{answers.style}</dd></div>
          <div className="flex flex-col gap-0.5"><dt className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">Peso</dt><dd className="text-sm font-semibold text-foreground">{answers.weight} kg</dd></div>
          <div className="flex flex-col gap-0.5"><dt className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">Gênero</dt><dd className="text-sm font-semibold text-foreground">{answers.gender}</dd></div>
        </dl>
      )}
    </div>
  )
}

function ProfileFields({ answers, update }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <FieldsIntro title="Contexto de prática" text="As faixas de tempo foram padronizadas para análises consistentes." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Tempo de prática" value={answers.practiceTime || ''} placeholder="Selecione" options={['Menos de 6 meses', '6 meses a 1 ano', '1 a 2 anos', '2 a 3 anos', 'Mais de 3 anos']} onChange={(value) => update('practiceTime', value)} />
        <Select label="Local de prática" value={answers.place || ''} placeholder="Selecione" options={['Projeto social', 'Academia', 'Escola', 'Clube']} onChange={(value) => update('place', value)} />
        <Select label="Frequência semanal" value={answers.frequency || ''} placeholder="Selecione" options={['1 vez', '2 vezes', '3 vezes', '4 vezes', '5 vezes', 'Mais de 5 vezes']} onChange={(value) => update('frequency', value)} />
        <Field label="Nome do local de prática" value={answers.locationName || ''} onChange={(value) => update('locationName', value)} />
      </div>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium text-foreground">Pratica outra modalidade?</legend>
        <RadioGroup className="flex gap-4" value={answers.otherSport || ''} onValueChange={(value) => update('otherSport', value)}>
          {['Não pratico', 'Sim'].map((choice) => (
            <label key={choice} className="flex items-center gap-2 text-sm">
              <RadioGroupItem value={choice} aria-label={choice} />
              {choice}
            </label>
          ))}
        </RadioGroup>
        {answers.otherSport === 'Sim' && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {['Judô', 'Jiu-Jitsu / BJJ', 'Capoeira', 'MMA', 'Muay Thai', 'Vôlei', 'Outra'].map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={Boolean(answers[`sport-${item}`])}
                  onCheckedChange={(checked) => update(`sport-${item}`, checked === true ? item : '')}
                  aria-label={item}
                />
                {item}
              </label>
            ))}
          </div>
        )}
      </fieldset>
    </div>
  )
}

function PhysicalFields({ answers, update }: Props) {
  const measures = ['Envergadura (cm)', 'Estatura (cm)', 'Prensão manual (D)', 'Prensão manual (E)', 'Envergadura e base', 'Antebraço (D)', 'Antebraço (E)']
  return (
    <div className="flex flex-col gap-6">
      <FieldsIntro title="Medidas antropométricas" text="Informe apenas números. Decimais com vírgula ou ponto são aceitos." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {measures.map((measure) => (
          <Field key={measure} label={measure} type="number" value={answers[measure] || ''} onChange={(value) => update(measure, value)} />
        ))}
        <Select label="Colocação (opcional)" value={answers.placement || ''} placeholder="Não se aplica" options={['1', '2', '3']} onChange={(value) => update('placement', value)} />
      </div>
    </div>
  )
}

function MotorFields({ answers, update }: Props) {
  const competency = answers.competency || 'Acrobacias'
  return (
    <div className="flex flex-col gap-6">
      <FieldsIntro title="Avaliação por movimento" text="Complete os quatro movimentos desta competência e troque de aba para continuar." />
      <div className="flex flex-wrap gap-2">
        {Object.keys(movements).map((item) => (
          <Button variant={competency === item ? 'default' : 'outline'} type="button" key={item} onClick={() => update('competency', item)}>
            {item}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {movements[competency].map((movement) => (
          <div className="flex flex-col gap-1.5" key={movement}>
            <strong className="text-sm font-medium text-foreground">{movement}</strong>
            <Select label="Resultado" value={answers[movement] || ''} placeholder="Selecione" options={['Completo', 'Incompleto', 'Não Fez', 'Não Sabe']} onChange={(value) => update(movement, value)} />
          </div>
        ))}
      </div>
    </div>
  )
}

const REVIEW_LABELS: Record<string, string> = {
  event: 'Competição',
  name: 'Atleta',
  state: 'Estado',
  style: 'Estilo',
  weight: 'Peso',
  gender: 'Gênero',
  practiceTime: 'Tempo de prática',
  frequency: 'Frequência semanal',
  competency: 'Competência',
  'Envergadura (cm)': 'Envergadura (cm)',
  'Estatura (cm)': 'Estatura (cm)',
}

function Review({ kind, answers }: { kind: FormKind; answers: Answers }) {
  const labels =
    kind === 'profile'
      ? ['event', 'name', 'state', 'style', 'weight', 'practiceTime', 'frequency']
      : kind === 'physical'
        ? ['event', 'name', 'state', 'style', 'weight', 'gender', 'Envergadura (cm)', 'Estatura (cm)']
        : ['event', 'name', 'state', 'style', 'weight', 'gender', 'competency']
  return (
    <div className="flex flex-col gap-6">
      <FieldsIntro title="Revise antes de enviar" text="Os dados serão associados à competição e categoria indicados." />
      <dl className="divide-y rounded-lg border">
        {labels.map((key) => (
          <div key={key} className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt className="text-xs font-medium text-muted-foreground">{REVIEW_LABELS[key] ?? key}</dt>
            <dd className="text-sm font-semibold text-foreground">{answers[key] || 'Não informado'}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Stepper({ step, totalSteps, kind }: { step: number; totalSteps: number; kind: FormKind }) {
  return (
    <div
      className="mb-8 flex items-center"
      role="progressbar"
      aria-label={`Etapa ${step} de ${totalSteps}`}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={step}
    >
      {[1, 2, 3].map((number, index) => (
        <div key={number} className="flex flex-1 items-center gap-2 last:flex-none">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                number <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {number < step ? <Check className="size-3.5" aria-hidden="true" /> : number}
            </span>
            <span className={cn('text-xs font-medium whitespace-nowrap', number <= step ? 'text-foreground' : 'text-muted-foreground')}>
              {number === 1 ? 'Identificação' : number === 2 ? (kind === 'motor' ? 'Avaliação' : 'Dados') : 'Revisão'}
            </span>
          </div>
          {index < 2 && <div className={cn('mx-3 h-px flex-1', number < step ? 'bg-primary' : 'bg-border')} />}
        </div>
      ))}
    </div>
  )
}

export function AssessmentWizard({ kind, onAnother }: { kind: FormKind; onAnother: () => void }) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>({ competency: 'Acrobacias' })
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState(false)
  const [duplicateTarget, setDuplicateTarget] = useState('')
  const [duplicateSubmitting, setDuplicateSubmitting] = useState(false)
  const [duplicateError, setDuplicateError] = useState<string | null>(null)
  const [duplicateDone, setDuplicateDone] = useState(false)

  const { rows: competitions, loading: competitionsLoading } = useApiRows<CompetitionRow>('/api/competitions')
  const { rows: athletes, loading: athletesLoading, error: athletesError } = useApiRows<CompetitionAthlete>(
    answers.event ? `/api/competitions/${answers.event}/athletes` : '/api/competitions/__none__/athletes',
    Boolean(answers.event)
  )

  const info = details[kind]
  const Icon = info.icon
  const totalSteps = 3
  const canAdvance = step !== 1 || Boolean(answers.entry_id)
  const update = (key: string, value: string) => setAnswers(current => ({ ...current, [key]: value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitAssessment(buildPayload(kind, answers))
      setSent(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao enviar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDuplicate = async () => {
    const target = athletes.find(a => a.entryId === duplicateTarget)
    if (!target) return
    setDuplicateSubmitting(true)
    setDuplicateError(null)
    try {
      const dupAnswers: Answers = {
        ...answers,
        name: target.athleteName,
        state: target.state,
        style: target.style,
        weight: String(target.weight),
        gender: target.gender,
        age_category_code: target.ageCategoryCode,
        entry_id: target.entryId,
      }
      await submitAssessment(buildPayload(kind, dupAnswers))
      setDuplicateDone(true)
      setDuplicating(false)
    } catch (err) {
      setDuplicateError(err instanceof Error ? err.message : 'Erro ao duplicar. Tente novamente.')
    } finally {
      setDuplicateSubmitting(false)
    }
  }

  if (sent) {
    const duplicateCandidates = athletes.filter(a => a.entryId !== answers.entry_id)

    if (duplicating) {
      return (
        <section className="mx-auto flex min-h-svh w-[min(760px,calc(100%-40px))] flex-col items-center justify-center gap-2 py-12 text-center" aria-labelledby="dup-title">
          <p className="text-xs font-bold tracking-wide text-muted-foreground">DUPLICAR FORMULÁRIO</p>
          <h1 id="dup-title" className="font-heading text-3xl font-semibold text-foreground">Para qual atleta duplicar?</h1>
          <p className="mb-4 max-w-[440px] text-sm text-muted-foreground">Os dados preenchidos serão copiados para o atleta selecionado.</p>
          <div className="flex w-full max-w-[380px] flex-col gap-4">
            <SelectPairs
              label="Atleta de destino"
              value={duplicateTarget}
              placeholder="Selecione o atleta"
              options={duplicateCandidates.map(a => ({
                label: `${a.athleteName} · ${a.style} ${a.weight}kg`,
                value: a.entryId,
              }))}
              onChange={setDuplicateTarget}
            />
            {duplicateError && <p className="text-sm text-destructive">{duplicateError}</p>}
            <div className="flex justify-center gap-3">
              <Button
                type="button"
                disabled={!duplicateTarget || duplicateSubmitting}
                onClick={handleDuplicate}
              >
                {duplicateSubmitting ? 'Duplicando…' : <><Check data-icon="inline-start" aria-hidden="true" /> Confirmar duplicação</>}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDuplicating(false)}>Cancelar</Button>
            </div>
          </div>
        </section>
      )
    }

    return (
      <section className="mx-auto flex min-h-svh w-[min(760px,calc(100%-40px))] flex-col items-center justify-center gap-2 py-12 text-center" aria-labelledby="success-title">
        <span className="mb-1 inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <p className="text-xs font-bold tracking-wide text-muted-foreground">REGISTRO CONCLUÍDO</p>
        <h1 id="success-title" className="font-heading text-3xl font-semibold text-foreground">Dados recebidos.</h1>
        {duplicateDone && <p className="text-sm font-medium text-primary">Formulário duplicado com sucesso.</p>}
        <p className="max-w-[440px] text-sm text-muted-foreground">Deseja enviar outro formulário ou finalizar a coleta?</p>
        <div className="mt-2 flex gap-3">
          <Button onClick={onAnother}>Enviar outro formulário<ArrowRight data-icon="inline-end" aria-hidden="true" /></Button>
          <Button asChild variant="outline"><a href="/">Finalizar coleta</a></Button>
        </div>
        {duplicateCandidates.length > 0 && !duplicateDone && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => { setDuplicating(true); setDuplicateTarget('') }}
          >
            <Copy data-icon="inline-start" aria-hidden="true" /> Duplicar formulário
          </Button>
        )}
      </section>
    )
  }

  return (
    <section aria-labelledby="form-title">
      <header className="flex h-14 items-center justify-between border-b px-5 sm:px-8">
        <a className="flex items-center gap-2 text-sm font-semibold text-foreground" href="/">
          <span className="rounded-md bg-foreground px-1.5 py-1 text-[9px] font-extrabold text-background">CBW</span>
          <span>Coleta</span>
        </a>
        <a href="/" className="text-xs font-semibold text-muted-foreground hover:text-foreground">Finalizar depois</a>
      </header>
      <div className="mx-auto w-[min(760px,calc(100%-40px))] py-12">
        <div className="mb-7 flex items-center gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-bold tracking-wide text-muted-foreground">{info.label}</p>
            <h1 id="form-title" className="font-heading text-2xl font-semibold text-foreground">{info.title}</h1>
          </div>
        </div>
        <Stepper step={step} totalSteps={totalSteps} kind={kind} />
        <form onSubmit={submit} className="flex flex-col gap-6">
          {step === 1 && (
            <IdentityFields
              kind={kind}
              answers={answers}
              update={update}
              athletes={athletes}
              athletesLoading={athletesLoading}
              athletesError={athletesError}
              competitions={competitions}
              competitionsLoading={competitionsLoading}
            />
          )}
          {step === 2 && (
            kind === 'profile'
              ? <ProfileFields answers={answers} update={update} />
              : kind === 'physical'
                ? <PhysicalFields answers={answers} update={update} />
                : <MotorFields answers={answers} update={update} />
          )}
          {step === 3 && <Review kind={kind} answers={answers} />}
          {submitError && step === 3 && <p className="text-sm text-destructive">{submitError}</p>}
          <div className="flex items-center justify-between border-t pt-5">
            {step > 1
              ? <Button type="button" variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> Voltar</Button>
              : <span />
            }
            {step < totalSteps
              ? <Button type="button" disabled={!canAdvance} onClick={() => setStep(step + 1)}>Continuar<ArrowRight data-icon="inline-end" aria-hidden="true" /></Button>
              : <Button type="submit" disabled={submitting}>
                  {submitting ? 'Enviando…' : <><Check data-icon="inline-start" aria-hidden="true" /> Enviar registro</>}
                </Button>
            }
          </div>
        </form>
      </div>
    </section>
  )
}
