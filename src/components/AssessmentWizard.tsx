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
    <div className="form-content">
      <div className="form-intro">
        <h3>Identifique o atleta</h3>
        <p>Escolha a competição e selecione o atleta na lista.</p>
      </div>
      <div className="field-grid">
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
          <p className="form-error" style={{ gridColumn: '1/-1' }}>
            {athletesError.includes('PGRST202') || athletesError.includes('schema cache')
              ? 'Configuração pendente: execute o arquivo sql/07_get_competition_athletes_rpc.sql no Supabase e recarregue o schema.'
              : `Erro ao carregar atletas: ${athletesError}`}
          </p>
        )}
        {kind !== 'profile' && answers.entry_id && (
          <Select label="Gênero" value={answers.gender || ''} options={['M', 'W']} onChange={(v) => update('gender', v)} />
        )}
        {kind === 'profile' && answers.entry_id && (
          <>
            <Field label="Escola" value={answers.school || ''} onChange={(v) => update('school', v)} />
          </>
        )}
      </div>
      {answers.entry_id && (
        <dl className="identity-summary">
          <div><dt>Estado</dt><dd>{answers.state || '—'}</dd></div>
          <div><dt>Estilo</dt><dd>{answers.style}</dd></div>
          <div><dt>Peso</dt><dd>{answers.weight} kg</dd></div>
          <div><dt>Gênero</dt><dd>{answers.gender}</dd></div>
        </dl>
      )}
    </div>
  )
}

