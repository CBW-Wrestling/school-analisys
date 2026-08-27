import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function Metric({ label, value, loading = false }: { label: string; value: string; loading?: boolean }) {
  return (
    <Card className="bg-gradient-to-t from-primary/5 to-card shadow-xs">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        {loading ? <Skeleton className="h-8 w-20" /> : <CardTitle className="font-mono text-2xl font-semibold tabular-nums">{value}</CardTitle>}
      </CardHeader>
    </Card>
  )
}
