import { Activity, Dumbbell, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FormKind } from './types'

export const states = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'SC', 'SE', 'SP', 'TO']

export const weights = ['39', '43', '44', '46', '48', '49', '50', '52', '55', '57', '58', '61', '62', '65', '66', '68', '71', '73', '75', '85', '92', '110']

export const movements: Record<string, string[]> = {
  Acrobacias: ['Rolo p/ frente', 'Rolo p/ trás', 'Rolo de ombro', 'Estrelinha'],
  Solo: ['Arranco', 'Cruzeta', 'Nelson', 'Rolê'],
  Pé: ['Arm Drag', 'Double Leg', 'Submersão', 'Volteio de braço'],
}

export const details: Record<FormKind, { label: string; title: string; icon: LucideIcon; color: string }> = {
  profile: { label: 'Perfil do atleta', title: 'Cadastro socioesportivo', icon: UserRound, color: 'green' },
  physical: { label: 'Parte física', title: 'Avaliação antropométrica', icon: Dumbbell, color: 'yellow' },
  motor: { label: 'Parte motora', title: 'Avaliação técnica', icon: Activity, color: 'blue' },
}
