import { ArrowRight, ClipboardList, ShieldCheck } from 'lucide-react'
import { details } from '../constants'
import { PageHeader } from '../components/PageHeader'
import type { FormKind } from '../types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const FORM_COPY: Record<FormKind, { kicker: string; text: string; bullets: string[] }> = {
  profile: { kicker: '01 · FORMULÁRIO', text: 'Histórico, contexto de prática e identificação esportiva.', bullets: ['1 registro por atleta', 'Dados socioesportivos'] },
  physical: { kicker: '02 · FORMULÁRIO', text: 'Medidas antropométricas e indicadores de força.', bullets: ['1 registro por atleta', 'Medidas em centímetros'] },
  motor: { kicker: '03 · FORMULÁRIO', text: 'Competências fundamentais por movimento avaliado.', bullets: ['12 movimentos por atleta', '3 competências técnicas'] },
}

export function CollectionHome() {
  return (
    <PageHeader active="collection">
      <div className="@container/main">
        <section className="mx-auto flex w-full max-w-[1400px] flex-col items-start gap-6 p-4 md:gap-8 md:p-6 @2xl/main:flex-row @2xl/main:items-center @2xl/main:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Centro de inteligência e resultados</p>
            <h1 className="mt-1 text-3xl leading-none tracking-tight text-foreground">Coleta de avaliações</h1>
            <p className="mt-1 max-w-[640px] text-sm leading-relaxed text-muted-foreground">Registre dados de atletas com critérios claros e transforme cada avaliação em inteligência para o wrestling brasileiro.</p>
          </div>
          <Card className="w-48 shrink-0 bg-gradient-to-t from-primary/5 to-card text-center shadow-xs">
            <CardHeader className="items-center">
              <span className="mb-1 inline-flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary"><ClipboardList aria-hidden /></span>
              <CardTitle>Coleta padronizada</CardTitle>
              <CardDescription>JEBS · JEJS</CardDescription>
            </CardHeader>
          </Card>
        </section>

        <section className="mx-auto w-full max-w-[1400px] p-4 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nova coleta</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">O que você deseja registrar?</h2>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">Três instrumentos, uma base de dados confiável.</p>
          <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
            {(Object.keys(details) as FormKind[]).map((formKind) => {
              const item = details[formKind]
              const Icon = item.icon
              const copy = FORM_COPY[formKind]
              return (
                <a className="block no-underline" key={formKind} href={`?form=${formKind}`} target="_blank" rel="noopener">
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <span className="mb-2 inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden /></span>
                      <CardDescription className="text-xs font-medium tracking-wide">{copy.kicker}</CardDescription>
                      <CardTitle>{item.label}</CardTitle>
                      <CardDescription>{copy.text}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                        {copy.bullets.map((b) => <li key={b}>{b}</li>)}
                      </ul>
                    </CardContent>
                    <CardFooter className="text-primary">
                      Iniciar registro
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
            <AlertTitle>Dados de menores exigem cuidado.</AlertTitle>
            <AlertDescription>Use apenas os campos necessários à avaliação e respeite a base legal aplicável para coleta e tratamento.</AlertDescription>
          </Alert>
        </section>

        <footer className="mx-auto w-full max-w-[1400px] px-4 pb-8 text-center text-xs text-muted-foreground md:px-6">
          Confederação Brasileira de Wrestling <span className="mx-1">·</span> Plataforma de inteligência esportiva
        </footer>
      </div>
    </PageHeader>
  )
}
