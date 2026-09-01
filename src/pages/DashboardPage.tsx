import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, ArrowRight, BarChart3, Dumbbell, Medal, Share2, UserRound } from 'lucide-react'
import { FilterDropdown } from '../components/FilterDropdown'
import { PageHeader } from '../components/PageHeader'
import { SearchableSelect } from '../components/SearchableSelect'
import { BrazilHeatmap } from '../components/dashboard/BrazilHeatmap'
import { useApiData, useApiRows } from '../lib/api'
import { scoreFor, visibleMotorRows } from '../lib/motorScore'
import { meanAndStdDev } from '../lib/zscore'
import type { CompetitionAthlete, CompetitionRow, HomeSummary, MotorRow, PhysicalRow, ProfileRow } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const dimensions = [
  { label: 'Acrobacias', matches: (value: string) => /acrob/i.test(value) },
  { label: 'Técnicas de solo', matches: (value: string) => /solo|ch[aã]o/i.test(value) },
  { label: 'Técnicas em pé', matches: (value: string) => /(^|\s)p[eé](\s|$)|em p[eé]/i.test(value) },
]

function matchesFilters(row: { eventIdentifier: string | null; estilo?: string | null; estado?: string | null }, event: string, styles: string[], state: string | null) {
  return (event === 'all' || row.eventIdentifier === event) && (styles.length === 0 || styles.includes(row.estilo ?? '')) && (!state || row.estado === state)
}

function FilterBar({ competitions, events, styles, year, event, style, onYearChange, onEventChange, onStyleChange }: {
  competitions: CompetitionRow[]
  events: CompetitionRow[]
  styles: string[]
  year: string
  event: string
  style: string[]
  onYearChange: (value: string) => void
  onEventChange: (value: string) => void
  onStyleChange: (value: string[]) => void
}) {
  const years = [...new Set(competitions.map((item) => item.year).filter((item): item is number => item !== null))].sort((a, b) => b - a)
  const stylesAtDefault = style.length === styles.length && styles.every((value) => style.includes(value))
  const hasActiveFilter = year !== 'all' || event !== 'all' || !stylesAtDefault

  return (
    <div className="flex flex-wrap items-end justify-start gap-2 @3xl/main:justify-end">
        <SearchableSelect className="w-36" triggerId="dashboard-year" placeholder="Todos os anos" value={year} onChange={onYearChange} options={[{ value: 'all', label: 'Todos os anos' }, ...years.map((value) => ({ value: String(value), label: String(value) }))]} />
        <SearchableSelect className="w-52" triggerId="dashboard-event" placeholder="Todos os eventos" value={event} onChange={onEventChange} options={[{ value: 'all', label: 'Todos os eventos' }, ...events.map((item) => ({ value: item.code, label: item.name }))]} />
        <FilterDropdown label="Estilos" options={styles.map((value) => ({ value, label: value }))} value={style} onChange={onStyleChange} />
        <Button size="sm" variant="outline" disabled={!hasActiveFilter} onClick={() => { onYearChange('all'); onEventChange('all'); onStyleChange(styles) }}>Limpar</Button>
    </div>
  )
}

