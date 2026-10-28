import { AlertCircle, ArrowLeft, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { apiGet, useApiRows } from '../lib/api'
import { athleteHref } from '../navigation/links'
import type { AthleteSearchRow, CompetitionEntry, CompetitionNode, Page, Series } from '../types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const PAGE_SIZE = 50
const SERIES_LABEL: Record<Series, string> = { OURO: 'Ouro', PRATA: 'Prata', BRONZE: 'Bronze' }
const SOURCE_LABEL = { ARENA: 'Arena', SPREADSHEET: 'Planilha' } as const

function nodeLabel(node: CompetitionNode, parent?: CompetitionNode) {
  return node.series ? `${parent?.name ?? node.name} · ${SERIES_LABEL[node.series]}` : node.name
}

function AthleteSearch() {
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<AthleteSearchRow[] | null>(null)

  const searching = q.trim().length >= 2
  useEffect(() => {
    if (!searching) return
    let alive = true
    const timer = setTimeout(() => {
      apiGet<Page<AthleteSearchRow>>(`/api/athletes?q=${encodeURIComponent(q.trim())}&size=8`)
        .then((page) => { if (alive) setRows(page.content) })
        .catch(() => { if (alive) setRows([]) })
    }, 250)
    return () => { alive = false; clearTimeout(timer) }
  }, [q, searching])

  return (
    <div className="relative w-full lg:w-80">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar atleta…" aria-label="Buscar atleta" className="pl-8" />
      {searching && rows && (
        <Card className="absolute top-full right-0 left-0 z-10 mt-1 gap-0 py-1">
          {rows.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum atleta encontrado.</p>
          ) : rows.map((row) => (
            <a key={row.athleteId} href={athleteHref(row.athleteId)} className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-muted/50">
              <span className="truncate font-medium">{row.name ?? '—'}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {row.states.join(', ')}{row.states.length ? ' · ' : ''}{row.competitions} {row.competitions === 1 ? 'competição' : 'competições'}
              </span>
            </a>
          ))}
        </Card>
      )}
    </div>
  )
}

function TotalsCells({ node }: { node: CompetitionNode }) {
  return (
    <>
      <TableCell className="font-mono">{node.totals.entries}</TableCell>
      <TableCell className="font-mono">{node.totals.withResult}</TableCell>
      <TableCell className="font-mono">{node.totals.ranked}</TableCell>
      <TableCell className="font-mono">{node.totals.assessed}</TableCell>
    </>
  )
}

