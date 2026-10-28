import { Swords } from 'lucide-react'
import { useApiRows } from '../lib/api'
import type { EntryFight } from '../types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Códigos de vitória do Arena; um código desconhecido aparece como veio.
const VICTORY_LABELS: Record<string, string> = {
  VFA: 'Encostamento',
  VSU: 'Superioridade técnica',
  VSU1: 'Superioridade técnica (com pontos do perdedor)',
  VPO: 'Pontos',
  VPO1: 'Pontos (com pontos do perdedor)',
  VFO: 'W.O.',
  '2VFO': 'W.O. duplo',
  VIN: 'Lesão',
}

function victoryLabel(code: string | null) {
  if (!code) return '—'
  return VICTORY_LABELS[code] ?? code
}

export function EntryFightsCard({ entryId }: { entryId: string }) {
  const { rows: fights, loading, error } = useApiRows<EntryFight>(`/api/entries/${encodeURIComponent(entryId)}/fights`)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Swords className="size-4" aria-hidden="true" />
          </span>
          <CardTitle>Lutas</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        {loading ? (
          <p className="px-6 text-sm text-muted-foreground">Carregando lutas…</p>
        ) : error ? (
          <p className="px-6 text-sm text-muted-foreground">Não foi possível carregar as lutas.</p>
        ) : fights.length === 0 ? (
          <p className="px-6 text-sm text-muted-foreground">Nenhuma luta registrada para esta competição.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="**:data-[slot='table-cell']:px-6 **:data-[slot='table-head']:px-6">
              <TableCaption className="sr-only">Lutas do atleta na ordem da chave</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Rodada</TableHead>
                  <TableHead>Adversário</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Placar</TableHead>
                  <TableHead>Pontos de classificação</TableHead>
                  <TableHead>Vitória por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fights.map((fight) => (
                  <TableRow key={fight.fightId}>
                    <TableCell className="text-muted-foreground">{fight.round ?? '—'}</TableCell>
                    <TableCell className="font-medium">
                      {fight.opponentName ?? '—'}
                      {fight.opponentState && <span className="font-normal text-muted-foreground"> · {fight.opponentState}</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={fight.result === 'WIN' ? 'default' : 'outline'}>
                        {fight.result === 'WIN' ? 'Vitória' : 'Derrota'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{fight.technicalPointsFor}–{fight.technicalPointsAgainst}</TableCell>
                    <TableCell className="font-mono">{fight.classificationPointsFor}–{fight.classificationPointsAgainst}</TableCell>
                    <TableCell className="text-muted-foreground">{victoryLabel(fight.victoryType)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
