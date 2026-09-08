import {
  AlertTriangleIcon,
  ArrowUp,
  Ban,
  Droplets,
  Forklift,
  type LucideIcon,
  PackageCheck,
  PenLine,
  ShieldCheck,
  Snowflake,
  Thermometer,
} from 'lucide-react'

export type ShipmentStatus =
  | 'Agendado'
  | 'Em trânsito'
  | 'Saiu para entrega'
  | 'Entregue'
  | 'Atrasado'
  | 'Em espera'
  | 'Retido na alfândega'

export type TransportMode = 'land' | 'air' | 'sea'
export type RouteType = 'road' | 'flight' | 'ship'
export type CustomerTier = 'Prioritário' | 'Padrão' | 'Não prioritário'

export type GeoCoordinate = [longitude: number, latitude: number]

export type ShipmentLocation = {
  display: string
  country: string
  countryCode: string
}

export type ShipmentCustomer = {
  name: string
  initials: string
  id: string
  tier: CustomerTier
  tierLabel: string
}

export type HandlingTag = {
  label: string
  icon: LucideIcon
}

export type ShipmentHandling = {
  label: string
  note: string
  tags: HandlingTag[]
}

export type Shipment = {
  id: string
  customer: ShipmentCustomer
  origin: ShipmentLocation
  destination: ShipmentLocation
  cargo: string
  handling: ShipmentHandling
  weight: string
  eta: string
  etaMeta: string
  status: ShipmentStatus
  progress: number
  mode: TransportMode
  routeType: RouteType
  transportNumber: string
}

const customerAccounts = {
  techCorp: {
    name: 'TechCorp',
    initials: 'TC',
    id: 'SDA-1001-2401-01',
    tier: 'Prioritário',
    tierLabel: 'Top 1% em volume de remessas',
  },
  regionalRoadExpress: {
    name: 'Regional Road Express',
    initials: 'RR',
    id: 'SDA-1002-2402-02',
    tier: 'Prioritário',
    tierLabel: 'Top 1% em volume de remessas',
  },
  sendWell: {
    name: 'SendWell B.V.',
    initials: 'SW',
    id: 'SDA-1003-2403-03',
    tier: 'Prioritário',
    tierLabel: 'Top 1% em volume de remessas',
  },
  sourceDay: {
    name: 'SourceDay',
    initials: 'SD',
    id: 'SDA-1004-2404-04',
    tier: 'Padrão',
    tierLabel: 'Conta de remessas recorrentes',
  },
  shippingEasy: {
    name: 'ShippingEasy',
    initials: 'SE',
    id: 'SDA-1005-2405-05',
    tier: 'Padrão',
    tierLabel: 'Conta de remessas recorrentes',
  },
  logisticsPlus: {
    name: 'Logistics Plus',
    initials: 'LP',
    id: 'SDA-1007-2407-07',
    tier: 'Padrão',
    tierLabel: 'Conta de frete gerenciada',
  },
  maersk: {
    name: 'Maersk',
    initials: 'MK',
    id: 'SDA-1010-2410-10',
    tier: 'Prioritário',
    tierLabel: 'Top 1% em volume de remessas',
  },
  flexport: {
    name: 'Flexport',
    initials: 'FX',
    id: 'SDA-1011-2411-11',
    tier: 'Prioritário',
    tierLabel: 'Top 1% em volume de remessas',
  },
} satisfies Record<string, ShipmentCustomer>

