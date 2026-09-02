import { Ellipsis } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, LabelList, type LabelProps, XAxis, YAxis } from 'recharts'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const chartConfig = {
  visitors: {
    color: 'var(--chart-1)',
    label: 'Visitantes',
  },
} satisfies ChartConfig

type TrafficSourceDatum = {
  label: string
  source: string
  visitors: number
}

// Dados sintéticos (mesma forma/magnitude do bloco de referência analytics) — sem dado real de negócio.
const sourcesData: TrafficSourceDatum[] = [
  { label: '89,4 mil', source: 'Busca orgânica', visitors: 89_400 },
  { label: '55,2 mil', source: 'Direto', visitors: 55_200 },
  { label: '38,1 mil', source: 'Redes sociais', visitors: 38_100 },
  { label: '30,4 mil', source: 'Indicação', visitors: 30_400 },
  { label: '22,7 mil', source: 'Pago', visitors: 22_700 },
]

const campaignsData: TrafficSourceDatum[] = [
  { label: '16,8 mil', source: 'Lançamento de primavera', visitors: 16_800 },
  { label: '12,0 mil', source: 'Newsletter', visitors: 12_000 },
  { label: '7,7 mil', source: 'Retargeting', visitors: 7700 },
  { label: '5,9 mil', source: 'Busca de marca', visitors: 5900 },
  { label: '4,3 mil', source: 'Parceiros', visitors: 4300 },
]

const referrersData: TrafficSourceDatum[] = [
  { label: '18,4 mil', source: 'Google', visitors: 18_400 },
  { label: '8,9 mil', source: 'LinkedIn', visitors: 8900 },
  { label: '5,7 mil', source: 'Product Hunt', visitors: 5700 },
  { label: '4,8 mil', source: 'GitHub', visitors: 4800 },
  { label: '3,6 mil', source: 'Medium', visitors: 3600 },
]

function renderValueLabel(props: LabelProps) {
  const { height, value, y } = props

  return (
    <text
      className="fill-foreground"
      dominantBaseline="middle"
      dx={-6}
      fontSize={14}
      textAnchor="end"
      x="100%"
      y={Number(y) + Number(height) / 2}
    >
      {value}
    </text>
  )
}

function TrafficSourceBarChart({ data }: { data: TrafficSourceDatum[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{
          left: 0,
          right: 48,
        }}
      >
        <CartesianGrid horizontal={false} vertical={false} />
        <YAxis dataKey="source" hide tickLine={false} tickMargin={10} type="category" />
        <XAxis dataKey="visitors" hide type="number" />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <Bar barSize={40} dataKey="visitors" fill="var(--color-visitors)" fillOpacity={0.5} radius={8}>
          <LabelList className="fill-foreground" dataKey="source" fontSize={14} offset={12} position="insideLeft" />
          <LabelList content={renderValueLabel} dataKey="label" />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function TopTrafficSources() {
  return (
    <Card className="h-full gap-2">
      <CardHeader>
        <CardTitle className="font-normal">Origens de tráfego</CardTitle>
        <CardAction>
          <Ellipsis className="size-4" aria-hidden="true" />
        </CardAction>
      </CardHeader>

      <CardContent className="px-0">
        <Tabs defaultValue="sources" className="flex flex-col gap-3">
          <TabsList className="w-full justify-start border-b px-2.5" variant="line">
            <TabsTrigger className="flex-none font-normal" value="sources">
              Origens
            </TabsTrigger>
            <TabsTrigger className="flex-none font-normal" value="campaigns">
              Campanhas
            </TabsTrigger>
            <TabsTrigger className="flex-none font-normal" value="referrers">
              Referências
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="px-4">
            <TrafficSourceBarChart data={sourcesData} />
          </TabsContent>

          <TabsContent value="campaigns" className="px-4">
            <TrafficSourceBarChart data={campaignsData} />
          </TabsContent>
          <TabsContent value="referrers" className="px-4">
            <TrafficSourceBarChart data={referrersData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
