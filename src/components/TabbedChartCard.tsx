import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Tab = {
  value: string
  label: string
  content: ReactNode
}

type Props = {
  eyebrow?: string
  title: string
  description?: string
  tabs: Tab[]
  defaultValue?: string
}

// Card com abas internas para alternar entre visualizações relacionadas sem disputar largura.
export function TabbedChartCard({ eyebrow, title, description, tabs, defaultValue }: Props) {
  return (
    <Card>
      <Tabs defaultValue={defaultValue ?? tabs[0]?.value} className="gap-4">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              {eyebrow && <CardDescription>{eyebrow}</CardDescription>}
              <CardTitle>{title}</CardTitle>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <TabsList>
              {tabs.map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}
            </TabsList>
          </div>
        </CardHeader>
        <CardContent>
          {tabs.map((tab) => <TabsContent key={tab.value} value={tab.value} className="mt-0">{tab.content}</TabsContent>)}
        </CardContent>
      </Tabs>
    </Card>
  )
}
