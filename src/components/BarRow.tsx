export function BarRow({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div className="bar-row">
      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <i><em style={{ width: `${Math.max(4, (value / total) * 100)}%` }} /></i>
    </div>
  )
}
