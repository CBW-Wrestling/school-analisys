import {
  Activity,
  FileUp,
  LayoutDashboard,
  LayoutPanelTop,
  Medal,
  Plus,
  ShieldPlus,
  Sparkles,
  UsersRound,
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
]

export const operations: NavigationItem[] = [
  { id: 'competition-import', label: 'Criar competição', href: '?view=competition-import', icon: Plus },
  { id: 'results-import', label: 'Importar resultados', href: '?view=results-import', icon: FileUp },
]

export const allNavItems: NavigationItem[] = [
  ...overviewNav,
  ...assessmentsNav,
  ...resultsNav,
  ...operations,
  ...examplesNav,
]
