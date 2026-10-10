import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { apiErrorOf, getPrincipalCandidates } from '../../lib/seriesLinksApi'
import type { PrincipalCandidate } from '../../types'
import { entryDetails } from './linkStatus'

// Busca no servidor as inscrições da Série Ouro do mesmo pai da competição secundária.
export function PrincipalPickerDialog({ open, onOpenChange, secondaryCompetitionId, entryId, athleteName, onSelect }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  secondaryCompetitionId: string
  entryId: string
  athleteName: string | null
  onSelect: (candidate: PrincipalCandidate) => void
}) {
  const [q, setQ] = useState(athleteName ?? '')
  const [items, setItems] = useState<PrincipalCandidate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let alive = true
    const timer = setTimeout(() => {
      setLoading(true)
      getPrincipalCandidates(secondaryCompetitionId, { q, size: 20 })
        .then((page) => { if (alive) { setItems(page.content); setError(null) } })
        .catch((err) => { if (alive) setError(apiErrorOf(err, 'Não foi possível buscar as inscrições da Série Ouro.').message) })
        .finally(() => { if (alive) setLoading(false) })
    }, 250)
    return () => { alive = false; clearTimeout(timer) }
  }, [open, q, secondaryCompetitionId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Vincular à Série Ouro</DialogTitle>
          <DialogDescription>
            Escolha a inscrição da Ouro de {athleteName ?? 'este atleta'}. As avaliações dela passam a valer nesta série.
          </DialogDescription>
        </DialogHeader>
        <Command shouldFilter={false} className="rounded-lg border">
          <CommandInput value={q} onValueChange={setQ} placeholder="Buscar pelo nome na Série Ouro…" />
          <CommandList>
            {loading && <div className="flex justify-center p-4"><Spinner /></div>}
            {!loading && error && <p className="p-4 text-sm text-destructive">{error}</p>}
            {!loading && !error && <CommandEmpty>Nenhuma inscrição encontrada na Série Ouro.</CommandEmpty>}
            {!loading && !error && items.length > 0 && (
              <CommandGroup heading="Inscrições da Série Ouro">
                {items.map((c) => (
                  <CommandItem key={c.entryId} value={c.entryId} onSelect={() => onSelect(c)} className="flex items-center gap-2">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{c.athleteName ?? 'Sem nome'}</span>
                      <span className="text-xs text-muted-foreground">{entryDetails(c)}</span>
                    </div>
                    {c.linkedEntryId && c.linkedEntryId !== entryId && <Badge variant="outline">Já vinculada</Badge>}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
