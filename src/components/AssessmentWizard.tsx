import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { details, movements, states, weights } from '../constants'
import type { Answers, FormKind, Props } from '../types'
import { Field, Select } from './Field'

function IdentityFields({ kind, answers, update }: { kind: FormKind; answers: Answers; update: (key: string, value: string) => void }) {
  return (
    <div className="form-content">
      <div className="form-intro">
        <h3>Identifique o atleta</h3>
        <p>Use os mesmos dados de competição para manter os registros conectados.</p>
      </div>
      <div className="field-grid">
        <Select label="Evento" value={answers.event} options={['24_jebs', '25_jejs']} onChange={(value) => update('event', value)} />
        <Field label="Nome do atleta" value={answers.name || ''} required onChange={(value) => update('name', value)} />
        <Select label="Estado (UF)" value={answers.state} options={states} onChange={(value) => update('state', value)} />
        <Select label="Estilo" value={answers.style} options={['WW', 'FS', 'GR']} onChange={(value) => update('style', value)} />
        <Select label="Peso (kg)" value={answers.weight || ''} placeholder="Selecione" options={weights} onChange={(value) => update('weight', value)} />
        {kind !== 'profile' && <Select label="Gênero" value={answers.gender} options={['M', 'W']} onChange={(value) => update('gender', value)} />}
        {kind === 'profile' && (
          <>
            <Field label="Nascimento" type="date" value={answers.birth || ''} onChange={(value) => update('birth', value)} />
            <Field label="Escola" value={answers.school || ''} onChange={(value) => update('school', value)} />
          </>
        )}
      </div>
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
        <div className="choice-row">
          {['Não pratico', 'Sim'].map((choice) => (
            <label key={choice}>
              <input type="radio" name="otherSport" checked={answers.otherSport === choice} onChange={() => update('otherSport', choice)} />
              {choice}
            </label>
          ))}
        </div>
        {answers.otherSport === 'Sim' && (
          <div className="check-grid">
            {['Judô', 'Jiu-Jitsu / BJJ', 'Capoeira', 'MMA', 'Muay Thai', 'Vôlei', 'Outra'].map((item) => (
              <label key={item}>
                <input type="checkbox" onChange={() => update(`sport-${item}`, item)} />
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
          <button type="button" className={competency === item ? 'selected' : ''} key={item} onClick={() => update('competency', item)}>
            {item}
          </button>
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
        <p>Os dados serão associados ao evento e à categoria indicados.</p>
      </div>
      <dl className="review-list">
        {labels.map((key) => (
          <div key={key}>
            <dt>{key.replace('event', 'Evento').replace('name', 'Atleta').replace('state', 'Estado').replace('style', 'Estilo').replace('weight', 'Peso').replace('gender', 'Gênero').replace('competency', 'Competência')}</dt>
            <dd>{answers[key] || 'Não informado'}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function AssessmentWizard({ kind, onAnother }: { kind: FormKind; onAnother: () => void }) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>({ event: '25_jejs', state: 'SP', style: 'FS', gender: 'M', competency: 'Acrobacias' })
  const [sent, setSent] = useState(false)
  const info = details[kind]
  const Icon = info.icon
  const totalSteps = 3
  const canAdvance = step !== 1 || Boolean(answers.name?.trim())
  const update = (key: string, value: string) => setAnswers((current) => ({ ...current, [key]: value }))
  const submit = (e: FormEvent) => { e.preventDefault(); setSent(true) }

  if (sent) {
    return (
      <section className="full-success" aria-labelledby="success-title">
        <span className="success-icon"><Check /></span>
        <p className="eyebrow">REGISTRO CONCLUÍDO</p>
        <h1 id="success-title">Dados recebidos.</h1>
        <p>Deseja enviar outro formulário ou finalizar a coleta?</p>
        <div>
          <button className="primary" onClick={onAnother}>Enviar outro formulário <ArrowRight size={16} /></button>
          <a className="secondary" href="/">Finalizar coleta</a>
        </div>
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
          {step === 1 && <IdentityFields kind={kind} answers={answers} update={update} />}
          {step === 2 && (
            kind === 'profile'
              ? <ProfileFields answers={answers} update={update} />
              : kind === 'physical'
                ? <PhysicalFields answers={answers} update={update} />
                : <MotorFields answers={answers} update={update} />
          )}
          {step === 3 && <Review kind={kind} answers={answers} />}
          <div className="form-actions">
            {step > 1
              ? <button type="button" className="secondary" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Voltar</button>
              : <span />
            }
            {step < totalSteps
              ? <button type="button" className="primary" disabled={!canAdvance} onClick={() => setStep(step + 1)}>Continuar <ArrowRight size={16} /></button>
              : <button className="primary" type="submit">Enviar registro <Check size={16} /></button>
            }
          </div>
        </form>
      </div>
    </section>
  )
}
