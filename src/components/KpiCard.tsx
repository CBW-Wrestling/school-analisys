import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card, CardAction, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type Props = {
  icon: LucideIcon
  label: string
  value: string
  description?: string
  loading?: boolean
  info?: ReactNode
}

// KPI no estilo do template (ícone + número grande), sem badge de tendência: não há dado real de período anterior.
export function KpiCard({ icon: Icon, label, value, description, loading = false, info }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex items-center gap-1.5">{label}{info}</CardDescription>
        <CardAction><Icon className="size-4 text-muted-foreground" aria-hidden /></CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {loading ? <Skeleton className="h-9 w-20" /> : <span className="text-3xl leading-none tracking-tight tabular-nums">{value}</span>}
        {description && (loading ? <Skeleton className="h-4 w-32" /> : <p className="text-sm text-muted-foreground">{description}</p>)}
      </CardContent>
    </Card>
  )
}
