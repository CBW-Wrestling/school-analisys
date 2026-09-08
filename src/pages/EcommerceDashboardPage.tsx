import { PageHeader } from '../components/PageHeader'
import { KpiStrip } from '../components/ecommerce-dashboard/KpiStrip'
import { StoreTraffic } from '../components/ecommerce-dashboard/StoreTraffic'
import { TrafficSources } from '../components/ecommerce-dashboard/TrafficSources'
import { TopProducts } from '../components/ecommerce-dashboard/TopProducts'
import { Inventory } from '../components/ecommerce-dashboard/Inventory'
import { CustomerReviews } from '../components/ecommerce-dashboard/CustomerReviews'
import { RecentOrders } from '../components/ecommerce-dashboard/RecentOrders'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function EcommerceDashboardPage() {
  return (
    <PageHeader active="ecommerce">
      <div className="@container/main flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Alert>
          <AlertTitle>Visão de demonstração</AlertTitle>
          <AlertDescription>Os indicadores e registros desta tela são exemplos de interface e não representam dados da plataforma.</AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <KpiStrip />
          <div className="xl:col-span-5">
            <StoreTraffic />
          </div>
          <div className="xl:col-span-7">
            <TrafficSources />
          </div>
          <div className="xl:col-span-4">
            <TopProducts />
          </div>
          <div className="xl:col-span-4">
            <Inventory />
          </div>
          <div className="xl:col-span-4">
            <CustomerReviews />
          </div>
          <div className="xl:col-span-12">
            <RecentOrders />
          </div>
        </div>
      </div>
    </PageHeader>
  )
}