function CompetitionGroup({ group, onOpen }: { group: CompetitionNode; onOpen: (node: CompetitionNode, label: string) => void }) {
  const rows = group.children.length ? group.children : [group]
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4 [.border-b]:pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{group.name}</CardTitle>
          {group.year != null && <Badge variant="secondary">{group.year}</Badge>}
          <Badge variant="outline">{SOURCE_LABEL[group.source]}</Badge>
        </div>
        {group.children.length > 0 && (
          <CardDescription>
            {group.children.length} séries · {group.totals.entries} inscrições · {group.totals.ranked} classificadas
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table className="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4">
            <TableCaption className="sr-only">Totais de {group.name}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>{group.children.length ? 'Série' : 'Competição'}</TableHead>
                <TableHead>Inscrições</TableHead>
                <TableHead>Com resultado</TableHead>
                <TableHead>Classificados</TableHead>
                <TableHead>Avaliados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="**:data-[slot='table-row']:hover:bg-muted/30">
              {rows.map((node) => {
                const label = nodeLabel(node, group.children.length ? group : undefined)
                return (
                  <TableRow key={node.id} className="cursor-pointer" onClick={() => onOpen(node, label)}>
                    <TableCell className="font-medium">
                      <button type="button" className="text-left hover:underline" onClick={(e) => { e.stopPropagation(); onOpen(node, label) }}>
                        {node.series ? SERIES_LABEL[node.series] : node.name}
                      </button>
                    </TableCell>
                    <TotalsCells node={node} />
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function CompetitionEntries({ competition, label, onBack }: { competition: CompetitionNode; label: string; onBack: () => void }) {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState<Page<CompetitionEntry> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) })
    if (q.trim()) params.set('q', q.trim())
    const timer = setTimeout(() => {
      apiGet<Page<CompetitionEntry>>(`/api/competitions/${encodeURIComponent(competition.id)}/entries?${params}`)
        .then((d) => { if (alive) { setData(d); setError(null) } })
        .catch((e: Error) => { if (alive) setError(e.message) })
    }, q ? 250 : 0)
    return () => { alive = false; clearTimeout(timer) }
  }, [competition.id, q, page])

  const total = data?.totalElements ?? 0
  const first = total === 0 ? 0 : page * PAGE_SIZE + 1
  const last = Math.min(total, (page + 1) * PAGE_SIZE)

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4 [.border-b]:pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Voltar para as competições"><ArrowLeft aria-hidden="true" /></Button>
            <div className="flex flex-col">
              <CardTitle>{label}</CardTitle>
              <CardDescription>Inscrições da competição, pela colocação.</CardDescription>
            </div>
          </div>
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0) }}
            placeholder="Buscar atleta…"
            aria-label="Buscar atleta na competição"
            className="sm:max-w-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-0 pt-4">
        {error ? (
          <Alert variant="destructive" className="mx-4 w-auto">
            <AlertCircle />
            <AlertTitle>Erro ao carregar</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : !data ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4">
                <TableCaption className="sr-only">Inscrições de {label}</TableCaption>
                <TableHeader className="border-t">
                  <TableRow>
                    <TableHead>Pos.</TableHead>
                    <TableHead>Atleta</TableHead>
                    <TableHead>UF</TableHead>
                    <TableHead>Estilo</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>V-D</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="**:data-[slot='table-row']:hover:bg-muted/30">
                  {data.content.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-muted-foreground">Nenhuma inscrição encontrada.</TableCell></TableRow>
                  ) : data.content.map((entry) => (
                    <TableRow key={entry.entryId}>
                      <TableCell className="text-muted-foreground">{entry.rank ?? (entry.isNotRanked ? 'NC' : '—')}</TableCell>
                      <TableCell className="font-medium">
                        {entry.athleteId
                          ? <a href={athleteHref(entry.athleteId)} className="hover:underline">{entry.athleteName ?? '—'}</a>
                          : <span>{entry.athleteName ?? '—'}</span>}
                        {entry.linkStatus && entry.linkStatus !== 'EXACT' && entry.linkStatus !== 'CONFIRMED' && (
                          <Badge variant="outline" className="ml-2">Não vinculada</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{entry.state ?? '—'}</TableCell>
                      <TableCell>{entry.style ?? '—'}</TableCell>
                      <TableCell className="font-mono">{entry.weight != null ? `${entry.weight} kg` : '—'}</TableCell>
                      <TableCell className="font-mono">{entry.wins != null ? `${entry.wins}-${entry.losses ?? 0}` : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between gap-2 px-4 pb-4 text-sm text-muted-foreground">
              <span>{first}–{last} de {total}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
                <Button variant="outline" size="sm" disabled={last >= total} onClick={() => setPage(page + 1)}>Próxima</Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function CompetitionsPage() {
  const { rows: groups, loading, error } = useApiRows<CompetitionNode>('/api/competitions/overview')
  const [open, setOpen] = useState<{ node: CompetitionNode; label: string } | null>(null)

  return (
    <PageHeader active="competitions" breadcrumb={[{ label: 'Resultados' }, { label: 'Competições' }]}>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl leading-none tracking-tight">Competições</h1>
            <p className="text-sm text-muted-foreground">Competições e séries com os totais de inscrições, resultados e avaliações.</p>
          </div>
          <AthleteSearch />
        </div>

        {open ? (
          <CompetitionEntries competition={open.node} label={open.label} onBack={() => setOpen(null)} />
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Erro ao carregar</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : groups.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>Nenhuma competição</EmptyTitle>
              <EmptyDescription>Importe uma competição em Operações › Criar competição.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          groups.map((group) => <CompetitionGroup key={group.id} group={group} onOpen={(node, label) => setOpen({ node, label })} />)
        )}
      </div>
    </PageHeader>
  )
}
