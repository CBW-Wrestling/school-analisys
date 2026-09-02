import { Ellipsis, FileDown, FileUp, RefreshCw, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AnalyticsToolbar() {
  return (
    <div className="flex items-center gap-2">
      <Select defaultValue="last-4-weeks">
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Selecionar período" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="last-7-days">Últimos 7 dias</SelectItem>
            <SelectItem value="last-4-weeks">Últimas 4 semanas</SelectItem>
            <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
            <SelectItem value="year-to-date">Ano até o momento</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline" aria-label="Mais ações de análise">
            <Ellipsis aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Ações de análise</DropdownMenuLabel>
            <DropdownMenuItem>
              <FileDown aria-hidden="true" />
              Exportar relatório
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileUp aria-hidden="true" />
              Importar dados
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 aria-hidden="true" />
              Compartilhar painel
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <RefreshCw aria-hidden="true" />
              Atualizar métricas
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
