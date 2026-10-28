import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '../components/PageHeader'
import { SearchableSelect } from '../components/SearchableSelect'
import { LINK_SOURCE_LABEL, LINK_STATUS_LABEL } from '../components/series-links/linkStatus'
import { PrincipalPickerDialog } from '../components/series-links/PrincipalPickerDialog'
import { SeriesLinksTable } from '../components/series-links/SeriesLinksTable'
import { useApiRows } from '../lib/api'
import {
  apiErrorOf,
  competitionLabel,
  getCompetitionLinks,
  getLinkHistory,
  isSecondarySeries,
  setEntryPrincipal,
} from '../lib/seriesLinksApi'
import type { CompetitionRow, EntryLink, EntryLinkHistory, LinkStatus, PrincipalCandidate } from '../types'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'

const PAGE_SIZE = 20

type Conflict = { row: EntryLink; candidate: PrincipalCandidate; message: string }

export function SeriesLinksPage() {
  const { rows: competitions, loading: loadingCompetitions } = useApiRows<CompetitionRow>('/api/competitions')
  const secondaryOptions = competitions.filter(isSecondarySeries).map((c) => ({ value: c.id, label: competitionLabel(c) }))
  const [competitionId, setCompetitionId] = useState('')
  const [status, setStatus] = useState<LinkStatus | 'ALL'>('ALL')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState<EntryLink[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const [busyEntryId, setBusyEntryId] = useState<string | null>(null)
  const [picking, setPicking] = useState<EntryLink | null>(null)
  const [conflict, setConflict] = useState<Conflict | null>(null)
  const [historyOf, setHistoryOf] = useState<EntryLink | null>(null)
  const [history, setHistory] = useState<EntryLinkHistory[] | null>(null)

  useEffect(() => {
    if (!competitionId) return
    let alive = true
    const timer = setTimeout(() => {
      setLoading(true)
      getCompetitionLinks(competitionId, { status: status === 'ALL' ? undefined : status, q, page, size: PAGE_SIZE })
        .then((result) => { if (alive) { setRows(result.content); setTotal(result.totalElements); setError(null) } })
        .catch((err) => { if (alive) setError(apiErrorOf(err, 'Não foi possível carregar os vínculos.').message) })
        .finally(() => { if (alive) setLoading(false) })
    }, 250)
    return () => { alive = false; clearTimeout(timer) }
  }, [competitionId, status, q, page, reload])

  useEffect(() => {
    if (!historyOf) return
    let alive = true
    getLinkHistory(historyOf.entryId)
      .then((items) => { if (alive) setHistory(items) })
      .catch((err) => { if (alive) { setHistory([]); toast.error(apiErrorOf(err, 'Não foi possível carregar o histórico.').message) } })
    return () => { alive = false }
  }, [historyOf])

  async function save(row: EntryLink, principalEntryId: string | null, swap = false, candidate?: PrincipalCandidate) {
    setBusyEntryId(row.entryId)
    try {
      await setEntryPrincipal(row.entryId, principalEntryId, swap)
      toast.success(principalEntryId ? (swap ? 'Vínculos trocados.' : 'Vínculo confirmado.') : 'Inscrição desvinculada.')
      setReload((n) => n + 1)
    } catch (err) {
      const apiError = apiErrorOf(err, 'Não foi possível salvar o vínculo.')
      if (apiError.error === 'PRINCIPAL_ALREADY_LINKED' && candidate && !swap) {
        setConflict({ row, candidate, message: apiError.message })
      } else {
        toast.error(apiError.message)
      }
    } finally {
      setBusyEntryId(null)
    }
  }

  const name = (row: EntryLink) => row.arenaAthleteName ?? 'esta inscrição'

  return (
    <PageHeader active="series-links" breadcrumb={[{ label: 'Operações' }, { label: 'Vínculos de séries' }]}>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl leading-none tracking-tight">Vínculos de séries</h1>
            <p className="text-sm text-muted-foreground">
              Inscrições de Prata e Bronze ligadas à inscrição do mesmo atleta na Série Ouro, de onde vêm as avaliações.
            </p>
          </div>
          <SearchableSelect
            value={competitionId}
            onChange={(id) => { setCompetitionId(id); setPage(0) }}
            options={secondaryOptions}
            placeholder={loadingCompetitions ? 'Carregando…' : secondaryOptions.length ? 'Escolha a série secundária' : 'Nenhuma série secundária'}
            disabled={!secondaryOptions.length}
            ariaLabel="Série secundária"
            className="w-full lg:w-80"
          />
        </div>

        {!competitionId ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>Escolha uma série secundária</EmptyTitle>
              <EmptyDescription>
                {secondaryOptions.length
                  ? 'Selecione a Prata ou a Bronze para ver e corrigir os vínculos com a Série Ouro.'
                  : 'Importe um evento como série secundária em Operações › Criar competição.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Erro ao carregar</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-4 [.border-b]:pb-4">
              <CardTitle>Inscrições da série</CardTitle>
              <CardDescription>Só vínculos exatos ou confirmados contam nas análises.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pt-4">
              <SeriesLinksTable
                rows={rows}
                total={total}
                page={page}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                status={status}
                onStatusChange={(s) => { setStatus(s); setPage(0) }}
                search={{ value: q, onChange: (v) => { setQ(v); setPage(0) } }}
                loading={loading}
                effective={(row) => ({ status: row.linkStatus, principal: row.principal })}
                onPickCandidate={(row, candidate) => save(row, candidate.entryId, false, candidate)}
                onLink={(row) => setPicking(row)}
                onUnlink={(row) => save(row, null)}
                onHistory={(row) => { setHistory(null); setHistoryOf(row) }}
                busyEntryId={busyEntryId}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {picking && (
        <PrincipalPickerDialog
          open
          onOpenChange={(open) => { if (!open) setPicking(null) }}
          secondaryCompetitionId={competitionId}
          entryId={picking.entryId}
          athleteName={picking.arenaAthleteName}
          onSelect={(candidate) => { const row = picking; setPicking(null); save(row, candidate.entryId, false, candidate) }}
        />
      )}

      <AlertDialog open={!!conflict} onOpenChange={(open) => { if (!open) setConflict(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inscrição da Ouro já vinculada</AlertDialogTitle>
            <AlertDialogDescription>
              {conflict?.candidate.athleteName ?? 'Essa inscrição'} já está vinculada a outra inscrição desta série. Trocar
              vincula {conflict ? name(conflict.row) : ''} a ela, e a outra inscrição recebe o vínculo anterior desta (ou fica sem
              vínculo). As duas alterações entram no histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (conflict) save(conflict.row, conflict.candidate.entryId, true, conflict.candidate); setConflict(null) }}
            >
              Trocar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={!!historyOf} onOpenChange={(open) => { if (!open) setHistoryOf(null) }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Histórico do vínculo</SheetTitle>
            <SheetDescription>{historyOf ? name(historyOf) : ''}: todas as alterações, da mais antiga à mais recente.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4 pb-4">
            {history === null ? <Spinner /> : history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem alterações registradas.</p>
            ) : history.map((h, i) => (
              <div key={i} className="flex flex-col gap-0.5 rounded-lg border p-3 text-sm">
                <span className="font-medium">
                  {h.fromStatus ? LINK_STATUS_LABEL[h.fromStatus] : 'Início'} → {LINK_STATUS_LABEL[h.toStatus]}
                </span>
                <span className="text-muted-foreground">{LINK_SOURCE_LABEL[h.source]}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(h.changedAt).toLocaleString('pt-BR')}{h.changedBy ? ` · ${h.changedBy}` : ''}
                </span>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </PageHeader>
  )
}
