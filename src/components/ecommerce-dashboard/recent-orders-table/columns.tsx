import type { ColumnDef } from '@tanstack/react-table'
import { format, parseISO } from 'date-fns'
import { MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { OrderRow } from './schema'

function formatOrderDate(date: string) {
  return format(parseISO(date), "H'h'mm, d MMM yyyy")
}

function PaymentBadge({ status }: { status: OrderRow['payment'] }) {
  if (status === 'Paid') {
    return (
      <Badge
        className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300"
        variant="outline"
      >
        <span className="size-1.5 rounded-full bg-current" />
        Pago
      </Badge>
    )
  }

  if (status === 'Refunded') {
    return (
      <Badge variant="destructive">
        <span className="size-1.5 rounded-full bg-current" />
        Reembolsado
      </Badge>
    )
  }

  return (
    <Badge
      className="border-yellow-700/25 text-yellow-700 dark:border-yellow-300/25 dark:text-yellow-300"
      variant="outline"
    >
      <span className="size-1.5 rounded-full bg-current" />
      Pendente
    </Badge>
  )
}

function FulfillmentBadge({ status }: { status: OrderRow['fulfillment'] }) {
  if (status === 'Fulfilled') {
    return (
      <Badge
        className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300"
        variant="outline"
      >
        <span className="size-1.5 rounded-full bg-current" />
        Atendido
      </Badge>
    )
  }

  if (status === 'Returned') {
    return (
      <Badge variant="destructive">
        <span className="size-1.5 rounded-full bg-current" />
        Devolvido
      </Badge>
    )
  }

  return (
    <Badge variant="destructive">
      <span className="size-1.5 rounded-full bg-current" />
      Não atendido
    </Badge>
  )
}

export const recentOrdersColumns: ColumnDef<OrderRow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="w-10">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos os pedidos"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-10">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Selecionar pedido ${row.original.id}`}
        />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'id',
    header: 'Pedido',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <div className="font-medium leading-none">{row.original.id}</div>
        <div className="text-xs text-muted-foreground">{row.original.items}</div>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'customer',
    header: 'Cliente',
  },
  {
    id: 'statusSummary',
    header: 'Status',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <PaymentBadge status={row.original.payment} />
        <FulfillmentBadge status={row.original.fulfillment} />
      </div>
    ),
    filterFn: (row, _columnId, value) => {
      if (value === 'Requer ação') {
        return (
          row.original.payment === 'Pending' ||
          row.original.payment === 'Refunded' ||
          row.original.fulfillment === 'Unfulfilled' ||
          row.original.fulfillment === 'Returned'
        )
      }

      if (value === 'Não atendido') {
        return row.original.fulfillment === 'Unfulfilled'
      }

      if (value === 'Não pago') {
        return row.original.payment === 'Pending'
      }

      if (value === 'Devoluções') {
        return row.original.payment === 'Refunded' || row.original.fulfillment === 'Returned'
      }

      return true
    },
  },
  {
    accessorKey: 'total',
    header: () => <div className="w-28">Total</div>,
    cell: ({ row }) => <div className="w-28 tabular-nums">{row.original.total}</div>,
  },
  {
    accessorKey: 'date',
    header: () => <div className="w-44">Data</div>,
    cell: ({ row }) => <div className="w-44 text-muted-foreground">{formatOrderDate(row.original.date)}</div>,
  },
  {
    id: 'actions',
    header: () => <div className="flex w-full justify-end">Ações</div>,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex w-full justify-end">
            <Button aria-label="Abrir ações do pedido" size="icon-sm" variant="ghost">
              <MoreHorizontal />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Ações do pedido</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>Ver pedido</DropdownMenuItem>
            <DropdownMenuItem>Contatar cliente</DropdownMenuItem>
            <DropdownMenuItem>Copiar ID do pedido</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableHiding: false,
    enableSorting: false,
  },
]
