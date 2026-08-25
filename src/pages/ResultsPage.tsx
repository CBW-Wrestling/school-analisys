import { Medal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Metric } from '../components/Metric'
import { PageHeader } from '../components/PageHeader'
import { useApiRows } from '../lib/api'
import { AthleteDetailPage } from './AthleteDetailPage'
import type { CompetitionRow, ResultRow } from '../types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ResultsPage() {
  const [competitionId, setCompetitionId] = useState<string>('')
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)

  const {
    rows: competitions,
    loading: competitionsLoading,
    error: competitionsError,
  } = useApiRows<CompetitionRow>('/api/competitions')

  useEffect(() => {
    if (!competitionId && competitions.length > 0) {
      setCompetitionId(competitions[0].id)
    }
  }, [competitions, competitionId])

  const {
    rows,
    loading: resultsLoading,
    error: resultsError,
  } = useApiRows<ResultRow>(
    competitionId ? `/api/results?competitionId=${competitionId}` : '/api/results',
    Boolean(competitionId)
  )

  const selectedCompetition = useMemo(
    () => competitions.find((c) => c.id === competitionId),
    [competitions, competitionId]
  )

  if (selectedEntry) {
    return (
      <PageHeader active="results">
        <AthleteDetailPage
          entryId={selectedEntry}
          onBack={() => setSelectedEntry(null)}
        />
      </PageHeader>
    )
  }

  const fights = rows.reduce((total, row) => total + Number(row.countFights || 0), 0)
  const statesCount = new Set(rows.map((row) => row.teamAlternateName)).size
  const categories = new Set(rows.map((row) => row.weightCategoryShortName)).size
  const loading = competitionsLoading || resultsLoading

  return (
    <PageHeader active="results">
      <div className="@container/main">
        <section className="mx-auto max-w-[1200px] px-7 pt-14 pb-9">
          <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground">RESULTADOS OFICIAIS</p>
          <h1 className="font-heading text-4xl font-semibold text-foreground">
            Classificações que contam
            <br />
            <em className="not-italic">a história no tapete.</em>
          </h1>
          <p className="mt-3 max-w-[590px] text-sm leading-relaxed text-muted-foreground">
            Dados de desempenho e pódio consolidados a partir
            dos resultados dos Jogos Escolares.
          </p>
        </section>

        <section className="mx-auto max-w-[1200px] px-7 pb-14">
          <div className="mb-4 flex flex-col items-start justify-between gap-3 @xl/main:flex-row @xl/main:items-end">
            <div>
              <p className="mb-1 text-xs font-bold tracking-wide text-muted-foreground">RANKING POR EVENTO</p>
              <h2 className="font-heading text-2xl font-semibold text-foreground">Atletas classificados</h2>
            </div>

            <Select
              value={competitionId}
              onValueChange={setCompetitionId}
              disabled={competitionsLoading}
            >
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
          </div>

          {competitionsError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>Não foi possível carregar as competições.</AlertDescription>
            </Alert>
          )}
          {resultsError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>Não foi possível carregar os resultados.</AlertDescription>
            </Alert>
          )}

          <div className="mb-3.5 grid grid-cols-2 gap-3.5 @xl/main:grid-cols-4">
            <Metric label="Atletas classificados" value={loading ? '—' : String(rows.length)} />
            <Metric label="Lutas registradas" value={loading ? '—' : String(fights)} />
            <Metric label="Categorias de peso" value={loading ? '—' : String(categories)} />
            <Metric label="Estados representados" value={loading ? '—' : String(statesCount)} />
          </div>

          <div className="grid grid-cols-1 gap-3.5 @4xl/main:grid-cols-[7fr_3fr]">
            <Card className="gap-0 py-0">
              <CardHeader className="border-b py-4 [.border-b]:pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>Classificação geral</CardTitle>
                    <CardDescription>
                      {selectedCompetition
                        ? 'Ordenada por posição na categoria'
                        : 'Selecione uma competição'}
                    </CardDescription>
                  </div>
                  {selectedCompetition && <Badge variant="outline">{selectedCompetition.code}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto px-0">
                <Table>
                  <TableCaption className="sr-only">
                    Classificação dos atletas do evento selecionado
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pos.</TableHead>
                      <TableHead>Atleta</TableHead>
                      <TableHead>UF</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>V-D</TableHead>
                      <TableHead>Pontos técnicos</TableHead>
                      <TableHead>Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultsLoading ? (
                      <TableRow><TableCell colSpan={7}>Carregando resultados...</TableCell></TableRow>
                    ) : rows.length === 0 ? (
                      <TableRow><TableCell colSpan={7}>Nenhum resultado encontrado.</TableCell></TableRow>
                    ) : (
                      rows.slice(0, 18).map((row) => (
                        <TableRow
                          key={row.entryId}
                          className="cursor-pointer"
                          onClick={() => setSelectedEntry(row.entryId)}
                          title="Ver detalhe do atleta"
                        >
                          <TableCell className="text-muted-foreground">{row.rank}</TableCell>
                          <TableCell className="font-medium">{row.fullName}</TableCell>
                          <TableCell className="text-muted-foreground">{row.teamAlternateName}</TableCell>
                          <TableCell>{row.weightCategoryShortName}</TableCell>
                          <TableCell>{row.wins}-{row.losses}</TableCell>
                          <TableCell className="font-mono">{row.technicalPointsFor}</TableCell>
                          <TableCell className="font-mono">
                            {row.technicalPointsDiff != null && row.technicalPointsDiff >= 0
                              ? `+${row.technicalPointsDiff}`
                              : row.technicalPointsDiff}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription className="text-xs font-bold tracking-wide">DESTAQUES</CardDescription>
                <CardTitle>Ouro por categoria</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {resultsLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : rows.filter((row) => row.rank === 1).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum campeão encontrado.</p>
                ) : (
                  rows
                    .filter((row) => row.rank === 1)
                    .slice(0, 4)
                    .map((row, index) => (
                      <div
                        className="flex items-center gap-3"
                        key={`${row.fullName}-${row.weightCategoryShortName}`}
                      >
                        <span className="font-mono text-sm text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                        <div className="flex-1">
                          <strong className="block text-sm font-medium">{row.fullName}</strong>
                          <small className="text-xs text-muted-foreground">
                            {row.teamAlternateName}
                            {' · '}
                            {row.weightCategoryShortName}
                          </small>
                        </div>
                        <Medal className="size-4 text-muted-foreground" aria-hidden="true" />
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageHeader>
  )
}