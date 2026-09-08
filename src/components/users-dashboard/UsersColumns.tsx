import type { ColumnDef } from '@tanstack/react-table'
import { parse } from 'date-fns'
import { Check, Clock, MoreHorizontal, X } from 'lucide-react'
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, getAvatarTone, getInitials } from '@/lib/utils'
import { statusLabels, statusMeta, type UserRow } from './data'

function RoleCell({ role, team }: { role: string; team: string }) {
  return (
    <div className="grid gap-0.5">
      <span className="whitespace-nowrap">{role}</span>
      <span className="text-xs text-muted-foreground">{team}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: UserRow['status'] }) {
  const meta = statusMeta[status]

  return (
    <Badge className={cn('gap-1.5 border px-2 py-1 font-medium', meta.badgeClass)} variant="outline">
      <span className={cn('size-1.5 rounded-full', meta.dotClass)} />
      {statusLabels[status]}
    </Badge>
  )
}

function getLastActiveBadge(lastActive: number) {
  if (lastActive < 1) {
    return {
      className: 'bg-green-600 text-green-950 [&>svg]:text-white',
      icon: Check,
    }
  }

  if (lastActive < 4 * 60) {
    return {
      className: 'bg-amber-500 text-amber-950',
      icon: Clock,
    }
  }

  if (lastActive < 7 * 24 * 60) {
    return {
      className: 'bg-destructive',
      icon: null,
    }
  }

  return {
    className: 'bg-muted-foreground text-muted',
    icon: X,
  }
}

function AvatarCell({ lastActive, name }: { lastActive: number; name: string }) {
  const badge = getLastActiveBadge(lastActive)
  const BadgeIcon = badge.icon

  return (
    <Avatar size="lg" className={cn('font-medium', getAvatarTone(name))}>
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
      <AvatarBadge className={badge.className}>{BadgeIcon ? <BadgeIcon /> : null}</AvatarBadge>
    </Avatar>
  )
}

function WorkspaceCell({ workspaces }: { workspaces: string[] }) {
  const [firstWorkspace, ...remainingWorkspaces] = workspaces
  const remainingCount = remainingWorkspaces.length

  return (
    <AvatarGroup className="*:data-[slot=avatar]:ring-0">
      {firstWorkspace ? (
        <Avatar className="after:rounded-sm">
          <AvatarFallback className="rounded-sm ring-0">{getInitials(firstWorkspace)}</AvatarFallback>
        </Avatar>
      ) : null}
      {remainingCount > 0 ? (
        <AvatarGroupCount className="rounded-sm border ring-card">+{remainingCount}</AvatarGroupCount>
      ) : null}
    </AvatarGroup>
  )
}

export const usersColumns: ColumnDef<UserRow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos os usuários"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Selecionar ${row.original.name}`}
        />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: 'search',
    accessorFn: (row) => `${row.name} ${row.email}`,
    filterFn: 'includesString',
    enableHiding: true,
  },
  {
    accessorKey: 'name',
    header: 'Usuário',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <AvatarCell name={row.original.name} lastActive={row.original.lastActive} />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">{row.original.name}</div>
          <div className="truncate text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'role',
    header: 'Cargo / Equipe',
    filterFn: 'equalsString',
    cell: ({ row }) => <RoleCell role={row.original.role} team={row.original.team} />,
  },
  {
    accessorKey: 'team',
    header: 'Equipe',
    filterFn: 'equalsString',
    cell: ({ row }) => <div className="text-sm">{row.original.team}</div>,
  },
  {
    accessorKey: 'workspace',
    header: 'Workspace',
    filterFn: 'arrIncludes',
    cell: ({ row }) => <WorkspaceCell workspaces={row.original.workspace} />,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: 'equalsString',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: 'joinedDate',
    accessorFn: (row) => parse(row.joinedDate, 'dd MMM yyyy, h:mm a', new Date()).getTime(),
    header: 'Data de entrada',
    cell: ({ row }) => <div className="text-sm text-foreground">{row.original.joinedDate}</div>,
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={`Abrir ações de ${row.original.name}`}
              className="size-8 rounded-md text-muted-foreground hover:bg-muted/50"
              size="icon-sm"
              variant="ghost"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Ver perfil</DropdownMenuItem>
            <DropdownMenuItem>Editar usuário</DropdownMenuItem>
            <DropdownMenuItem>Gerenciar equipe</DropdownMenuItem>
            <DropdownMenuItem>Reenviar convite</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Desativar usuário</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
]