function KpiCard({ icon, label, value, description, loading }: { icon: React.ReactNode; label: string; value: string; description: string; loading?: boolean }) {
  return (
    <Card className="min-w-0 bg-linear-to-t from-primary/5 to-card shadow-xs">
      <CardHeader className="gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg border bg-muted text-muted-foreground">{icon}</div>
        <CardDescription>{label}</CardDescription>
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
    <a href={href} className="group flex min-h-28 flex-col justify-between rounded-lg border bg-card p-4 no-underline transition-colors hover:bg-muted/50">
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
  const { data: homeSummary, loading: homeSummaryLoading } = useApiData<HomeSummary>('/api/dashboard/home/summary')
  const { rows: profiles, loading: profilesLoading } = useApiRows<ProfileRow>('/api/dashboard/profiles')
  const { rows: physical, loading: physicalLoading } = useApiRows<PhysicalRow>('/api/dashboard/physical')
  const { rows: motor, loading: motorLoading } = useApiRows<MotorRow>('/api/dashboard/motor')
  const [year, setYear] = useState('all')
  const [event, setEvent] = useState('all')
  const [style, setStyle] = useState<string[]>([])
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const stylesInitialized = useRef(false)
  const selectedEvent = event === 'all' ? 'all' : event
  const selectedCompetition = event === 'all' ? null : competitions.find((competition) => competition.code === event)
  const { rows: competitionAthletes, loading: competitionAthletesLoading } = useApiRows<CompetitionAthlete>(
    selectedCompetition ? `/api/competitions/${encodeURIComponent(selectedCompetition.code)}/athletes` : '',
    Boolean(selectedCompetition),
  )
  const events = useMemo(() => year === 'all' ? competitions : competitions.filter((item) => String(item.year) === year), [competitions, year])
  const baseProfiles = profiles.filter((row) => matchesFilters(row, selectedEvent, style, null))
  const basePhysical = physical.filter((row) => matchesFilters(row, selectedEvent, style, null))
  const baseMotor = visibleMotorRows(motor.filter((row) => matchesFilters(row, selectedEvent, style, null)))
  const styles = useMemo(() => [...new Set([...profiles, ...physical, ...motor].map((row) => row.estilo).concat(competitionAthletes.map((athlete) => athlete.style)).filter((value): value is string => Boolean(value)))].sort(), [profiles, physical, motor, competitionAthletes])
  const filteredCompetitionAthletes = useMemo(() => competitionAthletes.filter((athlete) => style.length === 0 || style.includes(athlete.style)), [competitionAthletes, style])

  useEffect(() => {
    if (!stylesInitialized.current && styles.length > 0) {
      stylesInitialized.current = true
      setStyle(styles)
    }
  }, [styles])

  const stateValues = useMemo(() => {
    const stateCodes = [...new Set((selectedCompetition ? filteredCompetitionAthletes.map((athlete) => athlete.state) : baseProfiles.map((row) => row.estado)).filter((value): value is string => Boolean(value)))]
    return stateCodes.map((code) => {
      const stateMotor = baseMotor.filter((row) => row.estado === code)
      const scored = stateMotor.map((row) => scoreFor(row.resultado))
      const stateProfiles = baseProfiles.filter((row) => row.estado === code)
      const statePhysical = basePhysical.filter((row) => row.estado === code)
      const stateProfileIds = new Set(stateProfiles.map((row) => row.athleteEntryId).filter((value): value is string => Boolean(value)))
      const statePhysicalIds = new Set(statePhysical.map((row) => row.athleteEntryId).filter((value): value is string => Boolean(value)))
      const stateAthleteIds = selectedCompetition
        ? new Set(filteredCompetitionAthletes.filter((athlete) => athlete.state === code).map((athlete) => athlete.entryId))
        : stateProfileIds
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
  }, [baseMotor, basePhysical, baseProfiles, filteredCompetitionAthletes, selectedCompetition])
  const validMotorRows = visibleMotorRows(baseMotor)
  const nationalScores = validMotorRows.map((row) => scoreFor(row.resultado))
  const { mean: nationalAverage, stdDev: nationalStdDev } = meanAndStdDev(nationalScores)
  const filteredProfileAthleteIds = new Set(baseProfiles.map((row) => row.athleteEntryId).filter((value): value is string => Boolean(value)))
  const filteredPhysicalAthleteIds = new Set(basePhysical.map((row) => row.athleteEntryId).filter((value): value is string => Boolean(value)))
  const filteredMotorAthleteIds = new Set(baseMotor.map((row) => row.athleteEntryId).filter((value): value is string => Boolean(value)))
  const filteredAthleteIds = selectedCompetition
    ? new Set(filteredCompetitionAthletes.map((athlete) => athlete.entryId))
    : new Set([...filteredProfileAthleteIds, ...filteredPhysicalAthleteIds, ...filteredMotorAthleteIds])
  const filteredCompletedAthletes = new Set([...filteredAthleteIds].filter((id) => filteredProfileAthleteIds.has(id) && filteredPhysicalAthleteIds.has(id) && filteredMotorAthleteIds.has(id)))
  const totalAthletesFromFilter = new Set([...filteredProfileAthleteIds, ...filteredPhysicalAthleteIds, ...filteredMotorAthleteIds]).size

  const totalAthletes = selectedCompetition ? filteredAthleteIds.size : year === 'all' && event === 'all' && style.length === 0 ? (homeSummary?.totalAthletes ?? totalAthletesFromFilter) : totalAthletesFromFilter
  const completedAthletes = selectedCompetition ? filteredCompletedAthletes.size : year === 'all' && event === 'all' && style.length === 0 ? (homeSummary?.completedAthletes ?? filteredCompletedAthletes.size) : filteredCompletedAthletes.size
  const pendingAthletes = selectedCompetition ? Math.max(totalAthletes - completedAthletes, 0) : year === 'all' && event === 'all' && style.length === 0 ? (homeSummary?.pendingAthletes ?? Math.max(totalAthletes - completedAthletes, 0)) : Math.max(totalAthletes - completedAthletes, 0)
  const coverage = selectedCompetition ? (totalAthletes ? Math.round((completedAthletes / totalAthletes) * 100) : 0) : year === 'all' && event === 'all' && style.length === 0 ? (homeSummary?.completionRate ?? (totalAthletes ? Math.round((completedAthletes / totalAthletes) * 100) : 0)) : (totalAthletes ? Math.round((completedAthletes / totalAthletes) * 100) : 0)
  const formattedDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  const hasAthletes = totalAthletes > 0

  return (
    <PageHeader active="dashboard">
      <div className="@container/main">
        <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex flex-col gap-4 @3xl/main:flex-row @3xl/main:items-end @3xl/main:justify-between">
            <div className="flex min-w-0 flex-col gap-1"><h1 className="text-3xl leading-none tracking-tight">Visão geral</h1><p className="text-sm capitalize text-muted-foreground">{formattedDate}</p></div>
            <FilterBar competitions={competitions} events={events} styles={styles} year={year} event={event} style={style} onYearChange={(value) => { setYear(value); setEvent('all') }} onEventChange={setEvent} onStyleChange={setStyle} />
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            {hasAthletes
              ? 'Baseado em atletas cadastrados com perfil, avaliação física e motora no filtro atual.'
              : 'Nenhum atleta foi encontrado no filtro atual. Ainda não há dados de perfil, física ou motora para esse conjunto.'}
          </div>
          <section className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <KpiCard loading={homeSummaryLoading || profilesLoading || physicalLoading || motorLoading || competitionAthletesLoading} icon={<UserRound className="size-4" />} label="Atletas cadastrados" value={totalAthletes.toLocaleString('pt-BR')} description="Total de atletas no filtro ativo" />
            <KpiCard loading={homeSummaryLoading || profilesLoading || physicalLoading || motorLoading || competitionAthletesLoading} icon={<Activity className="size-4" />} label="Cobertura geral" value={`${coverage}%`} description={`${completedAthletes.toLocaleString('pt-BR')} com perfil + física + motora`} />
            <KpiCard loading={homeSummaryLoading || profilesLoading || physicalLoading || motorLoading || competitionAthletesLoading} icon={<BarChart3 className="size-4" />} label="Etapas concluídas" value={completedAthletes.toLocaleString('pt-BR')} description="Atletas com todos os blocos mínimos" />
            <KpiCard loading={homeSummaryLoading || profilesLoading || physicalLoading || motorLoading || competitionAthletesLoading} icon={<Medal className="size-4" />} label="Pendências" value={pendingAthletes.toLocaleString('pt-BR')} description={pendingAthletes === 0 ? 'Nenhuma pendência' : 'Aguardando perfil, física ou motora'} />
          </section>
          <BrazilHeatmap loading={profilesLoading || physicalLoading || motorLoading || competitionAthletesLoading} values={stateValues} selectedState={selectedState} nationalAverage={nationalAverage} nationalStdDev={nationalStdDev} onSelect={setSelectedState} />
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
