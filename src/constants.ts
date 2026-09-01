import { Activity, Dumbbell, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FormKind } from './types'

export const details: Record<FormKind, { label: string; title: string; icon: LucideIcon; color: string }> = {
  profile: { label: 'Perfil do atleta', title: 'Cadastro socioesportivo', icon: UserRound, color: 'green' },
  physical: { label: 'Parte física', title: 'Avaliação antropométrica', icon: Dumbbell, color: 'yellow' },
  motor: { label: 'Parte motora', title: 'Avaliação técnica', icon: Activity, color: 'blue' },
}
