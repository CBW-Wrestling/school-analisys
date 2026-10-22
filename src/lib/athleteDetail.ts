import { Brain, Dumbbell, Info, Medal, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Ícones conhecidos que o backend pode enviar por seção; qualquer valor não
// mapeado cai no ícone neutro (Info) em vez de quebrar a renderização.
export const SECTION_ICONS: Record<string, LucideIcon> = {
  medal: Medal,
  user: User,
  dumbbell: Dumbbell,
  brain: Brain,
}

export function iconFor(icon: string): LucideIcon {
  return SECTION_ICONS[icon] ?? Info
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
}
