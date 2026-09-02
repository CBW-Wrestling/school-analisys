import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { AthleteCell } from '../components/AthleteCell'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { useApiRows } from '../lib/api'
import { competitionCodesForScope, useReportingScope, useScopedCompetitionAthletes, withReportingScope } from '../lib/reportingScope'
import { AthleteDetailPage } from './AthleteDetailPage'
import type { CompetitionRow, CountByCode, EnumOption, ProfileRow } from '../types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function DistributionChart({ data, loading, title }: { data: CountByCode[]; loading: boolean; title: string }) {
  if (loading) return <Skeleton className="h-56 w-full rounded-lg" />
  if (!data.length) return <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma informação registrada no recorte global.</p>

  return (
    <>
      <ChartContainer config={{ count: { label: 'Atletas', color: 'var(--chart-2)' } }} className="aspect-auto h-56 w-full" aria-label={title}>
        <BarChart data={data.map(({ label, count }) => ({ label, count }))} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={8} interval={0} angle={-18} textAnchor="end" height={54} />
          <YAxis axisLine={false} tickLine={false} width={32} allowDecimals={false} />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="count" name="Atletas" fill="var(--chart-2)" radius={4} animationDuration={850} animationEasing="ease-out" />
        </BarChart>
      </ChartContainer>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead><tr><th scope="col">Categoria</th><th scope="col">Atletas</th></tr></thead>
        <tbody>{data.map(({ code, label, count }) => <tr key={code}><th scope="row">{label}</th><td>{count}</td></tr>)}</tbody>
      </table>
    </>
  )
}

function AthleteTableSkeleton() {
  return Array.from({ length: 6 }, (_, index) => (
    <TableRow key={`skeleton-${index}`}>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
    </TableRow>
  ))
}

