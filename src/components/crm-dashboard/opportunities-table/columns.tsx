import type { ColumnDef } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { OpportunityRow } from './schema'

const healthStripSlots = Array.from({ length: 18 }, (_, index) => ({
  id: `strip-${index + 1}`,
  threshold: index + 1,
}))

function getHealthScore(health: OpportunityRow['health']) {
  switch (health) {
    case 'On Track':
      return 18
    case 'Needs Review':
      return 11
    case 'At Risk':
      return 7
    case 'On Hold':
      return 4
    default:
      return 0
  }
}

export const opportunitiesColumns: ColumnDef<OpportunityRow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todas as oportunidades"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Selecionar ${row.original.account}`}
      />
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div className="text-sm tracking-tight">{row.original.id}</div>,
    enableHiding: false,
  },
  {
    accessorKey: 'account',
    header: 'Conta',
    cell: ({ row }) => <div className="text-sm font-medium">{row.original.account}</div>,
  },
  {
    accessorKey: 'stage',
    header: 'Estágio',
    cell: ({ row }) => (
      <Badge variant="outline" className="rounded-full px-2.5">
        {row.original.stage}
      </Badge>
    ),
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'priority',
    header: 'Prioridade',
    cell: ({ row }) => <div className="text-sm">{row.original.priority}</div>,
  },
  {
    accessorKey: 'health',
    header: 'Saúde',
    cell: ({ row }) => (
      <div className="flex items-end gap-0.5" title={row.original.health}>
        <span className="sr-only">{row.original.health}</span>
        {healthStripSlots.map((slot) => (
          <div
            key={`${row.original.id}-${slot.id}`}
            className={cn(
              'h-5 w-1 rounded-full',
              slot.threshold <= getHealthScore(row.original.health) ? 'bg-green-500/85' : 'bg-green-500/15',
            )}
          />
        ))}
      </div>
    ),
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'value',
    header: 'Valor',
    cell: ({ row }) => <div className="text-sm font-medium tabular-nums">{row.original.value}</div>,
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Editar</div>,
    cell: () => (
      <div className="text-right">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full text-muted-foreground hover:bg-transparent focus-visible:bg-transparent"
        >
          <Pencil aria-hidden="true" />
          <span className="sr-only">Editar oportunidade</span>
        </Button>
      </div>
    ),
    enableHiding: false,
  },
]
