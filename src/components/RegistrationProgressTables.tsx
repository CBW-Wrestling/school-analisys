import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  REGISTRATION_STATUS_CLASSNAME,
  REGISTRATION_STATUS_LABEL,
  type RegistrationAthlete,
  type RegistrationStateSummary,
  type RegistrationStatus,
} from '@/lib/registrationProgress'

export function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
  return (
    <Badge variant="outline" className={cn('shrink-0', REGISTRATION_STATUS_CLASSNAME[status])}>
      {REGISTRATION_STATUS_LABEL[status]}
    </Badge>
  )
}

/** Tabela por estado (Social ou Motora); linha clicável para abrir os atletas daquele estado. */
export function StateProgressTable({
  states,
  registeredKey,
  percentageKey,
  statusKey,
  onSelectState,
}: {
  states: RegistrationStateSummary[]
  registeredKey: 'socialRegistered' | 'motorRegistered'
  percentageKey: 'socialPercentage' | 'motorPercentage'
  statusKey: 'socialStatus' | 'motorStatus'
  onSelectState: (state: RegistrationStateSummary) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Registrados</TableHead>
            <TableHead className="text-center">%</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {states.map((state) => (
            <TableRow
              key={state.stateCode}
              className="cursor-pointer hover:bg-muted/50"
              role="button"
              tabIndex={0}
              aria-label={`Ver atletas de ${state.stateName}`}
              onClick={() => onSelectState(state)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectState(state) } }}
            >
              <TableCell className="text-center font-medium">{state.stateName} ({state.stateCode})</TableCell>
              <TableCell className="text-center tabular-nums">{state.totalAthletes}</TableCell>
              <TableCell className="text-center tabular-nums">{state[registeredKey]}</TableCell>
              <TableCell className="text-center tabular-nums">{state[percentageKey].toFixed(1)}%</TableCell>
              <TableCell className="text-center"><div className="flex justify-center"><RegistrationStatusBadge status={state[statusKey]} /></div></TableCell>
            </TableRow>
          ))}
          {states.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">Nenhum atleta encontrado para esta competição.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

/** Lista de atletas com status social/motor e pendências; usada no detalhe autenticado e nas rotas públicas. */
export function AthleteProgressTable({
  athletes,
  loading = false,
  emptyMessage = 'Nenhum atleta encontrado.',
  showSocial = true,
  showMotor = true,
}: {
  athletes: RegistrationAthlete[]
  loading?: boolean
  emptyMessage?: string
  showSocial?: boolean
  showMotor?: boolean
}) {
  const columnCount = 4 + (showSocial ? 1 : 0) + (showMotor ? 1 : 0) + 1
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Atleta</TableHead>
            <TableHead className="text-center">Estilo</TableHead>
            <TableHead className="text-center">Peso</TableHead>
            <TableHead className="text-center">Categoria</TableHead>
            {showSocial && <TableHead className="text-center">Social</TableHead>}
            {showMotor && <TableHead className="text-center">Motora</TableHead>}
            <TableHead className="text-center">Pendências</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow><TableCell colSpan={columnCount} className="text-center text-sm text-muted-foreground">Carregando…</TableCell></TableRow>
          )}
          {!loading && athletes.length === 0 && (
            <TableRow><TableCell colSpan={columnCount} className="text-center text-sm text-muted-foreground">{emptyMessage}</TableCell></TableRow>
          )}
          {athletes.map((athlete) => (
            <TableRow key={athlete.entryId}>
              <TableCell className="text-center font-medium">{athlete.athleteName}</TableCell>
              <TableCell className="text-center">{athlete.style}</TableCell>
              <TableCell className="text-center tabular-nums">{athlete.weight != null ? `${athlete.weight} kg` : '—'}</TableCell>
              <TableCell className="text-center">{athlete.ageCategoryCode}</TableCell>
              {showSocial && (
                <TableCell className="text-center"><div className="flex justify-center"><RegistrationStatusBadge status={athlete.socialStatus} /></div></TableCell>
              )}
              {showMotor && (
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs tabular-nums text-muted-foreground">{athlete.motorRegistered}/{athlete.motorExpected}</span>
                    <RegistrationStatusBadge status={athlete.motorStatus} />
                  </div>
                </TableCell>
              )}
              <TableCell className="text-center">
                {athlete.pending.length === 0
                  ? <span className="text-xs text-muted-foreground">Sem pendências</span>
                  : <div className="flex flex-wrap justify-center gap-1">{athlete.pending.map((item) => <Badge key={item} variant="outline" className="text-xs">{item}</Badge>)}</div>
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
