import { ArrowLeft, ArrowRight, Check, Copy } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { details } from '../constants'
import logo from '../assets/logo.svg'
import { apiPost, useApiRows } from '../lib/api'
import type { Answers, CompetitionAthlete, CompetitionRow, EnumOption, FormKind, MotorMovementGroup, PhysicalField, PlacementOption, Props } from '../types'
import { ChoiceCards, Field, SelectPairs } from './Field'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

type SubmitPayload = Record<string, unknown>

async function submitAssessment(path: string, payload: SubmitPayload) {
  return apiPost(path, payload)
}

function toSnakeCase(key: string) {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function buildPayload(kind: FormKind, answers: Answers, physicalFields: PhysicalField[], motorMovementCodes: string[]): SubmitPayload {
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
    const payload: SubmitPayload = { ...base }
    for (const field of physicalFields) payload[toSnakeCase(field.key)] = answers[field.key]
    return payload
  }
  return {
    ...base,
    results: motorMovementCodes
      .filter(m => answers[m])
      .map(m => ({ movement: m, result: answers[m] })),
  }
}

function FieldsIntro({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{text}</p>
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
  lockedCompetition,
}: {
  kind: FormKind
  answers: Answers
  update: (key: string, value: string) => void
  athletes: CompetitionAthlete[]
  athletesLoading: boolean
  athletesError: string | null
  competitions: CompetitionRow[]
  competitionsLoading: boolean
  lockedCompetition?: CompetitionRow
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
      <div className="grid grid-cols-1 gap-4">
        {lockedCompetition ? (
          <dl className="rounded-lg border bg-muted/30 p-4">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Competição</dt>
              <dd className="text-[14px] font-semibold text-foreground">{lockedCompetition.name}</dd>
            </div>
          </dl>
        ) : (
          <SelectPairs
            label="Competição"
            value={answers.event || ''}
            placeholder={competitionsLoading ? 'Carregando competições…' : 'Selecione a competição'}
            options={competitionOptions}
            onChange={handleCompetitionChange}
            disabled={competitionsLoading}
          />
        )}
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
            Erro ao carregar atletas: {athletesError}
          </p>
        )}
        {kind !== 'profile' && answers.entry_id && (
          <ChoiceCards label="Gênero" value={answers.gender || ''} options={['M', 'W']} optionLabels={{ M: 'Masculino', W: 'Feminino' }} onChange={(v) => update('gender', v)} />
        )}
        {kind === 'profile' && answers.entry_id && (
          <Field label="Escola" value={answers.school || ''} onChange={(v) => update('school', v)} />
        )}
      </div>
      {answers.entry_id && (
        <dl className="flex flex-wrap gap-x-6 gap-y-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex flex-col gap-0.5"><dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Estado</dt><dd className="text-[14px] font-semibold text-foreground">{answers.state || '—'}</dd></div>
          <div className="flex flex-col gap-0.5"><dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Estilo</dt><dd className="text-[14px] font-semibold text-foreground">{answers.style}</dd></div>
          <div className="flex flex-col gap-0.5"><dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Peso</dt><dd className="text-[14px] font-semibold text-foreground">{answers.weight} kg</dd></div>
          <div className="flex flex-col gap-0.5"><dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Gênero</dt><dd className="text-[14px] font-semibold text-foreground">{answers.gender === 'M' ? 'Masculino' : answers.gender === 'W' ? 'Feminino' : '—'}</dd></div>
        </dl>
      )}
    </div>
  )
}

