import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="bg-gradient-to-t from-primary/5 to-card shadow-xs">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-mono text-2xl font-semibold tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}
