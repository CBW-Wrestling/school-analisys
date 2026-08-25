import { Activity, ArrowRight, Dumbbell, Medal, UserRound } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

function DashboardLink({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <a className="block no-underline" href={href}>
      <Card className="@container/card h-full bg-gradient-to-t from-primary/5 to-card shadow-xs transition-shadow hover:shadow-md">
        <CardHeader>
          <span className="mb-2 inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</span>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{text}</CardDescription>
          <CardAction>
            <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
          </CardAction>
        </CardHeader>
      </Card>
    </a>
  )
}

export function DashboardPage() {
  return (
    <PageHeader active="dashboard">
      <section className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-7 py-16">
        <div>
          <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground">CENTRO DE INTELIGÊNCIA CBW</p>
          <h1 className="font-heading text-4xl leading-tight font-semibold text-foreground">
            Dados que fazem<br /><em className="font-display not-italic">o wrestling avançar.</em>
          </h1>
          <p className="mt-3.5 mb-5 max-w-[510px] text-sm leading-relaxed text-muted-foreground">
            Explore resultados, desenvolvimento físico e avaliação técnica das competições escolares brasileiras.
          </p>
          <Button onClick={() => window.location.assign('?view=results')}>
            Ver resultados oficiais
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>
        <Card className="@container/card w-48 shrink-0 bg-gradient-to-t from-primary/5 to-card shadow-xs">
          <CardHeader>
            <CardDescription>BASE ATUAL</CardDescription>
            <CardTitle>JEBS 2024<br />JEJS 2025</CardTitle>
            <CardAction>
              <Badge variant="outline">5 fontes</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-muted-foreground">Dados consolidados e sincronizados</CardFooter>
        </Card>
      </section>
      <section className="mx-auto max-w-[1200px] px-7 pb-14">
        <p className="mb-1 text-xs font-bold tracking-wide text-muted-foreground">EXPLORAR DADOS</p>
        <h2 className="font-heading mb-5 text-2xl font-semibold text-foreground">Uma visão para cada decisão.</h2>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardLink href="?view=results" icon={<Medal aria-hidden="true" />} title="Resultados" text="Rankings, pódios, vitórias e pontos técnicos por categoria." />
          <DashboardLink href="?view=profiles" icon={<UserRound aria-hidden="true" />} title="Perfil de atletas" text="Hábitos de prática e contexto de formação esportiva." />
          <DashboardLink href="?view=physical" icon={<Dumbbell aria-hidden="true" />} title="Desenvolvimento físico" text="Antropometria e força por evento, estado e estilo." />
          <DashboardLink href="?view=motor" icon={<Activity aria-hidden="true" />} title="Avaliação técnica" text="Domínio de movimentos fundamentais por competência." />
        </div>
      </section>
    </PageHeader>
  )
}
