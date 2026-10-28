import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '../components/PageHeader'
import { dismissMergeGroup, getMergeCandidates, getMergeHistory, mergeAthletes } from '../lib/athleteMergesApi'
import { apiErrorOf } from '../lib/seriesLinksApi'
import { athleteHref } from '../navigation/links'
import type { MergeCandidateGroup, MergeGroupStatus, MergeHistory, Page } from '../types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const PAGE_SIZE = 20
const STATUS_LABEL: Record<MergeGroupStatus, string> = { LIKELY: 'Provável', DOUBTFUL: 'Duvidoso' }

function GroupCard({ group, onDone }: { group: MergeCandidateGroup; onDone: () => void }) {
  const [survivor, setSurvivor] = useState(group.suggestedSurvivorId ?? group.athletes[0]?.athleteId ?? '')
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const kept = group.athletes.find((a) => a.athleteId === survivor)
  const merged = group.athletes.filter((a) => a.athleteId !== survivor)

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true)
    setError(null)
    try {
      await action()
      toast.success(success)
      onDone()
    } catch (err) {
      setError(apiErrorOf(err, 'Não foi possível concluir a operação.').message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{group.athletes[0]?.name ?? group.normalizedName}</CardTitle>
          <Badge variant={group.status === 'LIKELY' ? 'secondary' : 'outline'}>{STATUS_LABEL[group.status]}</Badge>
        </div>
        <CardDescription>
          {group.athletes.length} registros com o mesmo nome. Escolha o registro que fica; as inscrições dos outros passam para ele.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Não foi possível unificar</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <RadioGroup value={survivor} onValueChange={setSurvivor} className="gap-4">
          {group.athletes.map((athlete) => (
            <div key={athlete.athleteId} className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <RadioGroupItem value={athlete.athleteId} id={`keep-${athlete.athleteId}`} />
                <Label htmlFor={`keep-${athlete.athleteId}`} className="font-medium">{athlete.name ?? '—'}</Label>
                <Badge variant="outline">{athlete.fromArena ? 'Arena' : 'Planilha'}</Badge>
                {athlete.athleteId === group.suggestedSurvivorId && <Badge variant="secondary">Sugerido</Badge>}
                <a href={athleteHref(athlete.athleteId)} className="ml-auto text-xs text-muted-foreground hover:underline">Ver histórico</a>
              </div>
              {athlete.entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem inscrições.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="**:data-[slot='table-cell']:px-2 **:data-[slot='table-head']:px-2">
                    <TableCaption className="sr-only">Inscrições de {athlete.name}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ano</TableHead>
                        <TableHead>Competição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>UF</TableHead>
                        <TableHead>Pos.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {athlete.entries.map((entry) => (
                        <TableRow key={entry.entryId}>
                          <TableCell className="text-muted-foreground">{entry.year ?? '—'}</TableCell>
                          <TableCell>{entry.competition}</TableCell>
                          <TableCell>{[entry.style, entry.weight != null ? `${entry.weight} kg` : null].filter(Boolean).join(' · ') || '—'}</TableCell>
                          <TableCell className="text-muted-foreground">{entry.state ?? '—'}</TableCell>
                          <TableCell className="font-mono">{entry.rank != null ? `${entry.rank}º` : '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => run(() => dismissMergeGroup(group.athletes.map((a) => a.athleteId)), 'Grupo marcado como pessoas diferentes.')}
        >
          Não é a mesma pessoa
        </Button>
        <Button disabled={busy || !kept} onClick={() => setConfirming(true)}>
          {busy && <Spinner data-icon="inline-start" />} Unificar
        </Button>
      </CardFooter>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unificar registros</AlertDialogTitle>
            <AlertDialogDescription>
              As inscrições de {merged.length} {merged.length === 1 ? 'registro' : 'registros'} passam para "{kept?.name}" ({kept?.fromArena ? 'Arena' : 'Planilha'}),
              e {merged.length === 1 ? 'o registro é removido' : 'os registros são removidos'}. Colocações, lutas e avaliações
              continuam nas inscrições. A unificação fica no histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => run(
                () => mergeAthletes(survivor, merged.map((a) => a.athleteId), group.normalizedName),
                'Registros unificados.',
              )}
            >
              Unificar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

function Candidates() {
  const [status, setStatus] = useState<MergeGroupStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(0)
  const [reload, setReload] = useState(0)
  const [data, setData] = useState<Page<MergeCandidateGroup> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    getMergeCandidates({ status: status === 'ALL' ? undefined : status, page, size: PAGE_SIZE })
      .then((d) => { if (alive) { setData(d); setError(null) } })
      .catch((err) => { if (alive) setError(apiErrorOf(err, 'Não foi possível carregar os candidatos.').message) })
    return () => { alive = false }
  }, [status, page, reload])

  const total = data?.totalElements ?? 0
  const first = total === 0 ? 0 : page * PAGE_SIZE + 1
  const last = Math.min(total, (page + 1) * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Provável: uma UF só e nenhuma competição em comum. Duvidoso: confira com cuidado antes de unificar.
        </p>
        <Select value={status} onValueChange={(v) => { setStatus(v as MergeGroupStatus | 'ALL'); setPage(0) }}>
          <SelectTrigger size="sm" className="w-40" aria-label="Filtrar por grau de certeza">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="item-aligned" align="center">
            <SelectGroup>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="LIKELY">Prováveis</SelectItem>
              <SelectItem value="DOUBTFUL">Duvidosos</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Erro ao carregar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : !data ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : data.content.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Nenhum duplicado para revisar</EmptyTitle>
            <EmptyDescription>Não há registros de atleta com o mesmo nome pendentes de revisão.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {data.content.map((group) => (
            <GroupCard key={group.athletes.map((a) => a.athleteId).join()} group={group} onDone={() => setReload((n) => n + 1)} />
          ))}
          <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>{first}–{last} de {total} grupos</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
              <Button variant="outline" size="sm" disabled={last >= total} onClick={() => setPage(page + 1)}>Próxima</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function History() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<Page<MergeHistory> | null>(null)

  useEffect(() => {
    let alive = true
    getMergeHistory(page, PAGE_SIZE)
      .then((d) => { if (alive) setData(d) })
      .catch((err) => { if (alive) toast.error(apiErrorOf(err, 'Não foi possível carregar o histórico.').message) })
    return () => { alive = false }
  }, [page])

  if (!data) return <div className="flex justify-center py-8"><Spinner /></div>
  const total = data.totalElements
  const last = Math.min(total, (page + 1) * PAGE_SIZE)
  return (
    <Card className="gap-0 py-0">
      <CardContent className="px-0">
        <Table className="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4">
          <TableCaption className="sr-only">Unificações feitas</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Registro que ficou</TableHead>
              <TableHead>Registros absorvidos</TableHead>
              <TableHead>Inscrições movidas</TableHead>
              <TableHead>Por</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.content.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-muted-foreground">Nenhuma unificação feita.</TableCell></TableRow>
            ) : data.content.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="text-muted-foreground">{new Date(h.mergedAt).toLocaleString('pt-BR')}</TableCell>
                <TableCell className="font-medium">
                  <a href={athleteHref(h.survivorId)} className="hover:underline">{h.survivorName ?? h.survivorId}</a>
                </TableCell>
                <TableCell>{h.mergedNames.join(', ')}</TableCell>
                <TableCell className="font-mono">{h.movedEntries}</TableCell>
                <TableCell className="text-muted-foreground">{h.mergedBy ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {total > PAGE_SIZE && (
          <div className="flex justify-end gap-2 p-4">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
            <Button variant="outline" size="sm" disabled={last >= total} onClick={() => setPage(page + 1)}>Próxima</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AthleteMergesPage() {
  return (
    <PageHeader active="athlete-merges" breadcrumb={[{ label: 'Operações' }, { label: 'Atletas duplicados' }]}>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl leading-none tracking-tight">Atletas duplicados</h1>
          <p className="text-sm text-muted-foreground">
            Registros que parecem ser a mesma pessoa (por exemplo, um da planilha e outro do Arena). Nada é unificado sem confirmação.
          </p>
        </div>
        <Tabs defaultValue="candidates" className="gap-4">
          <TabsList>
            <TabsTrigger value="candidates">Candidatos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          <TabsContent value="candidates"><Candidates /></TabsContent>
          <TabsContent value="history"><History /></TabsContent>
        </Tabs>
      </div>
    </PageHeader>
  )
}
