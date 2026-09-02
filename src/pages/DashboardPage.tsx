import { useMemo, useState } from 'react'
import { Activity, ArrowRight, BarChart3, Dumbbell, Medal, Share2, UserRound } from 'lucide-react'
import { InfoTooltip } from '../components/InfoTooltip'
import { PageHeader } from '../components/PageHeader'
import { BrazilHeatmap } from '../components/dashboard/BrazilHeatmap'
import { useApiRows } from '../lib/api'
import { scoreFor, visibleMotorRows, COMPLETION_EXPLANATION } from '../lib/motorScore'
import { competitionCodesForScope, useReportingScope, useScopedCompetitionAthletes, withReportingScope } from '../lib/reportingScope'
import { meanAndStdDev } from '../lib/zscore'
import type { CompetitionRow, MotorRow, PhysicalRow, ProfileRow } from '../types'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const dimensions = [
  { label: 'Acrobacias', matches: (value: string) => /acrob/i.test(value) },
  { label: 'Técnicas de solo', matches: (value: string) => /solo|ch[aã]o/i.test(value) },
  { label: 'Técnicas em pé', matches: (value: string) => /(^|\s)p[eé](\s|$)|em p[eé]/i.test(value) },
]

function KpiCard({ icon, label, value, description, loading, info }: { icon: React.ReactNode; label: string; value: string; description: string; loading?: boolean; info?: React.ReactNode }) {
  return (
    <Card className="min-w-0 bg-linear-to-t from-primary/5 to-card shadow-xs">
      <CardHeader className="gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg border bg-muted text-muted-foreground">{icon}</div>
        <CardDescription className="flex items-center gap-1.5">{label}{info}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {loading ? <Skeleton className="h-9 w-24" /> : <div className="text-3xl font-medium leading-none tracking-tight tabular-nums">{value}</div>}
        {loading ? <Skeleton className="h-4 w-40" /> : <p className="text-sm text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}

function NavigationHub({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <a href={withReportingScope(href)} className="group flex min-h-28 flex-col justify-between rounded-lg border bg-card p-4 no-underline transition-colors hover:bg-muted/50">
      <span className="flex size-9 items-center justify-center rounded-lg border bg-muted text-muted-foreground">{icon}</span>
      <span className="mt-4 flex items-center justify-between gap-3">
        <span><span className="block font-medium">{title}</span><span className="mt-1 block text-sm text-muted-foreground">{description}</span></span>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </a>
  )
}

export function DashboardPage() {
  const { rows: competitions } = useApiRows<CompetitionRow>('/api/competitions')
  const { rows: profiles, loading: profilesLoading } = useApiRows<ProfileRow>('/api/dashboard/profiles')
  const { rows: physical, loading: physicalLoading } = useApiRows<PhysicalRow>('/api/dashboard/physical')
  const { rows: motor, loading: motorLoading } = useApiRows<MotorRow>('/api/dashboard/motor')
  const { scope } = useReportingScope()
  const scopedCompetitionCodes = useMemo(() => competitionCodesForScope(scope, competitions), [scope, competitions])
  const { athletes: scopedAthletes, loading: athletesLoading } = useScopedCompetitionAthletes(scope, competitions)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const baseProfiles = profiles.filter((row) => scopedCompetitionCodes.includes(row.eventIdentifier ?? '') && scope.styles.includes(row.estilo ?? ''))
  const basePhysical = physical.filter((row) => scopedCompetitionCodes.includes(row.eventIdentifier ?? '') && scope.styles.includes(row.estilo ?? ''))
  const baseMotor = visibleMotorRows(motor.filter((row) => scopedCompetitionCodes.includes(row.eventIdentifier ?? '') && scope.styles.includes(row.estilo ?? '')))

  const stateValues = useMemo(() => {
    const stateCodes = [...new Set(scopedAthletes.map((athlete) => athlete.state))]
    return stateCodes.map((code) => {
      const stateMotor = baseMotor.filter((row) => row.estado === code)
      const scored = stateMotor.map((row) => scoreFor(row.resultado))
      const statePhysical = basePhysical.filter((row) => row.estado === code)
      const statePhysicalIds = new Set(statePhysical.map((row) => row.athleteEntryId).filter((value): value is string => Boolean(value)))
      const stateAthleteIds = new Set(scopedAthletes.filter((athlete) => athlete.state === code).map((athlete) => athlete.entryId))
      return {
        code,
        name: code,
        count: stateAthleteIds.size,
        score: scored.length ? scored.reduce((sum, value) => sum + value, 0) / scored.length : null,
        engagement: stateAthleteIds.size ? Math.round(([...statePhysicalIds].filter((id) => stateAthleteIds.has(id)).length / stateAthleteIds.size) * 100) : 0,
        dimensions: dimensions.map((dimension) => {
          const dimensionScores = stateMotor.filter((row) => dimension.matches(row.competencia ?? '')).map((row) => scoreFor(row.resultado))
          return { label: dimension.label, score: dimensionScores.length ? dimensionScores.reduce((sum, value) => sum + value, 0) / dimensionScores.length : null }
        }),
      }
    })
  }, [baseMotor, basePhysical, baseProfiles, scopedAthletes])
  const nationalScores = baseMotor.map((row) => scoreFor(row.resultado))
  const { mean: nationalAverage, stdDev: nationalStdDev } = meanAndStdDev(nationalScores)
  const filteredProfileAthleteIds = new Set(baseProfiles.map((row) => row.athleteEntryId).filter((value): value is string => Boolean(value)))
  const filteredPhysicalAthleteIds = new Set(basePhysical.map((row) => row.athleteEntryId).filter((value): value is string => Boolean(value)))
  const filteredMotorAthleteIds = new Set(baseMotor.map((row) => row.athleteEntryId).filter((value): value is string => Boolean(value)))
  const filteredAthleteIds = new Set(scopedAthletes.map((athlete) => athlete.entryId))
  const filteredCompletedAthletes = new Set([...filteredAthleteIds].filter((id) => filteredProfileAthleteIds.has(id) && filteredPhysicalAthleteIds.has(id) && filteredMotorAthleteIds.has(id)))
  const totalAthletes = filteredAthleteIds.size
  const completedAthletes = filteredCompletedAthletes.size
  const pendingAthletes = Math.max(totalAthletes - completedAthletes, 0)
  const coverage = totalAthletes ? Math.round((completedAthletes / totalAthletes) * 100) : 0
  const formattedDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  const hasAthletes = totalAthletes > 0

  return (
    <PageHeader active="dashboard">
      <div className="@container/main">
        <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex flex-col gap-1">
            <div className="flex min-w-0 flex-col gap-1"><h1 className="text-3xl leading-none tracking-tight">Visão geral</h1><p className="text-sm capitalize text-muted-foreground">{formattedDate}</p></div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            {hasAthletes
              ? 'Baseado em atletas cadastrados com perfil, avaliação física e motora no filtro atual.'
              : 'Nenhum atleta foi encontrado no filtro atual. Ainda não há dados de perfil, física ou motora para esse conjunto.'}
          </div>
          <section className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
<KpiCard loading={profilesLoading || physicalLoading || motorLoading || athletesLoading} icon={<UserRound className="size-4" />} label="Atletas cadastrados" value={totalAthletes.toLocaleString('pt-BR')} description="Total de atletas no filtro ativo" />
<KpiCard loading={profilesLoading || physicalLoading || motorLoading || athletesLoading} icon={<Activity className="size-4" />} label="Cobertura geral" value={`${coverage}%`} description={`${completedAthletes.toLocaleString('pt-BR')} com perfil + física + motora`} info={<InfoTooltip label="O que é cobertura geral?" content={COMPLETION_EXPLANATION} />} />
<KpiCard loading={profilesLoading || physicalLoading || motorLoading || athletesLoading} icon={<BarChart3 className="size-4" />} label="Etapas concluídas" value={completedAthletes.toLocaleString('pt-BR')} description="Atletas com todos os blocos mínimos" />
<KpiCard loading={profilesLoading || physicalLoading || motorLoading || athletesLoading} icon={<Medal className="size-4" />} label="Pendências" value={pendingAthletes.toLocaleString('pt-BR')} description={pendingAthletes === 0 ? 'Nenhuma pendência' : 'Aguardando perfil, física ou motora'} />
          </section>
          <BrazilHeatmap loading={profilesLoading || physicalLoading || motorLoading || athletesLoading} values={stateValues} selectedState={selectedState} nationalAverage={nationalAverage} nationalStdDev={nationalStdDev} onSelect={setSelectedState} />
          <section className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <NavigationHub href="?view=motor" icon={<BarChart3 className="size-4" />} title="Raio-X técnico" description="Acrobacias, pé e solo." />
            <NavigationHub href="?view=physical" icon={<Dumbbell className="size-4" />} title="Perfil físico" description="Biometria, força e envergadura." />
            <NavigationHub href="?view=profiles" icon={<UserRound className="size-4" />} title="Contexto de prática" description="Clubes, projetos e frequência." />
            <NavigationHub href="?view=results" icon={<Share2 className="size-4" />} title="Inteligência e correlações" description="Vitórias e execução técnica." />
          </section>
        </main>
      </div>
    </PageHeader>
  )
}
