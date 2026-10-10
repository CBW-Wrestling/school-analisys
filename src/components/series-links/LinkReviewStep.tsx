import { useEffect, useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useApiRows } from '../../lib/api'
import { confirmImportLinks, getImportLinks, type ImportStatus } from '../../lib/importApi'
import { apiErrorOf } from '../../lib/seriesLinksApi'
import type { CompetitionRow, EntryLink, LinkStatus, LinkedEntry } from '../../types'
import { PrincipalPickerDialog } from './PrincipalPickerDialog'
import { SeriesLinksTable, type EffectiveLink } from './SeriesLinksTable'

const PAGE_SIZE = 20

// Revisão obrigatória do de/para ao fim do import de uma série secundária.
export function LinkReviewStep({ status, onCompleted }: { status: ImportStatus; onCompleted: (status: ImportStatus) => void }) {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<LinkStatus | 'ALL'>('ALL')
  const [rows, setRows] = useState<EntryLink[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Record<string, LinkedEntry | null>>({})
  const [picking, setPicking] = useState<EntryLink | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  const { rows: competitions } = useApiRows<CompetitionRow>('/api/competitions')
  const secondary = useMemo(
    () => competitions.find((c) => c.arenaId === status.selectedCompetitionId),
    [competitions, status.selectedCompetitionId],
  )

  useEffect(() => {
    let alive = true
    const timer = setTimeout(() => {
      setLoading(true)
      getImportLinks(status.importId, { status: filter === 'ALL' ? undefined : filter, page, size: PAGE_SIZE })
        .then((result) => { if (alive) { setRows(result.content); setTotal(result.totalElements); setLoadError(null) } })
        .catch((err) => { if (alive) setLoadError(apiErrorOf(err, 'Não foi possível carregar os vínculos.').message) })
        .finally(() => { if (alive) setLoading(false) })
    }, 0)
    return () => { alive = false; clearTimeout(timer) }
  }, [status.importId, filter, page])

  function effective(row: EntryLink): EffectiveLink {
    if (row.entryId in overrides) {
      const principal = overrides[row.entryId]
      return { status: principal ? 'CONFIRMED' : 'UNLINKED', principal, changed: true }
    }
    return { status: row.linkStatus, principal: row.principal }
  }

  function choose(row: EntryLink, principal: LinkedEntry | null) {
    setOverrides((prev) => ({ ...prev, [row.entryId]: principal }))
    setConfirmError(null)
  }

  async function confirm() {
    setConfirming(true)
    setConfirmError(null)
    try {
      const overrideList = Object.entries(overrides).map(([entryId, p]) => ({ entryId, principalEntryId: p?.entryId ?? null }))
      onCompleted(await confirmImportLinks(status.importId, overrideList))
    } catch (err) {
      setConfirmError(apiErrorOf(err, 'Não foi possível confirmar os vínculos.').message)
    } finally {
      setConfirming(false)
    }
  }

  const summary = status.linkSummary
  const changes = Object.keys(overrides).length

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4 [.border-b]:pb-4">
        <CardTitle>Revisar vínculos com a Série Ouro</CardTitle>
        <CardDescription>
          Confira o de/para antes de concluir. Ao confirmar, sugeridos viram confirmados e ambíguos sem escolha ficam sem
          vínculo — sem vínculo confirmado, a inscrição fica fora das análises.
        </CardDescription>
        {summary && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge>{summary.exact} exatos</Badge>
            <Badge variant="secondary">{summary.suggested} sugeridos</Badge>
            <Badge variant="outline">{summary.ambiguous} ambíguos</Badge>
            <Badge variant="destructive">{summary.unlinked} não vinculados</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-0 pt-4">
        {loadError ? (
          <Alert variant="destructive" className="mx-4">
            <AlertCircle />
            <AlertTitle>Erro ao carregar</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : (
          <SeriesLinksTable
            rows={rows}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            status={filter}
            onStatusChange={(s) => { setFilter(s); setPage(0) }}
            loading={loading}
            effective={effective}
            onPickCandidate={choose}
            onLink={(row) => setPicking(row)}
            onUnlink={(row) => choose(row, null)}
          />
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 border-t py-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-muted-foreground">
          {changes === 0 ? 'Nenhuma alteração na proposta.' : `${changes} alteração(ões) na proposta.`}
        </span>
        <Button onClick={confirm} disabled={confirming || loading}>
          {confirming && <Spinner data-icon="inline-start" />}
          Confirmar vínculos
        </Button>
      </CardFooter>
      {confirmError && (
        <Alert variant="destructive" className="mx-4 mb-4">
          <AlertCircle />
          <AlertTitle>Não foi possível confirmar</AlertTitle>
          <AlertDescription>{confirmError}</AlertDescription>
        </Alert>
      )}
      {picking && secondary && (
        <PrincipalPickerDialog
          open
          onOpenChange={(open) => { if (!open) setPicking(null) }}
          secondaryCompetitionId={secondary.id}
          entryId={picking.entryId}
          athleteName={picking.arenaAthleteName}
          onSelect={(candidate) => { choose(picking, candidate); setPicking(null) }}
        />
      )}
    </Card>
  )
}
