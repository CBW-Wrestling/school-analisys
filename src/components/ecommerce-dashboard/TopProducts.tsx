import { ArrowUpRight } from 'lucide-react'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const categories = [
  {
    name: 'Vestuário',
    share: 44,
    color: 'var(--chart-3)',
  },
  {
    name: 'Acessórios',
    share: 32,
    color: 'var(--chart-2)',
  },
  {
    name: 'Casa',
    share: 24,
    color: 'var(--chart-1)',
  },
] as const

const products = [
  {
    name: 'Camisa de linho',
    category: 'Vestuário',
    share: '31%',
    sales: '$14,820',
  },
  {
    name: 'Bolsa do dia a dia',
    category: 'Acessórios',
    share: '24%',
    sales: '$11,460',
  },
  {
    name: 'Vaso de cerâmica',
    category: 'Casa',
    share: '18%',
    sales: '$8,930',
  },
] as const

export function TopProducts() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">Produtos mais vendidos</CardTitle>
        <CardDescription className="text-xl leading-none tracking-tight text-foreground tabular-nums">
          73% das vendas
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div aria-label="Vendas por categoria" className="flex h-2 gap-1 overflow-hidden bg-muted" role="img">
            {categories.map((category) => (
              <div
                aria-hidden="true"
                key={category.name}
                className="rounded-md"
                style={{
                  backgroundColor: category.color,
                  width: `${category.share}%`,
                }}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <div className="flex items-center gap-1" key={category.name}>
                <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="text-xs text-muted-foreground">{category.name}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-3">
          <div className="text-xs text-muted-foreground">Produtos</div>
          <div className="text-xs text-muted-foreground">Participação</div>
          <div className="text-xs text-muted-foreground">Vendas</div>

          {products.map((product) => (
            <div className="contents text-sm" key={product.name}>
              <div className="min-w-0">
                <div className="truncate font-medium">{product.name}</div>
                <div className="text-xs text-muted-foreground">{product.category}</div>
              </div>
              <div className="self-center text-muted-foreground tabular-nums">{product.share}</div>
              <div className="self-center font-medium tabular-nums">{product.sales}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