export const shipments: Shipment[] = [
  {
    id: 'SDA-01-2401',
    customer: customerAccounts.techCorp,
    origin: { display: 'Aeroporto de CGK', country: 'Indonésia', countryCode: 'ID' },
    destination: { display: 'Aeroporto de SIN', country: 'Singapura', countryCode: 'SG' },
    cargo: 'Eletrônicos de consumo',
    handling: {
      label: 'Eletrônicos frágeis',
      note: 'Manter o pacote lacrado até a entrega.',
      tags: [
        { label: 'Não empilhar', icon: Ban },
        { label: 'Manter na vertical', icon: ArrowUp },
        { label: 'Assinatura obrigatória', icon: PenLine },
      ],
    },
    weight: '2.450 kg',
    eta: '08:45',
    etaMeta: 'Hoje',
    status: 'Em trânsito',
    progress: 65,
    mode: 'air',
    routeType: 'flight',
    transportNumber: 'GA-884',
  },
  {
    id: 'SDA-02-2402',
    customer: customerAccounts.regionalRoadExpress,
    origin: { display: 'Surabaya', country: 'Indonésia', countryCode: 'ID' },
    destination: { display: 'Semarang', country: 'Indonésia', countryCode: 'ID' },
    cargo: 'Maquinário industrial',
    handling: {
      label: 'Máquinas pesadas',
      note: 'Fixar o maquinário no pallet antes do transporte rodoviário.',
      tags: [
        { label: 'Somente empilhadeira', icon: Forklift },
        { label: 'Fixar a carga', icon: ShieldCheck },
        { label: 'Não tombar', icon: Ban },
      ],
    },
    weight: '8.120 kg',
    eta: '11:20',
    etaMeta: 'Amanhã',
    status: 'Atrasado',
    progress: 42,
    mode: 'land',
    routeType: 'road',
    transportNumber: 'B 9042 KX',
  },
  {
    id: 'SDA-03-2403',
    customer: customerAccounts.sendWell,
    origin: { display: 'Porto de Tanjung Priok', country: 'Indonésia', countryCode: 'ID' },
    destination: { display: 'Porto de Singapura', country: 'Singapura', countryCode: 'SG' },
    cargo: 'Frutos do mar congelados',
    handling: {
      label: 'Temperatura controlada',
      note: 'Manter cadeia de congelamento a -18°C ou menos até a entrega no porto.',
      tags: [
        { label: 'Registrar temperatura', icon: Thermometer },
        { label: 'Manter congelado', icon: Snowflake },
        { label: 'Lacre intacto', icon: ShieldCheck },
      ],
    },
    weight: '19.800 kg',
    eta: '21:15',
    etaMeta: 'Entregue ontem',
    status: 'Entregue',
    progress: 100,
    mode: 'sea',
    routeType: 'ship',
    transportNumber: 'MV SEA-318',
  },
  {
    id: 'SDA-04-2404',
    customer: customerAccounts.maersk,
    origin: { display: 'Aeroporto de KUL', country: 'Malásia', countryCode: 'MY' },
    destination: { display: 'Aeroporto de BKK', country: 'Tailândia', countryCode: 'TH' },
    cargo: 'Kits farmacêuticos',
    handling: {
      label: 'Temperatura controlada',
      note: 'Manter temperatura controlada e confirmar liberação alfandegária antes de soltar a carga.',
      tags: [
        { label: 'Registrar temperatura', icon: Thermometer },
        { label: 'Manter na vertical', icon: ArrowUp },
        { label: 'Assinatura obrigatória', icon: PenLine },
      ],
    },
    weight: '540 kg',
    eta: '18:10',
    etaMeta: 'Hoje',
    status: 'Em espera',
    progress: 28,
    mode: 'air',
    routeType: 'flight',
    transportNumber: 'MH-728',
  },
  {
    id: 'SDA-05-2405',
    customer: customerAccounts.sourceDay,
    origin: { display: 'Bandung', country: 'Indonésia', countryCode: 'ID' },
    destination: { display: 'Yogyakarta', country: 'Indonésia', countryCode: 'ID' },
    cargo: 'Têxteis',
    handling: {
      label: 'Frete padrão',
      note: 'Manter as caixas secas e longe da luz solar direta.',
      tags: [
        { label: 'Manter seco', icon: Droplets },
        { label: 'Não amassar', icon: Ban },
        { label: 'Entrega padrão', icon: PackageCheck },
      ],
    },
    weight: '1.380 kg',
    eta: '09:30',
    etaMeta: 'Sexta-feira',
    status: 'Agendado',
    progress: 12,
    mode: 'land',
    routeType: 'road',
    transportNumber: 'D 1284 YA',
  },
  {
    id: 'SDA-06-2406',
    customer: customerAccounts.logisticsPlus,
    origin: { display: 'Porto de Klang', country: 'Malásia', countryCode: 'MY' },
    destination: { display: 'Porto de Laem Chabang', country: 'Tailândia', countryCode: 'TH' },
    cargo: 'Materiais de construção',
    handling: {
      label: 'Carga pesada a granel',
      note: 'Carregar com equipamento de içamento pesado e prender contra deslocamento.',
      tags: [
        { label: 'Içamento pesado', icon: Forklift },
        { label: 'Fixar a carga', icon: ShieldCheck },
        { label: 'Não empilhar', icon: Ban },
      ],
    },
    weight: '27.400 kg',
    eta: '15:40',
    etaMeta: 'Saindo hoje',
    status: 'Agendado',
    progress: 18,
    mode: 'sea',
    routeType: 'ship',
    transportNumber: 'MV LC-204',
  },
  {
    id: 'SDA-07-2407',
    customer: customerAccounts.flexport,
    origin: { display: 'Aeroporto de HKG', country: 'Hong Kong', countryCode: 'HK' },
    destination: { display: 'Aeroporto de MNL', country: 'Filipinas', countryCode: 'PH' },
    cargo: 'Dispositivos médicos',
    handling: {
      label: 'Equipamento médico sensível',
      note: 'Manter os dispositivos lacrados até a conclusão da inspeção alfandegária.',
      tags: [
        { label: 'Lacre intacto', icon: ShieldCheck },
        { label: 'Manter na vertical', icon: ArrowUp },
        { label: 'Assinatura obrigatória', icon: PenLine },
      ],
    },
    weight: '860 kg',
    eta: 'Pendente',
    etaMeta: 'Alfândega',
    status: 'Retido na alfândega',
    progress: 33,
    mode: 'air',
    routeType: 'flight',
    transportNumber: 'CX-901',
  },
  {
    id: 'SDA-08-2408',
    customer: customerAccounts.shippingEasy,
    origin: { display: 'Jacarta', country: 'Indonésia', countryCode: 'ID' },
    destination: { display: 'Bandung', country: 'Indonésia', countryCode: 'ID' },
    cargo: 'Vestuário de varejo',
    handling: {
      label: 'Frete padrão',
      note: 'Manter as caixas secas e ligar para o destinatário antes da entrega final.',
      tags: [
        { label: 'Manter seco', icon: Droplets },
        { label: 'Ligar antes da entrega', icon: AlertTriangleIcon },
        { label: 'Entrega padrão', icon: PackageCheck },
      ],
    },
    weight: '620 kg',
    eta: '14:15',
    etaMeta: 'Hoje',
    status: 'Saiu para entrega',
    progress: 88,
    mode: 'land',
    routeType: 'road',
    transportNumber: 'B 7712 JKT',
  },
]

export function countryFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
}
