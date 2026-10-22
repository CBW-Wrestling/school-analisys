import { createElement } from 'react'
import { iconFor } from '../lib/athleteDetail'
import type { AthleteDetailItem, AthleteDetailSection } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function DetailRow({ item }: { item: AthleteDetailItem }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b py-1.5 last:border-b-0">
      <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">
        {item.value || <span className="font-normal text-muted-foreground">—</span>}
      </dd>
    </div>
  )
}

// Uma seção do detalhe por inscrição (perfil, físico, técnico…) como card.
export function DetailSectionCard({ section }: { section: AthleteDetailSection }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {createElement(iconFor(section.icon), { className: 'size-4', 'aria-hidden': true })}
          </span>
          <CardTitle>{section.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <dl>
          {section.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum dado registrado.</p>
          ) : (
            section.items.map((item) => <DetailRow key={item.code} item={item} />)
          )}
        </dl>
      </CardContent>
    </Card>
  )
}
