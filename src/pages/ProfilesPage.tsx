import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { BarRow } from '../components/BarRow'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { PageIntro } from '../components/PageIntro'
import { useApiData, useApiRows } from '../lib/api'
import { AthleteDetailPage } from './AthleteDetailPage'
import type { CompetitionAthlete, CompetitionRow, ProfileSummary } from '../types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ProfilesPage() {
  const { data: summary, loading } = useApiData<ProfileSummary>('/api/dashboard/profiles/summary')

  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)
  const [competitionId, setCompetitionId] = useState<string>('')
  const [search, setSearch] = useState('')

  const { rows: competitions, loading: competitionsLoading } = useApiRows<CompetitionRow>('/api/competitions')

  useEffect(() => {
    if (!competitionId && competitions.length > 0) {
      setCompetitionId(competitions[0].id)
    }
  }, [competitions, competitionId])

  const {
    rows: athletes,
    loading: athletesLoading,
    error: athletesError,
  } = useApiRows<CompetitionAthlete>(
    competitionId ? `/api/competitions/${competitionId}/athletes` : '/api/competitions/__none__/athletes',
    Boolean(competitionId)
  )

  const filteredAthletes = useMemo(
    () => athletes.filter((a) => a.athleteName.toLowerCase().includes(search.trim().toLowerCase())),
    [athletes, search]
  )

  if (selectedEntry) {
    return (
      <PageHeader active="profiles">
        <AthleteDetailPage
          entryId={selectedEntry}
          onBack={() => setSelectedEntry(null)}
        />
      </PageHeader>
    )
  }

  return (
    <PageHeader active="profiles">
      <PageIntro eyebrow="PERFIL DE ATLETAS" title="A base que constrói o atleta." text="Contexto de formação, tempo de prática e hábitos esportivos registrados nos eventos escolares." />
      <div className="@container/main">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-3.5 px-7 pb-3.5 @xl/main:grid-cols-4">
          <Metric label="Perfis coletados" value={loading ? '—' : String(summary?.totalProfiles ?? 0)} />
          <Metric label="Locais de prática" value={loading ? '—' : String(summary?.practiceLocationsCount ?? 0)} />
          <Metric label="Praticam outra modalidade" value={loading ? '—' : String(summary?.practicesOtherSport ?? 0)} />
          <Metric label="Estados na base" value={loading ? '—' : String(summary?.statesCount ?? 0)} />
        </div>
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-3.5 px-7 pb-9 @xl/main:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-bold tracking-wide">EXPERIÊNCIA</CardDescription>
              <CardTitle>Tempo de prática</CardTitle>
            </CardHeader>
            <CardContent>
              {(summary?.byPracticeTime ?? []).map(({ code, label, count }) => (
                <BarRow key={code} label={label} value={count} total={summary!.totalProfiles} />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-bold tracking-wide">FORMAÇÃO</CardDescription>
              <CardTitle>Onde treinam</CardTitle>
            </CardHeader>
            <CardContent>
              {(summary?.byPracticeLocation ?? []).map(({ code, label, count }) => (
                <BarRow key={code} label={label} value={count} total={summary!.totalProfiles} />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-bold tracking-wide">ROTINA</CardDescription>
              <CardTitle>Frequência semanal de treino</CardTitle>
            </CardHeader>
            <CardContent>
              {(summary?.byWeeklyFrequency ?? []).map(({ code, label, count }) => (
                <BarRow key={code} label={label} value={count} total={summary!.totalProfiles} />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mx-auto max-w-[1200px] px-7 pb-14">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-4 [.border-b]:pb-4">
              <div className="flex flex-col gap-3 @xl/main:flex-row @xl/main:items-center @xl/main:justify-between">
                <div>
                  <CardTitle>Atletas por competição</CardTitle>
                  <CardDescription>Busque e veja o perfil detalhado de cada atleta</CardDescription>
                </div>
                <div className="flex flex-col gap-2 @xl/main:flex-row">
                  <Select value={competitionId} onValueChange={setCompetitionId} disabled={competitionsLoading}>
                    <SelectTrigger className="w-56" aria-label="Selecionar competição">
                      <SelectValue placeholder="Competição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {competitions.map((competition) => (
                          <SelectItem key={competition.id} value={competition.id}>
                            {competition.name} · {competition.year}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar atleta..."
                      className="w-56 pl-8"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Estilo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>UF</TableHead>
                    <TableHead>Sexo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {athletesError ? (
                    <TableRow><TableCell colSpan={5} className="text-destructive">Não foi possível carregar os atletas.</TableCell></TableRow>
                  ) : athletesLoading ? (
                    <TableRow><TableCell colSpan={5}>Carregando atletas...</TableCell></TableRow>
                  ) : filteredAthletes.length === 0 ? (
                    <TableRow><TableCell colSpan={5}>Nenhum atleta encontrado.</TableCell></TableRow>
                  ) : (
                    filteredAthletes.slice(0, 30).map((athlete) => (
                      <TableRow
                        key={athlete.entryId}
                        className="cursor-pointer"
                        onClick={() => setSelectedEntry(athlete.entryId)}
                        title="Ver perfil do atleta"
                      >
                        <TableCell className="font-medium">{athlete.athleteName}</TableCell>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </PageHeader>
  )
}
