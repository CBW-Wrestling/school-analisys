import { Progress } from '@/components/ui/progress'

export function BarRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.max(4, (value / total) * 100) : 0
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono font-medium text-foreground">{value}</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  )
}
