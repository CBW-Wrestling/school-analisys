import { Activity, ArrowRight, Dumbbell, Medal, Trophy, UserRound } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApiData, useApiRows } from '../lib/api'
import type { CompetitionRow, MotorSummary, PhysicalSummary, ProfileSummary } from '../types'
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function DashboardLink({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <a className="block no-underline" href={href}>
      <Card className="@container/card h-full min-w-0 bg-gradient-to-t from-primary/5 to-card shadow-xs transition-shadow hover:shadow-md">
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

function StatCard({ icon, label, value, loading, hint }: { icon: React.ReactNode; label: string; value: string; loading: boolean; hint: string }) {
  return (
    <Card className="@container/card min-w-0 bg-gradient-to-t from-primary/5 to-card shadow-xs">
      <CardHeader>
        <CardDescription className="flex items-center gap-1.5">
          {icon}
          {label}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[180px]/card:text-3xl">
          {loading ? '—' : value}
        </CardTitle>
      </CardHeader>
      <CardFooter className="text-muted-foreground">{hint}</CardFooter>
    </Card>
  )
}

export function DashboardPage() {
  const { rows: competitions, loading: competitionsLoading } = useApiRows<CompetitionRow>('/api/competitions')
  const { data: profileSummary, loading: profileLoading } = useApiData<ProfileSummary>('/api/dashboard/profiles/summary')
  const { data: physicalSummary, loading: physicalLoading } = useApiData<PhysicalSummary>('/api/dashboard/physical/summary')
  const { data: motorSummary, loading: motorLoading } = useApiData<MotorSummary>('/api/dashboard/motor/summary')

  return (
    <PageHeader active="dashboard">
      <div className="@container/main">
        <section className="mx-auto flex max-w-[1200px] flex-col items-start gap-8 px-7 py-16 @2xl/main:flex-row @2xl/main:items-center @2xl/main:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground">CENTRO DE INTELIGÊNCIA CBW</p>
            <h1 className="font-heading text-4xl leading-tight font-semibold text-foreground">
              Dados que fazem<br /><em className="not-italic">o wrestling avançar.</em>
            </h1>
            <p className="mt-3.5 mb-5 max-w-[510px] text-sm leading-relaxed text-muted-foreground">
              Explore resultados, desenvolvimento físico e avaliação técnica das competições escolares brasileiras.
            </p>
            <Button onClick={() => window.location.assign('?view=results')}>
              Ver resultados oficiais
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
          <Card className="@container/card w-56 shrink-0 bg-gradient-to-t from-primary/5 to-card shadow-xs">
            <CardHeader>
              <CardDescription>BASE ATUAL</CardDescription>
              <CardTitle className="text-2xl font-semibold">
                {competitionsLoading ? '—' : `${competitions.length} competições`}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-muted-foreground">
              {competitionsLoading
                ? 'Carregando...'
                : competitions.slice(0, 2).map((c) => (
                  <span key={c.id} className="line-clamp-1">{c.name}{c.year ? ` · ${c.year}` : ''}</span>
                ))}
            </CardFooter>
          </Card>
        </section>
        <section className="mx-auto max-w-[1200px] px-7 pb-10">
          <p className="mb-1 text-xs font-bold tracking-wide text-muted-foreground">NÚMEROS DA BASE</p>
          <h2 className="font-heading mb-5 text-2xl font-semibold text-foreground">O que já está registrado.</h2>
          <div className="grid grid-cols-1 gap-3.5 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <StatCard
              icon={<Trophy className="size-4" aria-hidden="true" />}
              label="Competições"
              value={String(competitions.length)}
              loading={competitionsLoading}
              hint="Eventos escolares cadastrados"
            />
            <StatCard
              icon={<UserRound className="size-4" aria-hidden="true" />}
              label="Perfis coletados"
              value={String(profileSummary?.totalProfiles ?? 0)}
              loading={profileLoading}
              hint="Atletas com dados socioesportivos"
            />
            <StatCard
              icon={<Dumbbell className="size-4" aria-hidden="true" />}
              label="Avaliações físicas"
              value={String(physicalSummary?.totalAssessments ?? 0)}
              loading={physicalLoading}
              hint="Medições antropométricas registradas"
            />
            <StatCard
              icon={<Activity className="size-4" aria-hidden="true" />}
              label="Domínio técnico"
              value={`${motorSummary?.dominanceRate ?? 0}%`}
              loading={motorLoading}
              hint={`${motorSummary?.totalMovements ?? 0} movimentos avaliados`}
            />
          </div>
        </section>
        <section className="mx-auto max-w-[1200px] px-7 pb-14">
          <p className="mb-1 text-xs font-bold tracking-wide text-muted-foreground">EXPLORAR DADOS</p>
          <h2 className="font-heading mb-5 text-2xl font-semibold text-foreground">Uma visão para cada decisão.</h2>
          <div className="grid grid-cols-1 gap-3.5 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <DashboardLink href="?view=results" icon={<Medal aria-hidden="true" />} title="Resultados" text="Rankings, pódios, vitórias e pontos técnicos por categoria." />
            <DashboardLink href="?view=profiles" icon={<UserRound aria-hidden="true" />} title="Perfil de atletas" text="Hábitos de prática e contexto de formação esportiva." />
            <DashboardLink href="?view=physical" icon={<Dumbbell aria-hidden="true" />} title="Desenvolvimento físico" text="Antropometria e força por evento, estado e estilo." />
            <DashboardLink href="?view=motor" icon={<Activity aria-hidden="true" />} title="Avaliação técnica" text="Domínio de movimentos fundamentais por competência." />
          </div>
        </section>
      </div>
    </PageHeader>
  )
}
