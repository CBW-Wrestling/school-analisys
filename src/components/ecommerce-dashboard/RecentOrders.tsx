import { ArrowUpRight, Download, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { recentOrders } from './recent-orders-table/data'
import { RecentOrdersTable } from './recent-orders-table/table'

export function RecentOrders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">Pedidos recentes</CardTitle>
        <CardDescription className="text-xl leading-none tracking-tight text-foreground tabular-nums">
          {recentOrders.length.toLocaleString('pt-BR')} pedidos
        </CardDescription>
        <CardAction className="flex items-center gap-1">
          <Button aria-label="Abrir pedidos" size="icon-sm" variant="outline">
            <ArrowUpRight />
          </Button>
          <Button aria-label="Baixar pedidos" size="icon-sm" variant="outline">
            <Download />
          </Button>
          <Button aria-label="Mais ações" size="icon-sm" variant="outline">
            <MoreHorizontal />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="px-0 pt-0">
        <RecentOrdersTable data={recentOrders} />
      </CardContent>
    </Card>
  )
}
