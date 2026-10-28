import { History, Link2, Link2Off, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { EntryLink, LinkStatus, LinkedEntry, PrincipalCandidate } from '../../types'
import { LINK_STATUS_LABEL, LINK_STATUS_OPTIONS, LINK_STATUS_VARIANT, entryDetails } from './linkStatus'

export type EffectiveLink = { status: LinkStatus; principal: LinkedEntry | null; changed?: boolean }

export function SeriesLinksTable({
  rows, total, page, pageSize, onPageChange, status, onStatusChange, search, loading,
  effective, onPickCandidate, onLink, onUnlink, onHistory, busyEntryId,
}: {
  rows: EntryLink[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  status: LinkStatus | 'ALL'
  onStatusChange: (status: LinkStatus | 'ALL') => void
  search?: { value: string; onChange: (value: string) => void }
  loading?: boolean
  effective: (row: EntryLink) => EffectiveLink
  onPickCandidate: (row: EntryLink, candidate: PrincipalCandidate) => void
  onLink: (row: EntryLink) => void
  onUnlink: (row: EntryLink) => void
  onHistory?: (row: EntryLink) => void
  busyEntryId?: string | null
}) {
  const first = total === 0 ? 0 : page * pageSize + 1
  const last = Math.min(total, (page + 1) * pageSize)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
        {search ? (
          <Input
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder="Buscar atleta…"
            aria-label="Buscar atleta"
            className="sm:max-w-xs"
          />
        ) : <span />}
        <Select value={status} onValueChange={(v) => onStatusChange(v as LinkStatus | 'ALL')}>
          <SelectTrigger size="sm" className="w-48" aria-label="Filtrar por estado do vínculo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="item-aligned" align="center">
            <SelectGroup>
              <SelectItem value="ALL">Todos os estados</SelectItem>
              {LINK_STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{LINK_STATUS_LABEL[s]}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Table className="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4">
        <TableCaption className="sr-only">Vínculos das inscrições desta série com a Série Ouro</TableCaption>
        <TableHeader className="border-t">
          <TableRow>
            <TableHead>Atleta nesta série</TableHead>
            <TableHead>Estado do vínculo</TableHead>
            <TableHead>Inscrição na Série Ouro</TableHead>
            <TableHead className="w-12"><span className="sr-only">Ações</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow><TableCell colSpan={4}><div className="flex justify-center py-6"><Spinner /></div></TableCell></TableRow>
          )}
          {!loading && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                Nenhuma inscrição com esse filtro.
              </TableCell>
            </TableRow>
          )}
          {!loading && rows.map((row) => {
            const link = effective(row)
            const busy = busyEntryId === row.entryId
            return (
              <TableRow key={row.entryId}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{row.arenaAthleteName ?? 'Sem nome'}</span>
                    <span className="text-xs text-muted-foreground">{entryDetails(row)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={LINK_STATUS_VARIANT[link.status]}>{LINK_STATUS_LABEL[link.status]}</Badge>
                    {link.changed && <Badge variant="outline">Alterado</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  {link.principal ? (
                    <div className="flex flex-col">
                      <span>{link.principal.athleteName ?? 'Sem nome'}</span>
                      <span className="text-xs text-muted-foreground">{entryDetails(link.principal)}</span>
                    </div>
                  ) : row.linkStatus === 'AMBIGUOUS' && !link.changed && row.candidates?.length ? (
                    <Select
                      value=""
                      onValueChange={(id) => {
                        const candidate = row.candidates?.find((c) => c.entryId === id)
                        if (candidate) onPickCandidate(row, candidate)
                      }}
                    >
                      <SelectTrigger size="sm" className="w-64" aria-label={`Escolher candidato para ${row.arenaAthleteName ?? 'a inscrição'}`}>
                        <SelectValue placeholder={`${row.candidates.length} candidatos — escolher`} />
                      </SelectTrigger>
                      <SelectContent position="item-aligned" align="center">
                        <SelectGroup>
                          {row.candidates.map((c) => (
                            <SelectItem key={c.entryId} value={c.entryId}>
                              {c.athleteName ?? 'Sem nome'} · {entryDetails(c)}{c.linkedEntryId ? ' · já vinculada' : ''}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sem vínculo</span>
                  )}
                </TableCell>
                <TableCell>
                  {busy ? <Spinner /> : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Ações para ${row.arenaAthleteName ?? 'a inscrição'}`}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onSelect={() => onLink(row)}>
                            <Link2 /> {link.principal ? 'Trocar vínculo…' : 'Vincular…'}
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={!link.principal} onSelect={() => onUnlink(row)}>
                            <Link2Off /> Desvincular
                          </DropdownMenuItem>
                          {onHistory && (
                            <DropdownMenuItem onSelect={() => onHistory(row)}>
                              <History /> Histórico
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between gap-2 px-4 pb-4 text-sm text-muted-foreground">
        <span>{first}–{last} de {total}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onPageChange(page - 1)}>Anterior</Button>
          <Button variant="outline" size="sm" disabled={last >= total} onClick={() => onPageChange(page + 1)}>Próxima</Button>
        </div>
      </div>
    </div>
  )
}