function ProfileFields({ answers, update, practiceTimes, practiceLocations, weeklyFrequencies, otherSports }: Props & {
  practiceTimes: EnumOption[]
  practiceLocations: EnumOption[]
  weeklyFrequencies: EnumOption[]
  otherSports: EnumOption[]
}) {
  return (
    <div className="flex flex-col gap-6">
      <FieldsIntro title="Contexto de prática" text="As faixas de tempo foram padronizadas para análises consistentes." />
      <div className="grid grid-cols-1 gap-4">
        <ChoiceCards
          label="Tempo de prática"
          value={answers.practiceTime || ''}
          options={practiceTimes.map((o) => o.code)}
          optionLabels={Object.fromEntries(practiceTimes.map((o) => [o.code, o.label]))}
          onChange={(value) => update('practiceTime', value)}
        />
        <ChoiceCards
          label="Local de prática"
          value={answers.place || ''}
          options={practiceLocations.map((o) => o.code)}
          optionLabels={Object.fromEntries(practiceLocations.map((o) => [o.code, o.label]))}
          onChange={(value) => update('place', value)}
        />
        <ChoiceCards
          label="Frequência semanal"
          value={answers.frequency || ''}
          options={weeklyFrequencies.map((o) => o.code)}
          optionLabels={Object.fromEntries(weeklyFrequencies.map((o) => [o.code, o.label]))}
          onChange={(value) => update('frequency', value)}
        />
        <Field label="Nome do local de prática" value={answers.locationName || ''} onChange={(value) => update('locationName', value)} />
      </div>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium text-foreground">Pratica outra modalidade?</legend>
        <RadioGroup className="flex gap-4" value={answers.otherSport || ''} onValueChange={(value) => update('otherSport', value)}>
          {['Não pratico', 'Sim'].map((choice) => (
            <label key={choice} className="flex items-center gap-2 text-[14px]">
              <RadioGroupItem value={choice} aria-label={choice} />
              {choice}
            </label>
          ))}
        </RadioGroup>
        {answers.otherSport === 'Sim' && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {otherSports.map((item) => (
              <label key={item.code} className="flex items-center gap-2 text-[14px]">
                <Checkbox
                  checked={Boolean(answers[`sport-${item.label}`])}
                  onCheckedChange={(checked) => update(`sport-${item.label}`, checked === true ? item.label : '')}
                  aria-label={item.label}
                />
                {item.label}
              </label>
            ))}
          </div>
        )}
      </fieldset>
    </div>
  )
}

function PhysicalFields({ answers, update, physicalFields, placementOptions }: Props & {
  physicalFields: PhysicalField[]
  placementOptions: PlacementOption[]
}) {
  const measures = physicalFields.filter((field) => field.key !== 'placement')
  const placementChoices = placementOptions.filter((option) => option.code !== null)
  return (
    <div className="flex flex-col gap-6">
      <FieldsIntro title="Medidas antropométricas" text="Informe apenas números. Decimais com vírgula ou ponto são aceitos." />
      <div className="grid grid-cols-1 gap-4">
        {measures.map((field) => (
          <Field key={field.key} label={field.label} type="number" value={answers[field.key] || ''} onChange={(value) => update(field.key, value)} required={field.required} />
        ))}
        <ChoiceCards
          label="Colocação (opcional)"
          value={answers.placement || ''}
          options={placementChoices.map((option) => String(option.code))}
          optionLabels={Object.fromEntries(placementChoices.map((option) => [String(option.code), option.label]))}
          onChange={(value) => update('placement', value)}
        />
      </div>
    </div>
  )
}

