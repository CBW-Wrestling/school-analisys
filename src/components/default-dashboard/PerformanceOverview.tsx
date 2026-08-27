import { addHours, endOfToday, format, parseISO, subHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Area, CartesianGrid, ComposedChart, Line, XAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

// Série sintética (mesma forma/magnitude do bloco de referência dashboard-01) — sem dado real de negócio.
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const POINT_COUNT = 180
const chartValues = Array.from({ length: POINT_COUNT }, (_, index) => ({
  newCustomers: Math.round(6000 + seededRandom(index * 1.7) * 19000),
  activeAccounts: Math.round(5800 + seededRandom(index * 2.9 + 7) * 800),
  returningUsers: Math.round(4270 + seededRandom(index * 4.1 + 13) * 600),
}))

const endDate = endOfToday()
const startDate = subHours(endDate, (chartValues.length - 1) * 12)

const chartData = chartValues.map((point, index) => ({
  date: format(addHours(startDate, index * 12), 'yyyy-MM-dd'),
  ...point,
}))

const chartConfig = {
  newCustomers: {
    label: 'Novos cadastros',
    color: 'var(--chart-1)',
  },
  activeAccounts: {
    label: 'Contas ativas',
    color: 'var(--chart-2)',
  },
  returningUsers: {
    label: 'Retornos',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig

export function PerformanceOverview() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="leading-none">Atividade de exemplo</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">Série sintética para demonstrar a visualização de três meses</span>
          <span className="@[540px]/card:hidden">Série demonstrativa</span>
        </CardDescription>
        <CardAction>
          <Badge variant="outline">Demonstração</Badge>
        </CardAction>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-80 w-full"
          role="img"
          aria-label="Gráfico demonstrativo de atividade com séries sintéticas de novos cadastros, contas ativas e retornos em três meses"
        >
          <ComposedChart data={chartData} margin={{ top: 0 }}>
            <defs>
              <linearGradient id="fillNewCustomers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-newCustomers)" stopOpacity={0.36} />
                <stop offset="95%" stopColor="var(--color-newCustomers)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.5} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={48}
              tickFormatter={(value) =>
                parseISO(value).toLocaleDateString('pt-BR', {
                  month: 'short',
                  day: 'numeric',
                })
              }
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-50"
                  indicator="line"
                  labelFormatter={(value) => format(parseISO(String(value)), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                />
              }
            />
            <ChartLegend verticalAlign="top" content={<ChartLegendContent className="mb-5 justify-end" />} />

            <Area
              dataKey="newCustomers"
              type="natural"
              fill="url(#fillNewCustomers)"
              stroke="var(--color-newCustomers)"
              strokeWidth={1.25}
              dot={false}
              fillOpacity={1}
            />
            <Line
              dataKey="activeAccounts"
              type="natural"
              stroke="var(--color-activeAccounts)"
              strokeWidth={1.4}
              dot={false}
            />
            <Line
              dataKey="returningUsers"
              type="natural"
              stroke="var(--color-returningUsers)"
              strokeWidth={1.2}
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
