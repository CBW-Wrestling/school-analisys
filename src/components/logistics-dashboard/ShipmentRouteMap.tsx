import { Plane, Ship, Truck } from 'lucide-react'

import { cn } from '@/lib/utils'

import { countryFlagEmoji, type Shipment } from './shipment-data'

const modeIcons = {
  air: Plane,
  land: Truck,
  sea: Ship,
} as const

const modeLabels = {
  air: 'Transporte aéreo',
  land: 'Transporte rodoviário',
  sea: 'Transporte marítimo',
} as const

type ShipmentRouteMapProps = {
  shipment: Shipment | null
}

function LocationPin({ location }: { location: Shipment['origin'] }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span aria-hidden className="text-4xl leading-none">{countryFlagEmoji(location.countryCode)}</span>
      <div>
        <div className="font-medium text-sm leading-tight">{location.country}</div>
        <div className="text-muted-foreground text-xs">{location.display}</div>
      </div>
    </div>
  )
}

// Simplified route summary card (no geographic map library / remote atlas fetch).
export function ShipmentRouteMap({ shipment }: ShipmentRouteMapProps) {
  if (!shipment) {
    return (
      <div className="grid size-full min-h-0 place-items-center bg-[#d4dadc] text-muted-foreground text-sm dark:bg-[#2C353C]">
        Selecione uma remessa para ver a rota.
      </div>
    )
  }

  const Icon = modeIcons[shipment.mode]

  return (
    <div className="flex size-full min-h-0 flex-col items-center justify-center gap-6 bg-[#d4dadc] px-6 dark:bg-[#2C353C]">
      <div className="flex w-full max-w-xl items-center justify-between gap-4">
        <LocationPin location={shipment.origin} />

        <div className="flex flex-1 items-center gap-1">
          <span
            className="h-px min-w-0 flex-1 border-foreground border-t border-dashed"
            style={{ flexGrow: shipment.progress }}
          />
          <span className="grid size-8 shrink-0 place-items-center rounded-full border bg-background text-primary">
            <Icon className={cn('size-4', shipment.mode === 'air' && 'rotate-45')} />
          </span>
          <span
            className="h-px min-w-0 flex-1 border-border border-t border-dashed"
            style={{ flexGrow: 100 - shipment.progress }}
          />
        </div>

        <LocationPin location={shipment.destination} />
      </div>

      <div className="text-center text-muted-foreground text-xs">
        {modeLabels[shipment.mode]} · {shipment.transportNumber} · {shipment.progress}% concluído
      </div>
    </div>
  )
}
