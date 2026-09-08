import type { ReactNode } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn, getAvatarTone, getInitials } from '@/lib/utils'

type Props = {
  name: string
  subtitle?: ReactNode
  onClick?: () => void
}

// Bloco de identidade padrão (avatar com iniciais coloridas + nome) usado nas tabelas de atletas/usuários.
export function AthleteCell({ name, subtitle, onClick }: Props) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className={cn('shrink-0 font-medium', getAvatarTone(name))}>
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="grid min-w-0 gap-0.5">
        {onClick ? (
          <button type="button" onClick={onClick} className="truncate text-left font-medium hover:underline">{name}</button>
        ) : (
          <span className="truncate font-medium">{name}</span>
        )}
        {subtitle && <span className="truncate text-xs text-muted-foreground">{subtitle}</span>}
      </div>
    </div>
  )
}
