import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Download, RotateCw, Settings2 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BalanceDistributionCard } from '../components/finance-dashboard/BalanceDistributionCard'
import { FinanceNotification } from '../components/finance-dashboard/FinanceNotification'
import { IncomeBreakdown } from '../components/finance-dashboard/IncomeBreakdown'
import { OverviewKpis } from '../components/finance-dashboard/OverviewKpis'
import { QuickActions } from '../components/finance-dashboard/QuickActions'
import { TransactionsOverviewCard } from '../components/finance-dashboard/TransactionsOverviewCard'
import { UpcomingTransactions } from '../components/finance-dashboard/UpcomingTransactions'
import { Wallet } from '../components/finance-dashboard/Wallet'

export function FinanceDashboardPage() {
  const formattedDate = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <PageHeader active="finance">
      <div className="@container/main flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Alert>
          <AlertTitle>Visão de demonstração</AlertTitle>
          <AlertDescription>Os indicadores e registros desta tela são exemplos de interface e não representam dados da plataforma.</AlertDescription>
        </Alert>

        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight capitalize">Finanças pessoais</h1>
          <p className="text-muted-foreground text-sm capitalize">{formattedDate}</p>
        </div>

        <Tabs defaultValue="dashboard" className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <TabsList variant="line">
              <TabsTrigger value="dashboard">Painel</TabsTrigger>
              <TabsTrigger value="accounts">Contas</TabsTrigger>
              <TabsTrigger value="transactions">Transações</TabsTrigger>
            </TabsList>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <RotateCw className="size-4" />
                <span>Atualizado há 5 min</span>
              </div>
              <Button size="sm" variant="outline">
                <Settings2 />
                Configurações
              </Button>
              <Button size="sm" variant="outline">
                <Download data-icon="inline-start" />
                Exportar
              </Button>
            </div>
          </div>

          <TabsContent value="dashboard" className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-6">
                <OverviewKpis />
              </div>

              <div className="flex flex-col gap-4 xl:col-span-6">
                <IncomeBreakdown />
                <FinanceNotification />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-7">
                <TransactionsOverviewCard />
              </div>
              <div className="xl:col-span-5">
                <BalanceDistributionCard />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-4">
                <Wallet />
              </div>
              <div className="xl:col-span-4">
                <UpcomingTransactions />
              </div>
              <div className="xl:col-span-4">
                <QuickActions />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="accounts">
            <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
              Visão de contas em breve.
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
              Visão de transações em breve.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageHeader>
  )
}
