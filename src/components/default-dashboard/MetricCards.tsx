import { DollarSign, TrendingDown, TrendingUp, UserPlus, Users, Waves } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <DollarSign className="size-4" aria-hidden="true" />
            </div>
          </CardTitle>
          <CardDescription>Receita demonstrativa</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-3xl font-medium leading-none tracking-tight tabular-nums">$1,250.00</div>
            <Badge aria-label="Tendência positiva: 12,5%">
              <TrendingUp className="size-3" aria-hidden="true" />
              +12.5%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Exemplo dos últimos seis meses</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <UserPlus className="size-4" aria-hidden="true" />
            </div>
          </CardTitle>
          <CardDescription>Novos cadastros</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-3xl font-medium leading-none tracking-tight tabular-nums">1,234</div>
            <Badge variant="destructive" aria-label="Tendência negativa: 20%">
              <TrendingDown className="size-3" aria-hidden="true" />
              -20%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Exemplo de indicador em queda</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <Users className="size-4" aria-hidden="true" />
            </div>
          </CardTitle>
          <CardDescription>Contas ativas</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-3xl font-medium leading-none tracking-tight tabular-nums">45,678</div>
            <Badge aria-label="Tendência positiva: 12,5%">
              <TrendingUp className="size-3" aria-hidden="true" />
              +12.5%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Exemplo de meta atingida</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <Waves className="size-4" aria-hidden="true" />
            </div>
          </CardTitle>
          <CardDescription>Taxa de crescimento</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-3xl font-medium leading-none tracking-tight tabular-nums">4.5%</div>
            <Badge aria-label="Tendência positiva: 4,5%">
              <TrendingUp className="size-3" aria-hidden="true" />
              +4.5%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Exemplo de projeção atingida</p>
        </CardContent>
      </Card>
    </div>
  )
}
