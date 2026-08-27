import { ArrowRight, ShieldCheck } from 'lucide-react'
import { details } from '../constants'
import { PageHeader } from '../components/PageHeader'
import type { FormKind } from '../types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const FORM_COPY: Record<FormKind, string> = {
  profile: 'Dados do perfil e histórico esportivo.',
  physical: 'Medidas e indicadores físicos.',
  motor: 'Competências por movimento avaliado.',
}

export function CollectionHome() {
  return (
    <PageHeader active="collection">
      <div className="@container/main">
        <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nova avaliação</p>
            <h1 className="text-3xl font-normal leading-none tracking-tight text-foreground">Coleta de avaliações</h1>
            <p className="text-sm text-muted-foreground">Selecione o formulário para iniciar o registro.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
            {(Object.keys(details) as FormKind[]).map((formKind) => {
              const item = details[formKind]
              const Icon = item.icon
              const copy = FORM_COPY[formKind]
              return (
                <a
                  className="block no-underline"
                  key={formKind}
                  href={`?form=${formKind}`}
                  target="_blank"
                  rel="noopener"
                  aria-label={`Iniciar registro de ${item.label.toLowerCase()} em nova aba`}
                >
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <span className="mb-2 inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden /></span>
                      <CardTitle>{item.label}</CardTitle>
                      <CardDescription>{copy}</CardDescription>
                    </CardHeader>
                    <CardFooter className="text-primary">
                      Iniciar: {item.label}
                      <ArrowRight className="ml-auto size-4" aria-hidden="true" />
                    </CardFooter>
                  </Card>
                </a>
              )
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1400px] px-4 pb-8 md:px-6">
          <Alert>
            <ShieldCheck aria-hidden="true" />
            <AlertTitle>Dados de menores</AlertTitle>
            <AlertDescription>Colete apenas informações necessárias e com base legal.</AlertDescription>
          </Alert>
        </section>
      </div>
    </PageHeader>
  )
}
