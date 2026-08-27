import {
  Activity,
  BarChart3,
  ClipboardList,
  FileUp,
  LayoutDashboard,
  LayoutPanelTop,
  Medal,
  Plus,
  ShieldPlus,
  UsersRound,
} from 'lucide-react'
import type { ComponentType } from 'react'

export type NavigationItem = {
  id: string
  label: string
  href: string
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
}

export const navigation: NavigationItem[] = [
  { id: 'dashboard', label: 'Painel', href: '/', icon: LayoutDashboard },
  { id: 'default', label: 'Default', href: '?view=default', icon: LayoutPanelTop },
  { id: 'explorer', label: 'Análise', href: '?view=explorer', icon: BarChart3 },
  { id: 'results', label: 'Resultados', href: '?view=results', icon: Medal },
  { id: 'profiles', label: 'Atletas', href: '?view=profiles', icon: UsersRound },
  { id: 'physical', label: 'Físico', href: '?view=physical', icon: Activity },
  { id: 'motor', label: 'Técnico', href: '?view=motor', icon: ShieldPlus },
]

export const operations: NavigationItem[] = [
  { id: 'competition-import', label: 'Criar competição', href: '?view=competition-import', icon: Plus },
  { id: 'results-import', label: 'Importar resultados', href: '?view=results-import', icon: FileUp },
]

export const allNavItems: NavigationItem[] = [
  ...navigation,
  { id: 'collection', label: 'Coleta', href: '?view=collection', icon: ClipboardList },
  ...operations,
]
