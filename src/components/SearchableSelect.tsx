import { useState } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type SearchableSelectOption = { value: string; label: string }

/**
 * Escolha única com busca: botão que abre uma lista filtrável (via `cmdk`) com o item
 * selecionado marcado por um check à direita. Use no lugar de `Select` quando a lista pode
 * ter muitas opções (ex.: 20+ competições) e digitar é mais rápido que rolar.
 */
export function SearchableSelect({ value, onChange, options, placeholder, disabled, className, triggerId, ariaLabel }: {
  value: string
  onChange: (value: string) => void
  options: SearchableSelectOption[]
  placeholder: string
  disabled?: boolean
  className?: string
  triggerId?: string
  ariaLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={triggerId}
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel ?? placeholder}
          disabled={disabled}
          className={cn('justify-between font-normal', className)}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  data-checked={option.value === value || undefined}
                  onSelect={() => { onChange(option.value); setOpen(false) }}
                >
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