export function ProfilesPage() {
  const [selectedEntry, setSelectedEntry] = useState<string | null>(() => new URLSearchParams(window.location.search).get('athlete'))
  const [search, setSearch] = useState('')
  const listHeadingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const handlePopState = () => setSelectedEntry(new URLSearchParams(window.location.search).get('athlete'))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function backToList() {
    const params = new URLSearchParams(window.location.search)
    params.delete('athlete')
    window.history.pushState({}, '', `?${params.toString()}`)
    setSelectedEntry(null)
    window.setTimeout(() => listHeadingRef.current?.focus(), 0)
  }

  const { rows: competitions, loading: competitionsLoading } = useApiRows<CompetitionRow>('/api/competitions')
  const { rows: profileRows, loading: profilesLoading } = useApiRows<ProfileRow>('/api/dashboard/profiles')
  const { rows: practiceTimes } = useApiRows<EnumOption>('/api/enums/practice-times')
  const { rows: practiceLocations } = useApiRows<EnumOption>('/api/enums/practice-locations')
  const { rows: weeklyFrequencies } = useApiRows<EnumOption>('/api/enums/weekly-frequencies')
  const { scope } = useReportingScope()
  const { athletes, loading: athletesLoading } = useScopedCompetitionAthletes(scope, competitions)
  const scopedCompetitionCodes = useMemo(() => competitionCodesForScope(scope, competitions), [scope, competitions])
  const scopedProfiles = useMemo(() => profileRows.filter((row) => scopedCompetitionCodes.includes(row.eventIdentifier ?? '') && scope.styles.includes(row.estilo ?? '')), [profileRows, scopedCompetitionCodes, scope.styles])
  const practiceTimeLabels = useMemo(() => new Map(practiceTimes.map(({ code, label }) => [code, label])), [practiceTimes])
  const practiceLocationLabels = useMemo(() => new Map(practiceLocations.map(({ code, label }) => [code, label])), [practiceLocations])
  const weeklyFrequencyLabels = useMemo(() => new Map(weeklyFrequencies.map(({ code, label }) => [code, label])), [weeklyFrequencies])
  const countBy = (field: keyof ProfileRow, labels?: Map<string, string>): CountByCode[] => [...new Set(scopedProfiles.map((row) => row[field]).filter((value): value is string => Boolean(value)))].map((value) => ({ code: value, label: labels?.get(value) ?? value, count: scopedProfiles.filter((row) => row[field] === value).length })).sort((first, second) => second.count - first.count)
  const profilesLoadingForScope = profilesLoading || competitionsLoading
  const profileAthleteIds = new Set(scopedProfiles.map((row) => row.athleteEntryId).filter((value): value is string => Boolean(value)))
  const otherSportCount = scopedProfiles.filter((row) => row.flagOutraModalidade === 'sim').length

  const filteredAthletes = useMemo(
    () => athletes.filter((a) => a.athleteName.toLowerCase().includes(search.trim().toLowerCase())),
    [athletes, search]
  )

  if (selectedEntry) {
    return (
      <PageHeader active="profiles">
        <AthleteDetailPage
          entryId={selectedEntry}
          onBack={backToList}
          backLabel="Atletas"
        />
      </PageHeader>
    )
  }

  return (
    <PageHeader active="profiles">
      <div className="@container/main">
        <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex flex-col gap-1">
            <h1 ref={listHeadingRef} tabIndex={-1} className="text-3xl leading-none tracking-tight">A base que constrói o atleta.</h1>
            <p className="max-w-[640px] text-sm text-muted-foreground">Contexto de formação, tempo de prática e hábitos esportivos registrados nos eventos escolares.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 @xl/main:grid-cols-4">
            <Metric label="Perfis coletados" value={profilesLoadingForScope ? '—' : String(profileAthleteIds.size)} />
            <Metric label="Locais de prática" value={profilesLoadingForScope ? '—' : String(countBy('localPratica').length)} />
            <Metric label="Praticam outra modalidade" value={profilesLoadingForScope ? '—' : String(otherSportCount)} />
            <Metric label="Estados na base" value={profilesLoadingForScope ? '—' : String(countBy('estado').length)} />
          </div>

          <div className="grid grid-cols-1 gap-4 @lg/main:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tempo de prática</CardTitle>
            </CardHeader>
            <CardContent>
              <DistributionChart title="Distribuição de atletas por tempo de prática" data={countBy('tempoPratica', practiceTimeLabels)} loading={profilesLoadingForScope} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Onde treinam</CardTitle>
            </CardHeader>
            <CardContent>
              <DistributionChart title="Distribuição de atletas por local de treino" data={countBy('localPratica', practiceLocationLabels)} loading={profilesLoadingForScope} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Frequência semanal de treino</CardTitle>
            </CardHeader>
            <CardContent>
              <DistributionChart title="Distribuição de atletas por frequência semanal de treino" data={countBy('frequenciaSemanal', weeklyFrequencyLabels)} loading={profilesLoadingForScope} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Prática de outra modalidade</CardTitle>
              <p className="text-xs text-muted-foreground">Indica se os atletas registraram a prática de outro esporte.</p>
            </CardHeader>
            <CardContent>
              <DistributionChart title="Distribuição de atletas que praticam outra modalidade" data={countBy('flagOutraModalidade', new Map([['sim', 'Sim'], ['nao', 'Não']]))} loading={profilesLoadingForScope} />
            </CardContent>
          </Card>
          </div>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-4 [.border-b]:pb-4">
              <div className="flex flex-col gap-3 @xl/main:flex-row @xl/main:items-center @xl/main:justify-between">
                <div>
                  <CardTitle>Atletas no recorte global</CardTitle>
                  <CardDescription>Busque e veja o perfil detalhado de cada atleta</CardDescription>
                </div>
                <div className="flex flex-col gap-2 @xl/main:flex-row">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar atleta..."
                      aria-label="Buscar atleta"
                      className="w-56 pl-8"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-0">
              <div className="overflow-x-auto">
              <Table className="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4 **:data-[slot='table-cell']:py-4">
                <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-medium **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
                  <TableRow>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Estilo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>UF</TableHead>
                    <TableHead>Sexo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-row']:hover:bg-muted/30">
                  {athletesLoading || competitionsLoading ? (
                    <AthleteTableSkeleton />
                  ) : filteredAthletes.length === 0 ? (
                    <TableRow><TableCell colSpan={5}>Nenhum atleta encontrado.</TableCell></TableRow>
                  ) : (
                    filteredAthletes.slice(0, 30).map((athlete) => (
                      <TableRow
                        key={athlete.entryId}
                        className="hover:bg-muted/30"
                      >
<TableCell className="font-medium"><Button variant="link" className="h-auto p-0 font-medium" asChild><a href={withReportingScope(`?view=profiles&athlete=${encodeURIComponent(athlete.entryId)}`)}>{athlete.athleteName}</a></Button></TableCell>
                        <TableCell className="text-muted-foreground">{athlete.style}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{athlete.ageCategoryCode} · {athlete.weight}kg</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{athlete.state}</TableCell>
                        <TableCell className="text-muted-foreground">{athlete.gender === 'M' ? 'M' : 'F'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
              <p className="px-4 pb-1 text-sm text-muted-foreground">Visualizando {filteredAthletes.length.toLocaleString('pt-BR')} atletas encontrados</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </PageHeader>
  )
}
