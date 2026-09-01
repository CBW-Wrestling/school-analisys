import { useMemo, useState } from 'react'
import { Activity, ArrowRight, BarChart3, Dumbbell, Medal, Share2, UserRound } from 'lucide-react'
import { FilterDropdown } from '../components/FilterDropdown'
import { PageHeader } from '../components/PageHeader'
import { SearchableSelect } from '../components/SearchableSelect'
import { BrazilHeatmap } from '../components/dashboard/BrazilHeatmap'
import { useApiRows } from '../lib/api'
import { scoreFor } from '../lib/motorScore'
import { meanAndStdDev } from '../lib/zscore'
import type { CompetitionRow, MotorRow, PhysicalRow, ProfileRow, ResultRow } from '../types'
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
  const hasActiveFilter = year !== 'all' || event !== 'all' || style.length > 0

  return (
    <div className="flex flex-wrap items-end justify-start gap-2 @3xl/main:justify-end">
        <SearchableSelect className="w-36" triggerId="dashboard-year" placeholder="Todos os anos" value={year} onChange={onYearChange} options={[{ value: 'all', label: 'Todos os anos' }, ...years.map((value) => ({ value: String(value), label: String(value) }))]} />
        <SearchableSelect className="w-52" triggerId="dashboard-event" placeholder="Todos os eventos" value={event} onChange={onEventChange} options={[{ value: 'all', label: 'Todos os eventos' }, ...events.map((item) => ({ value: item.code, label: item.name }))]} />
        <FilterDropdown label="Estilos" options={styles.map((value) => ({ value, label: value }))} value={style} onChange={onStyleChange} />
        <Button size="sm" variant="outline" disabled={!hasActiveFilter} onClick={() => { onYearChange('all'); onEventChange('all'); onStyleChange([]) }}>Limpar</Button>
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
  const { rows: competitions, loading: competitionsLoading } = useApiRows<CompetitionRow>('/api/competitions')
  const { rows: profiles, loading: profilesLoading } = useApiRows<ProfileRow>('/api/dashboard/profiles')
  const { rows: physical, loading: physicalLoading } = useApiRows<PhysicalRow>('/api/dashboard/physical')
  const { rows: motor, loading: motorLoading } = useApiRows<MotorRow>('/api/dashboard/motor')
  const [year, setYear] = useState('all')
  const [event, setEvent] = useState('all')
  const [style, setStyle] = useState<string[]>([])
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const selectedEvent = event === 'all' ? 'all' : event
  const events = useMemo(() => year === 'all' ? competitions : competitions.filter((item) => String(item.year) === year), [competitions, year])
  const baseProfiles = profiles.filter((row) => matchesFilters(row, selectedEvent, style, null))
  const basePhysical = physical.filter((row) => matchesFilters(row, selectedEvent, style, null))
  const baseMotor = motor.filter((row) => matchesFilters(row, selectedEvent, style, null))
  const filteredResultsPath = event !== 'all' ? `/api/results?competitionId=${encodeURIComponent(competitions.find((item) => item.code === event)?.id ?? event)}` : ''
  const { rows: results } = useApiRows<ResultRow>(filteredResultsPath, event !== 'all')
  const styles = useMemo(() => [...new Set([...profiles, ...physical, ...motor].map((row) => row.estilo).filter((value): value is string => Boolean(value)))].sort(), [profiles, physical, motor])
  const stateValues = useMemo(() => {
    const stateCodes = [...new Set(baseProfiles.map((row) => row.estado).filter((value): value is string => Boolean(value)))]
    return stateCodes.map((code) => {
      const stateMotor = baseMotor.filter((row) => row.estado === code)
      const scored = stateMotor.map((row) => scoreFor(row.resultado))
      const stateProfiles = baseProfiles.filter((row) => row.estado === code)
      const statePhysical = basePhysical.filter((row) => row.estado === code)
      return {
        code,
        name: code,
        count: stateProfiles.length,
        score: scored.length ? scored.reduce((sum, value) => sum + value, 0) / scored.length : null,
        engagement: stateProfiles.length ? Math.round((statePhysical.length / stateProfiles.length) * 100) : 0,
        dimensions: dimensions.map((dimension) => {
          const dimensionScores = stateMotor.filter((row) => dimension.matches(row.competencia ?? '')).map((row) => scoreFor(row.resultado))
          return { label: dimension.label, score: dimensionScores.length ? dimensionScores.reduce((sum, value) => sum + value, 0) / dimensionScores.length : null }
        }),
      }
    })
  }, [baseMotor, basePhysical, baseProfiles])
  const nationalScores = baseMotor.map((row) => scoreFor(row.resultado))
  const { mean: nationalAverage, stdDev: nationalStdDev } = meanAndStdDev(nationalScores)
  const averageScore = nationalAverage
  const completion = baseProfiles.length ? Math.round((basePhysical.length / baseProfiles.length) * 100) : 0
  const medals = event === 'all' ? null : results.filter((row) => row.rank !== null && row.rank <= 3).length
  const formattedDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

  return (
    <PageHeader active="dashboard">
      <div className="@container/main">
        <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex flex-col gap-4 @3xl/main:flex-row @3xl/main:items-end @3xl/main:justify-between">
            <div className="flex min-w-0 flex-col gap-1"><h1 className="text-3xl leading-none tracking-tight">Visão geral</h1><p className="text-sm capitalize text-muted-foreground">{formattedDate}</p></div>
            <FilterBar competitions={competitions} events={events} styles={styles} year={year} event={event} style={style} onYearChange={(value) => { setYear(value); setEvent('all') }} onEventChange={setEvent} onStyleChange={setStyle} />
          </div>
          <section className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <KpiCard loading={profilesLoading} icon={<UserRound className="size-4" />} label="Atletas avaliados" value={baseProfiles.length.toLocaleString('pt-BR')} description="Perfis socioesportivos na seleção" />
            <KpiCard loading={profilesLoading || physicalLoading} icon={<Activity className="size-4" />} label="Compleção da amostra" value={`${completion}%`} description="Avaliações físicas sobre perfis" />
            <KpiCard loading={motorLoading} icon={<BarChart3 className="size-4" />} label="Média técnica" value={averageScore === null ? '—' : averageScore.toFixed(2).replace('.', ',')} description="Escala técnica média" />
            <KpiCard loading={event !== 'all' && competitionsLoading} icon={<Medal className="size-4" />} label="Medalhas" value={medals === null ? '—' : medals.toLocaleString('pt-BR')} description={medals === null ? 'Selecione um evento' : 'Pódios no evento selecionado'} />
          </section>
          <BrazilHeatmap loading={profilesLoading || physicalLoading || motorLoading} values={stateValues} selectedState={selectedState} nationalAverage={nationalAverage} nationalStdDev={nationalStdDev} onSelect={setSelectedState} />
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
