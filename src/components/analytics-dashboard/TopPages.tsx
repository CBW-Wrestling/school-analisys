import { Ellipsis } from 'lucide-react'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Dados sintéticos (mesma forma/magnitude do bloco de referência analytics) — sem dado real de negócio.
const pages = [
  { bounce: '24%', path: '/dashboard', time: '3m 12s', views: '64,2 mil' },
  { bounce: '31%', path: '/precos', time: '2m 08s', views: '41,8 mil' },
  { bounce: '18%', path: '/docs/primeiros-passos', time: '4m 44s', views: '28,6 mil' },
  { bounce: '22%', path: '/blog/guia-de-analytics', time: '5m 06s', views: '19,3 mil' },
  { bounce: '42%', path: '/contato', time: '1m 18s', views: '8,9 mil' },
]

export function TopPages() {
  return (
    <Card className="h-full gap-2">
      <CardHeader>
        <CardTitle className="font-normal">Desempenho de páginas</CardTitle>
        <CardAction>
          <Ellipsis className="size-4" aria-hidden="true" />
        </CardAction>
      </CardHeader>

      <CardContent className="px-0">
        <Table className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
          <TableHeader className="[&_tr]:border-border/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8" />
              <TableHead className="h-8 w-24 text-right font-normal">Visualizações</TableHead>
              <TableHead className="h-8 w-24 text-right font-normal">Tempo médio</TableHead>
              <TableHead className="h-8 w-20 text-right font-normal">Rejeição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr]:border-border/50">
            {pages.map((page) => (
              <TableRow className="hover:bg-transparent" key={page.path}>
                <TableCell className="max-w-0 truncate py-4 font-medium">{page.path}</TableCell>
                <TableCell className="text-right tabular-nums">{page.views}</TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">{page.time}</TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">{page.bounce}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
