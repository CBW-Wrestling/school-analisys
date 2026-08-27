import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { AssessmentWizard } from '../components/AssessmentWizard'
import { details } from '../constants'
import type { FormKind } from '../types'

function FormPicker({ onChoose }: { onChoose: (kind: FormKind) => void }) {
  return (
    <section className="mx-auto flex min-h-svh w-full max-w-[960px] flex-col items-center justify-center gap-8 p-6 text-center md:p-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Novo registro</p>
        <h1 className="mt-1 text-3xl leading-none tracking-tight text-foreground">Qual formulário deseja enviar agora?</h1>
        <p className="mt-1 text-sm text-muted-foreground">Escolha o próximo instrumento de coleta para este atleta.</p>
      </div>
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        {(Object.keys(details) as FormKind[]).map((kind) => {
          const item = details[kind]
          const Icon = item.icon
          return (
            <button
              key={kind}
              type="button"
              className="flex flex-col items-start gap-3 rounded-xl border bg-card p-5 text-left shadow-xs transition-shadow hover:shadow-md"
              onClick={() => onChoose(kind)}
            >
              <span className="inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden="true" /></span>
              <strong className="text-sm font-semibold text-foreground">{item.label}</strong>
              <ArrowRight className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
            </button>
          )
        })}
      </div>
      <a className="text-sm font-medium text-primary underline-offset-4 hover:underline" href="?view=collection">Voltar à coleta</a>
    </section>
  )
}

export function CollectionPage({ initialKind }: { initialKind: FormKind }) {
  const [kind, setKind] = useState<FormKind | null>(initialKind)
  return (
    <main className="min-h-svh w-full min-w-0 overflow-x-hidden bg-background">
      {kind
        ? <AssessmentWizard key={kind} kind={kind} onAnother={() => setKind(null)} />
        : <FormPicker onChoose={setKind} />
      }
    </main>
  )
}
