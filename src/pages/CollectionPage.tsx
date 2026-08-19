import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { AssessmentWizard } from '../components/AssessmentWizard'
import { details } from '../constants'
import type { FormKind } from '../types'

function FormPicker({ onChoose }: { onChoose: (kind: FormKind) => void }) {
  return (
    <section className="next-form">
      <p className="eyebrow">NOVO REGISTRO</p>
      <h1>Qual formulário deseja enviar agora?</h1>
      <p>Escolha o próximo instrumento de coleta para este atleta.</p>
      <div className="next-form-grid">
        {(Object.keys(details) as FormKind[]).map((kind) => {
          const item = details[kind]
          const Icon = item.icon
          return (
            <button key={kind} onClick={() => onChoose(kind)}>
              <span className={`card-icon ${item.color}`}><Icon /></span>
              <strong>{item.label}</strong>
              <ArrowRight size={17} />
            </button>
          )
        })}
      </div>
      <a className="finish-link" href="/">Voltar ao painel</a>
    </section>
  )
}

export function CollectionPage({ initialKind }: { initialKind: FormKind }) {
  const [kind, setKind] = useState<FormKind | null>(initialKind)
  return (
    <main className="collection-page">
      {kind
        ? <AssessmentWizard key={kind} kind={kind} onAnother={() => setKind(null)} />
        : <FormPicker onChoose={setKind} />
      }
    </main>
  )
}