function ProfileFields({ answers, update }: Props) {
  return (
    <div className="form-content">
      <div className="form-intro">
        <h3>Contexto de prática</h3>
        <p>As faixas de tempo foram padronizadas para análises consistentes.</p>
      </div>
      <div className="field-grid">
        <Select label="Tempo de prática" value={answers.practiceTime || ''} placeholder="Selecione" options={['Menos de 6 meses', '6 meses a 1 ano', '1 a 2 anos', '2 a 3 anos', 'Mais de 3 anos']} onChange={(value) => update('practiceTime', value)} />
        <Select label="Local de prática" value={answers.place || ''} placeholder="Selecione" options={['Projeto social', 'Academia', 'Escola', 'Clube']} onChange={(value) => update('place', value)} />
        <Select label="Frequência semanal" value={answers.frequency || ''} placeholder="Selecione" options={['1 vez', '2 vezes', '3 vezes', '4 vezes', '5 vezes', 'Mais de 5 vezes']} onChange={(value) => update('frequency', value)} />
        <Field label="Nome do local de prática" value={answers.locationName || ''} onChange={(value) => update('locationName', value)} />
      </div>
      <fieldset>
        <legend>Pratica outra modalidade?</legend>
        <RadioGroup className="choice-row" value={answers.otherSport || ''} onValueChange={(value) => update('otherSport', value)}>
          {['Não pratico', 'Sim'].map((choice) => (
            <label key={choice}>
              <RadioGroupItem value={choice} aria-label={choice} />
              {choice}
            </label>
          ))}
        </RadioGroup>
        {answers.otherSport === 'Sim' && (
          <div className="check-grid">
            {['Judô', 'Jiu-Jitsu / BJJ', 'Capoeira', 'MMA', 'Muay Thai', 'Vôlei', 'Outra'].map((item) => (
              <label key={item}>
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
    <div className="form-content">
      <div className="form-intro">
        <h3>Medidas antropométricas</h3>
        <p>Informe apenas números. Decimais com vírgula ou ponto são aceitos.</p>
      </div>
      <div className="field-grid">
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
    <div className="form-content">
      <div className="form-intro">
        <h3>Avaliação por movimento</h3>
        <p>Complete os quatro movimentos desta competência e troque de aba para continuar.</p>
      </div>
      <div className="competencies">
        {Object.keys(movements).map((item) => (
          <Button variant={competency === item ? 'default' : 'outline'} type="button" key={item} onClick={() => update('competency', item)}>
            {item}
          </Button>
        ))}
      </div>
      <div className="movement-list">
        {movements[competency].map((movement) => (
          <div className="movement" key={movement}>
            <strong>{movement}</strong>
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
    <div className="form-content">
      <div className="form-intro">
        <h3>Revise antes de enviar</h3>
        <p>Os dados serão associados à competição e categoria indicados.</p>
      </div>
      <dl className="review-list">
        {labels.map((key) => (
          <div key={key}>
            <dt>{REVIEW_LABELS[key] ?? key}</dt>
            <dd>{answers[key] || 'Não informado'}</dd>
          </div>
        ))}
      </dl>
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
        <section className="full-success" aria-labelledby="dup-title">
          <p className="eyebrow">DUPLICAR FORMULÁRIO</p>
          <h1 id="dup-title">Para qual atleta duplicar?</h1>
          <p>Os dados preenchidos serão copiados para o atleta selecionado.</p>
          <div className="duplicate-picker">
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
            {duplicateError && <p className="form-error">{duplicateError}</p>}
            <div className="form-dup-actions">
              <Button
                type="button"
                disabled={!duplicateTarget || duplicateSubmitting}
                onClick={handleDuplicate}
              >
                {duplicateSubmitting ? 'Duplicando…' : <><Check size={15} /> Confirmar duplicação</>}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDuplicating(false)}>Cancelar</Button>
            </div>
          </div>
        </section>
      )
    }

    return (
      <section className="full-success" aria-labelledby="success-title">
        <span className="success-icon"><Check /></span>
        <p className="eyebrow">REGISTRO CONCLUÍDO</p>
        <h1 id="success-title">Dados recebidos.</h1>
        {duplicateDone && <p className="form-dup-done">Formulário duplicado com sucesso.</p>}
        <p>Deseja enviar outro formulário ou finalizar a coleta?</p>
        <div>
          <Button onClick={onAnother}>Enviar outro formulário <ArrowRight size={16} /></Button>
          <Button asChild variant="outline"><a href="/">Finalizar coleta</a></Button>
        </div>
        {duplicateCandidates.length > 0 && !duplicateDone && (
          <Button
            type="button"
            variant="outline"
            onClick={() => { setDuplicating(true); setDuplicateTarget('') }}
          >
            <Copy size={14} /> Duplicar formulário
          </Button>
        )}
      </section>
    )
  }

  return (
    <section className="form-screen" aria-labelledby="form-title">
      <header className="form-screen-header">
        <a className="brand" href="/">
          <span className="brand-mark"><span>C</span><span>B</span><span>W</span></span>
          <span>CBW <b>Coleta</b></span>
        </a>
        <a href="/" className="exit-link">Finalizar depois</a>
      </header>
      <div className="form-screen-content">
        <div className="modal-top">
          <span className={`modal-icon ${info.color}`}><Icon /></span>
          <div>
            <p className="eyebrow">{info.label}</p>
            <h1 id="form-title">{info.title}</h1>
          </div>
        </div>
        <div className="progress" role="progressbar" aria-label={`Etapa ${step} de ${totalSteps}`} aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={step}>
          {[1, 2, 3].map((number) => (
            <span className={number <= step ? 'done' : ''} key={number}>
              <i>{number < step ? <Check size={12} /> : number}</i>
              <b>{number === 1 ? 'Identificação' : number === 2 ? kind === 'motor' ? 'Avaliação' : 'Dados' : 'Revisão'}</b>
            </span>
          ))}
        </div>
        <form onSubmit={submit}>
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
          {submitError && step === 3 && <p className="form-error">{submitError}</p>}
          <div className="form-actions">
            {step > 1
              ? <Button type="button" variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Voltar</Button>
              : <span />
            }
            {step < totalSteps
              ? <Button type="button" disabled={!canAdvance} onClick={() => setStep(step + 1)}>Continuar <ArrowRight size={16} /></Button>
              : <Button type="submit" disabled={submitting}>
                  {submitting ? 'Enviando…' : <><Check size={16} /> Enviar registro</>}
                </Button>
            }
          </div>
        </form>
      </div>
    </section>
  )
}