function MotorFields({ answers, update, motorMovementGroups, motorResults }: Props & {
  motorMovementGroups: MotorMovementGroup[]
  motorResults: EnumOption[]
}) {
  const competency = answers.competency || motorMovementGroups[0]?.name || ''
  const activeGroup = motorMovementGroups.find((group) => group.name === competency)
  const resultOptions = motorResults.map((o) => o.code)
  const resultLabels = Object.fromEntries(motorResults.map((o) => [o.code, o.label]))
  return (
    <div className="flex flex-col gap-6">
      <FieldsIntro title="Avaliação por movimento" text="Complete os movimentos desta competência e troque de aba para continuar." />
      <div className="flex flex-wrap gap-2">
        {motorMovementGroups.map((group) => (
          <Button variant={competency === group.name ? 'default' : 'outline'} type="button" key={group.id} onClick={() => update('competency', group.name)}>
            {group.name}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4">
        {(activeGroup?.movements ?? []).map((movement) => (
          <div className="flex flex-col gap-1.5" key={movement.id}>
            <strong className="text-[14px] font-medium text-foreground">{movement.label}</strong>
            <ChoiceCards label="Resultado" value={answers[movement.code] || ''} options={resultOptions} optionLabels={resultLabels} onChange={(value) => update(movement.code, value)} />
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
}

const REVIEW_LABELS_EXTENDED: Record<string, string> = {
  ...REVIEW_LABELS,
  school: 'Escola',
  place: 'Local de prática',
  locationName: 'Nome do local',
  otherSport: 'Outra modalidade',
  placement: 'Colocação',
}

function formatReviewValue(key: string, answers: Answers, selectedSports: string, codeToLabel: Record<string, string>) {
  if (key === 'gender') return answers[key] === 'M' ? 'Masculino' : answers[key] === 'W' ? 'Feminino' : 'Não informado'
  if (key === 'otherSport' && selectedSports) return `${answers[key]}: ${selectedSports}`
  const raw = answers[key]
  if (!raw) return 'Não informado'
  return codeToLabel[raw] ?? raw
}

function ReviewGrid({ labels, answers, selectedSports, codeToLabel }: { labels: string[]; answers: Answers; selectedSports: string; codeToLabel: Record<string, string> }) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2">
      {labels.map((key) => (
        <div key={key} className="flex min-w-0 flex-col gap-1 bg-card px-4 py-3">
          <dt className="text-[14px] font-medium text-muted-foreground">{REVIEW_LABELS_EXTENDED[key] ?? codeToLabel[key] ?? key}</dt>
          <dd className="truncate text-[14px] font-semibold text-foreground">{formatReviewValue(key, answers, selectedSports, codeToLabel)}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Final confirmation screen; submission remains disabled until the reviewer confirms the summary. */
function Review({ kind, answers, confirmed, onConfirmedChange, physicalFields, motorMovementGroups, codeToLabel }: {
  kind: FormKind
  answers: Answers
  confirmed: boolean
  onConfirmedChange: (confirmed: boolean) => void
  physicalFields: PhysicalField[]
  motorMovementGroups: MotorMovementGroup[]
  codeToLabel: Record<string, string>
}) {
  const commonLabels = ['event', 'name', 'state', 'style', 'weight', ...(kind === 'profile' ? ['school', 'practiceTime', 'place', 'locationName', 'frequency', 'otherSport'] : ['gender'])]
  const physicalLabels = physicalFields.map((field) => field.key)
  const selectedSports = Object.entries(answers).filter(([key, value]) => key.startsWith('sport-') && value).map(([, value]) => value).join(', ')

  return (
    <div className="flex flex-col gap-6">
      <FieldsIntro title="Revise antes de enviar" text="Confira todos os dados. O envio só começa após sua confirmação explícita." />
      <ReviewGrid labels={commonLabels} answers={answers} selectedSports={selectedSports} codeToLabel={codeToLabel} />
      {kind === 'physical' && <ReviewGrid labels={physicalLabels} answers={answers} selectedSports={selectedSports} codeToLabel={codeToLabel} />}
      {kind === 'motor' && motorMovementGroups.map((group) => (
        <section key={group.id} className="grid gap-2">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">{group.name}</h3>
          <ReviewGrid labels={group.movements.map((movement) => movement.code)} answers={answers} selectedSports={selectedSports} codeToLabel={codeToLabel} />
        </section>
      ))}
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-input bg-muted/30 p-4 text-sm transition-colors hover:bg-muted/50 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/20">
        <Checkbox checked={confirmed} onCheckedChange={(checked) => onConfirmedChange(checked === true)} aria-label="Confirmar revisão dos dados" />
        <span className="flex flex-col gap-0.5"><span className="font-medium text-foreground">Conferi os dados deste formulário.</span><span className="text-muted-foreground">O registro só será enviado após esta confirmação.</span></span>
      </label>
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

/** Three-step assessment flow used by profile, physical, and motor data collection. */
export function AssessmentWizard({
  kind,
  onAnother,
  lockedCompetition,
  submitPath = '/api/assessments',
  buildSubmitBody,
  athletesPathForEvent = (event) => `/api/competitions/${event}/athletes`,
  allowDuplicate = true,
  finishHref = '/',
  headerLabel = 'Coleta',
}: {
  kind: FormKind
  onAnother: () => void
  lockedCompetition?: CompetitionRow
  submitPath?: string
  buildSubmitBody?: (payload: SubmitPayload) => SubmitPayload
  athletesPathForEvent?: (event: string) => string
  allowDuplicate?: boolean
  finishHref?: string
  headerLabel?: string
}) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>((): Answers => {
    if (!lockedCompetition) return {}
    return { event: lockedCompetition.code }
  })
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState(false)
  const [duplicateTarget, setDuplicateTarget] = useState('')
  const [duplicateSubmitting, setDuplicateSubmitting] = useState(false)
  const [duplicateError, setDuplicateError] = useState<string | null>(null)
  const [duplicateDone, setDuplicateDone] = useState(false)
  const [reviewConfirmed, setReviewConfirmed] = useState(false)

  const { rows: loadedCompetitions, loading: competitionsLoading } = useApiRows<CompetitionRow>('/api/competitions', !lockedCompetition)
  const competitions = lockedCompetition ? [lockedCompetition] : loadedCompetitions
  const selectedEvent = lockedCompetition?.code ?? answers.event
  const { rows: athletes, loading: athletesLoading, error: athletesError } = useApiRows<CompetitionAthlete>(
    selectedEvent ? athletesPathForEvent(selectedEvent) : '/api/competitions/__none__/athletes',
    Boolean(selectedEvent)
  )

  const { rows: motorMovementGroups } = useApiRows<MotorMovementGroup>(
    answers.style ? `/api/motor/movements?style=${answers.style}` : '/api/motor/movements',
    kind === 'motor'
  )
  const { rows: motorResults } = useApiRows<EnumOption>('/api/enums/motor-results', kind === 'motor')
  const { rows: practiceTimes } = useApiRows<EnumOption>('/api/enums/practice-times', kind === 'profile')
  const { rows: practiceLocations } = useApiRows<EnumOption>('/api/enums/practice-locations', kind === 'profile')
  const { rows: weeklyFrequencies } = useApiRows<EnumOption>('/api/enums/weekly-frequencies', kind === 'profile')
  const { rows: otherSports } = useApiRows<EnumOption>('/api/enums/other-sports', kind === 'profile')
  const { rows: physicalFields } = useApiRows<PhysicalField>('/api/physical/fields', kind === 'physical')
  const { rows: placementOptions } = useApiRows<PlacementOption>('/api/physical/placement-options', kind === 'physical')

  const motorMovementCodes = motorMovementGroups.flatMap((group) => group.movements.map((movement) => movement.code))
  const codeToLabel: Record<string, string> = {}
  for (const option of [...practiceTimes, ...practiceLocations, ...weeklyFrequencies, ...motorResults]) codeToLabel[option.code] = option.label
  for (const group of motorMovementGroups) for (const movement of group.movements) codeToLabel[movement.code] = movement.label
  for (const field of physicalFields) codeToLabel[field.key] = field.label

  const info = details[kind]
  const Icon = info.icon
  const totalSteps = 3
  const identityComplete = Boolean(selectedEvent && answers.entry_id)
  const requiredFields = kind === 'profile'
    ? ['practiceTime', 'place', 'frequency']
    : kind === 'physical'
      ? physicalFields.filter((field) => field.required).map((field) => field.key)
      : motorMovementCodes
  const formComplete = Boolean(answers.entry_id) && requiredFields.every((key) => Boolean(answers[key]))
  const stepComplete = step === 1 ? identityComplete : formComplete
  const update = (key: string, value: string) => setAnswers(current => ({ ...current, [key]: value }))
  const changeStep = (nextStep: number) => {
    if (nextStep !== 3) setReviewConfirmed(false)
    setStep(nextStep)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload = buildPayload(kind, answers, physicalFields, motorMovementCodes)
      await submitAssessment(submitPath, buildSubmitBody ? buildSubmitBody(payload) : payload)
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
      const payload = buildPayload(kind, dupAnswers, physicalFields, motorMovementCodes)
      await submitAssessment(submitPath, buildSubmitBody ? buildSubmitBody(payload) : payload)
      setDuplicateDone(true)
      setDuplicating(false)
    } catch (err) {
      setDuplicateError(err instanceof Error ? err.message : 'Erro ao duplicar. Tente novamente.')
    } finally {
      setDuplicateSubmitting(false)
    }
  }

  if (sent) {
    const duplicateCandidates = allowDuplicate ? athletes.filter(a => a.entryId !== answers.entry_id) : []

    if (duplicating) {
      return (
        <section className="mx-auto flex min-h-dvh w-full max-w-[760px] flex-col items-center justify-center gap-3 bg-background p-6 text-center text-foreground md:p-8" aria-labelledby="dup-title">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Duplicar formulário</p>
          <h1 id="dup-title" className="text-3xl font-medium leading-none tracking-tight text-foreground">Para qual atleta duplicar?</h1>
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
      <section className="mx-auto flex min-h-svh w-full max-w-[760px] flex-col items-center justify-center gap-3 bg-background p-6 text-center text-foreground md:p-8" aria-labelledby="success-title">
        <span className="mb-1 inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Registro concluído</p>
        <h1 id="success-title" className="text-3xl font-medium leading-none tracking-tight text-foreground">Dados recebidos.</h1>
        {duplicateDone && <p className="text-sm font-medium text-primary">Formulário duplicado com sucesso.</p>}
        <p className="max-w-[440px] text-sm text-muted-foreground">Deseja enviar outro formulário ou finalizar a coleta?</p>
        <div className="mt-2 flex gap-3">
          <Button onClick={onAnother}>Enviar outro formulário<ArrowRight data-icon="inline-end" aria-hidden="true" /></Button>
          <Button asChild variant="outline"><a href={finishHref}>Finalizar coleta</a></Button>
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
    <section className="min-h-dvh w-full min-w-0 overflow-x-hidden bg-background text-foreground" aria-labelledby="form-title">
      <header className="flex h-12 w-full items-center justify-between border-b border-border bg-background px-4 md:px-6">
        <a className="flex items-center gap-2 text-sm font-semibold text-foreground" href="/">
          <img className="size-7 object-contain" src={logo} alt="" />
          <span>{headerLabel}</span>
        </a>
        <a href="/" className="text-xs font-semibold text-muted-foreground hover:text-foreground">Finalizar depois</a>
      </header>
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-10 p-6 md:p-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{info.label}</p>
            <h1 id="form-title" className="text-3xl font-medium leading-none tracking-tight text-foreground">{info.title}</h1>
          </div>
        </div>
        <Stepper step={step} totalSteps={totalSteps} kind={kind} />
        <form onSubmit={submit} className="flex flex-col gap-8">
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
              lockedCompetition={lockedCompetition}
            />
          )}
          {step === 2 && (
            kind === 'profile'
              ? <ProfileFields answers={answers} update={update} practiceTimes={practiceTimes} practiceLocations={practiceLocations} weeklyFrequencies={weeklyFrequencies} otherSports={otherSports} />
              : kind === 'physical'
                ? <PhysicalFields answers={answers} update={update} physicalFields={physicalFields} placementOptions={placementOptions} />
                : <MotorFields answers={answers} update={update} motorMovementGroups={motorMovementGroups} motorResults={motorResults} />
          )}
          {step === 3 && (
            <Review
              kind={kind}
              answers={answers}
              confirmed={reviewConfirmed}
              onConfirmedChange={setReviewConfirmed}
              physicalFields={physicalFields}
              motorMovementGroups={motorMovementGroups}
              codeToLabel={codeToLabel}
            />
          )}
          {submitError && step === 3 && <p className="text-sm text-destructive">{submitError}</p>}
          <div className="flex items-center justify-between border-t pt-4">
            {step > 1
              ? <Button type="button" variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> Voltar</Button>
              : <span />
            }
            {step < totalSteps
              ? <Button type="button" disabled={!stepComplete} onClick={() => changeStep(step + 1)}>Continuar<ArrowRight data-icon="inline-end" aria-hidden="true" /></Button>
              : <Button type="submit" disabled={submitting || !formComplete || !reviewConfirmed}>
                  {submitting ? 'Enviando…' : <><Check data-icon="inline-start" aria-hidden="true" /> Enviar registro</>}
                </Button>
            }
          </div>
        </form>
      </div>
    </section>
  )
}
