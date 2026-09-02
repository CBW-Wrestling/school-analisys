import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type Props = {
  label: string
  content: ReactNode
}

// Ícone de ajuda reutilizável: linguagem simples, texto curto (regra de UX do time).
export function InfoTooltip({ label, content }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="inline-flex items-center text-muted-foreground hover:text-foreground" aria-label={label}>
            <Info className="size-4" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
