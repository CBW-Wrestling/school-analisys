import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { recentCustomers } from './customers-table/data'
import { RecentCustomersTable } from './customers-table/table'

export function SubscriberOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">{recentCustomers.length.toLocaleString('pt-BR')} registros de exemplo</CardTitle>
        <CardDescription>Registros sintéticos para demonstrar a tabela, seus estados e sua densidade de informação.</CardDescription>
        <CardAction>
          <Badge variant="outline">Demonstração</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-0">
        <RecentCustomersTable data={recentCustomers} />
      </CardContent>
    </Card>
  )
}
