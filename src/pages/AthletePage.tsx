import { AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { Fragment, useState } from 'react'
import { DetailSectionCard } from '../components/AthleteDetailSections'
import { initialsFor } from '../lib/athleteDetail'
import { EntryFightsCard } from '../components/EntryFightsCard'
import { PageHeader } from '../components/PageHeader'
import { useApiData } from '../lib/api'
import type { AthleteDetail, AthleteHistory, AthleteHistoryEntry, Series } from '../types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const SERIES_LABEL: Record<Series, string> = { OURO: 'Ouro', PRATA: 'Prata', BRONZE: 'Bronze' }

function competitionLabel(entry: AthleteHistoryEntry) {
  const c = entry.competition
  return c.series ? `${c.parentName ?? c.name} · ${SERIES_LABEL[c.series]}` : c.name
}

function placement(entry: AthleteHistoryEntry) {
  if (entry.rank != null) return `${entry.rank}º`
  return entry.isNotRanked ? 'NC' : '—'
}

// Avaliações da inscrição (perfil, físico, técnico); o resultado já está na linha do histórico.
function EntryAssessments({ entry }: { entry: AthleteHistoryEntry }) {
  const { data, loading, error } = useApiData<AthleteDetail>(`/api/athletes/entries/${encodeURIComponent(entry.entryId)}`)
  if (loading) return <div className="flex justify-center py-4"><Spinner /></div>
  if (error || !data) return <p className="text-sm text-muted-foreground">Não foi possível carregar as avaliações.</p>
  const sections = data.sections.filter((section) => section.icon !== 'medal')
  return (
    <div className="flex flex-col gap-3">
      {entry.assessmentFromPrincipal && (
        <Badge variant="secondary" className="self-start">Avaliação da Série Ouro</Badge>
      )}
      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada nesta competição.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-2">
          {sections.map((section) => <DetailSectionCard key={section.code} section={section} />)}
        </div>
      )}
    </div>
  )
}

export function AthletePage({ athleteId }: { athleteId: string }) {
  const { data, loading, error } = useApiData<AthleteHistory>(`/api/athletes/${encodeURIComponent(athleteId)}`, Boolean(athleteId))
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (entryId: string) => setExpanded((current) => {
    const next = new Set(current)
    if (next.has(entryId)) next.delete(entryId)
    else next.add(entryId)
    return next
  })

  return (
    <PageHeader
      active="competitions"
      breadcrumb={[{ label: 'Competições', href: '?view=competitions' }, { label: data?.name ?? 'Atleta' }]}
    >
      <div className="@container/main">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : error || !data ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Atleta não encontrado</AlertTitle>
              <AlertDescription>{error ?? 'Abra o atleta pela busca da tela de competições.'}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex min-w-0 items-center gap-4">
                <Avatar className="size-16 shrink-0 sm:size-20">
                  <AvatarFallback className="text-lg font-semibold">{initialsFor(data.name)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col gap-1">
                  <h1 className="truncate text-2xl leading-tight tracking-tight text-foreground sm:text-3xl">{data.name}</h1>
                  <div className="flex flex-wrap gap-1.5">
                    {data.states.map((state) => <Badge key={state} variant="secondary">{state}</Badge>)}
                    <Badge variant="outline">
                      {data.entries.length} {data.entries.length === 1 ? 'competição' : 'competições'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Card className="gap-0 py-0">
                <CardHeader className="border-b py-4 [.border-b]:pb-4">
                  <CardTitle>Histórico</CardTitle>
                  <CardDescription>Uma linha por competição, da mais recente para a mais antiga. Abra a linha para ver as lutas e as avaliações.</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="overflow-x-auto">
                    <Table className="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4">
                      <TableCaption className="sr-only">Competições de {data.name}</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"><span className="sr-only">Abrir</span></TableHead>
                          <TableHead>Ano</TableHead>
                          <TableHead>Competição</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>UF</TableHead>
                          <TableHead>Pos.</TableHead>
                          <TableHead>V-D</TableHead>
                          <TableHead>Pontos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.entries.length === 0 ? (
                          <TableRow><TableCell colSpan={8} className="text-muted-foreground">Nenhuma inscrição registrada.</TableCell></TableRow>
                        ) : data.entries.map((entry) => {
                          const open = expanded.has(entry.entryId)
                          return (
                            <Fragment key={entry.entryId}>
                              <TableRow className="cursor-pointer hover:bg-muted/30" onClick={() => toggle(entry.entryId)}>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-expanded={open}
                                    aria-label={open ? 'Fechar lutas e avaliações' : 'Ver lutas e avaliações'}
                                    onClick={(e) => { e.stopPropagation(); toggle(entry.entryId) }}
                                  >
                                    {open ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                                  </Button>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{entry.competition.year ?? '—'}</TableCell>
                                <TableCell className="font-medium">{competitionLabel(entry)}</TableCell>
                                <TableCell>{[entry.style, entry.weight != null ? `${entry.weight} kg` : null].filter(Boolean).join(' · ') || '—'}</TableCell>
                                <TableCell className="text-muted-foreground">{entry.state ?? '—'}</TableCell>
                                <TableCell className="font-mono">{placement(entry)}</TableCell>
                                <TableCell className="font-mono">{entry.wins != null ? `${entry.wins}-${entry.losses ?? 0}` : '—'}</TableCell>
                                <TableCell className="font-mono">
                                  {entry.technicalPointsFor != null ? `${entry.technicalPointsFor}–${entry.technicalPointsAgainst ?? 0}` : '—'}
                                </TableCell>
                              </TableRow>
                              {open && (
                                <TableRow className="hover:bg-transparent">
                                  <TableCell colSpan={8} className="bg-muted/20 whitespace-normal">
                                    <div className="flex flex-col gap-4 py-2">
                                      <EntryFightsCard entryId={entry.entryId} />
                                      <EntryAssessments entry={entry} />
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Fragment>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </PageHeader>
  )
}
