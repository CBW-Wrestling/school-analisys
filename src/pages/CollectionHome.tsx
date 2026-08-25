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
        <section className="mx-auto flex max-w-[1200px] flex-col items-start gap-8 px-7 py-14 @2xl/main:flex-row @2xl/main:items-center @2xl/main:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground">CENTRO DE INTELIGÊNCIA E RESULTADOS</p>
            <h1 className="font-heading text-4xl leading-tight font-semibold text-foreground">A informação certa para<br />formar campeões.</h1>
            <p className="mt-3.5 max-w-[540px] text-sm leading-relaxed text-muted-foreground">Registre dados de atletas com critérios claros e transforme cada avaliação em inteligência para o wrestling brasileiro.</p>
          </div>
          <Card className="w-48 shrink-0 bg-gradient-to-t from-primary/5 to-card text-center shadow-xs">
            <CardHeader className="items-center">
              <span className="mb-1 inline-flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary"><ClipboardList aria-hidden /></span>
              <CardTitle>Coleta padronizada</CardTitle>
              <CardDescription>JEBS · JEJS</CardDescription>
            </CardHeader>
          </Card>
        </section>

        <section className="mx-auto max-w-[1200px] px-7 pb-9">
          <p className="mb-1 text-xs font-bold tracking-wide text-muted-foreground">NOVA COLETA</p>
          <h2 className="font-heading mb-1 text-2xl font-semibold text-foreground">O que você deseja registrar?</h2>
          <p className="mb-5 text-sm text-muted-foreground">Três instrumentos, uma base de dados confiável.</p>
          <div className="grid grid-cols-1 gap-3.5 @xl/main:grid-cols-3">
            {(Object.keys(details) as FormKind[]).map((formKind) => {
              const item = details[formKind]
              const Icon = item.icon
              const copy = FORM_COPY[formKind]
              return (
                <a className="block no-underline" key={formKind} href={`?form=${formKind}`} target="_blank" rel="noopener">
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <span className="mb-2 inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon aria-hidden /></span>
                      <CardDescription className="text-xs font-bold tracking-wide">{copy.kicker}</CardDescription>
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

        <section className="mx-auto max-w-[1200px] px-7 pb-9">
          <Alert>
            <ShieldCheck aria-hidden="true" />
            <AlertTitle>Dados de menores exigem cuidado.</AlertTitle>
            <AlertDescription>Use apenas os campos necessários à avaliação e respeite a base legal aplicável para coleta e tratamento.</AlertDescription>
          </Alert>
        </section>

        <footer className="mx-auto max-w-[1200px] px-7 pb-10 text-center text-xs text-muted-foreground">
          Confederação Brasileira de Wrestling <span className="mx-1">·</span> Plataforma de inteligência esportiva
        </footer>
      </div>
    </PageHeader>
  )
}
