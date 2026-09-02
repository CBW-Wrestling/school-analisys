import {
  Activity,
  FileUp,
  GraduationCap,
  Handshake,
  HeartPulse,
  LayoutDashboard,
  LayoutPanelTop,
  LineChart,
  ListChecks,
  Medal,
  Plus,
  ShieldPlus,
  ShoppingBag,
  Sparkles,
  Truck,
  UserCheck,
  Users,
  UsersRound,
  Wallet,
} from 'lucide-react'
import type { ComponentType } from 'react'

export type NavigationItem = {
  id: string
  label: string
  href: string
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
}

export const overviewNav: NavigationItem[] = [
  { id: 'dashboard', label: 'Painel', href: '/', icon: LayoutDashboard },
]

export const assessmentsNav: NavigationItem[] = [
  { id: 'motor', label: 'Técnico', href: '?view=motor', icon: ShieldPlus },
  { id: 'physical', label: 'Físico', href: '?view=physical', icon: Activity },
  { id: 'profiles', label: 'Atletas', href: '?view=profiles', icon: UsersRound },
]

export const resultsNav: NavigationItem[] = [
  { id: 'results', label: 'Resultados', href: '?view=results', icon: Medal },
  { id: 'inferences', label: 'Inferências', href: '?view=inferences', icon: Sparkles },
]

export const examplesNav: NavigationItem[] = [
  { id: 'default', label: 'Default', href: '?view=default', icon: LayoutPanelTop },
  { id: 'analytics', label: 'Análises', href: '?view=analytics', icon: LineChart },
  { id: 'crm', label: 'CRM', href: '?view=crm', icon: Handshake },
  { id: 'ecommerce', label: 'E-commerce', href: '?view=ecommerce', icon: ShoppingBag },
  { id: 'finance', label: 'Finanças', href: '?view=finance', icon: Wallet },
  { id: 'academy', label: 'Academia', href: '?view=academy', icon: GraduationCap },
  { id: 'logistics', label: 'Logística', href: '?view=logistics', icon: Truck },
  { id: 'productivity', label: 'Produtividade', href: '?view=productivity', icon: ListChecks },
  { id: 'patient-monitoring', label: 'Monitoramento', href: '?view=patient-monitoring', icon: HeartPulse },
  { id: 'users', label: 'Usuários (exemplo)', href: '?view=users-example', icon: Users },
]

export const operations: NavigationItem[] = [
  { id: 'competition-import', label: 'Criar competição', href: '?view=competition-import', icon: Plus },
  { id: 'results-import', label: 'Importar resultados', href: '?view=results-import', icon: FileUp },
  { id: 'referee-import', label: 'Cadastrar árbitros', href: '?view=referee-import', icon: UserCheck },
]

export const allNavItems: NavigationItem[] = [
  ...overviewNav,
  ...assessmentsNav,
  ...resultsNav,
  ...operations,
  ...examplesNav,
]
