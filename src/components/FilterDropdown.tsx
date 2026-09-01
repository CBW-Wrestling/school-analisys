import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export type FilterDropdownOption = { value: string; label: string }

/**
 * Filtro multi-seleção compacto: botão com contagem (`selecionados/total`) que abre uma busca
 * com checkbox à direita de cada item (via `cmdk`). Use quando o usuário pode comparar várias
 * categorias ao mesmo tempo (ex.: estilos, dimensões técnicas, eventos — inclusive listas
 * longas, como 20+ competições). Para escolha única, prefira `SearchableSelect`.
 */
export function FilterDropdown({ label, options, value, onChange, disabled }: {
  label: string
  options: FilterDropdownOption[]
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}) {
  const toggle = (optionValue: string) => onChange(value.includes(optionValue) ? value.filter((item) => item !== optionValue) : [...value, optionValue])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className="gap-1.5">
          {label}
          <Badge variant="secondary" className="px-1.5 font-mono tabular-nums">{value.length}/{options.length}</Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option.value} value={option.label} data-checked={value.includes(option.value) || undefined} onSelect={() => toggle(option.value)}>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

