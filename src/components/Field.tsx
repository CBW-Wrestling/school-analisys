import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[14px]">{label}{required && <span aria-hidden="true"> *</span>}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </div>
  )
}

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', disabled && 'pointer-events-none opacity-50')}>
      <Label className="text-[14px]">{label}</Label>
      <SelectRoot value={value} disabled={disabled} onValueChange={onChange}>
        <SelectTrigger size="sm" className="w-full"><SelectValue placeholder={placeholder || options[0]} /></SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}{label.includes('Peso') ? ' kg' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </div>
  )
}

export function SelectPairs({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
}: {
  label: string
  value: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', disabled && 'pointer-events-none opacity-50')}>
      <Label className="text-[14px]">{label}</Label>
      <SelectRoot value={value} disabled={disabled} onValueChange={onChange}>
        <SelectTrigger size="sm" className="w-full"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </div>
  )
}

export function ChoiceCards({
  label,
  value,
  options,
  optionLabels,
  onChange,
  disabled = false,
}: {
  label: string
  value: string
  options: string[]
  optionLabels?: Record<string, string>
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <fieldset className={cn('flex flex-col gap-2', disabled && 'pointer-events-none opacity-50')}>
      <legend className="text-[14px] font-semibold leading-5 tracking-tight text-foreground">{label}</legend>
      <RadioGroup value={value} onValueChange={onChange} className="grid min-w-0 grid-cols-1 gap-2" disabled={disabled}>
        {options.map((option) => (
          <label
            key={option}
            data-checked={value === option || undefined}
            className="relative flex min-h-12 cursor-pointer items-center gap-2.5 rounded-lg border border-input px-3 py-3 text-left text-[14px] font-medium leading-5 transition-colors hover:bg-muted/50 data-[checked=true]:border-primary/40 data-[checked=true]:bg-muted has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/20"
          >
            <RadioGroupItem value={option} aria-label={option} />
            <span className="min-w-0 flex-1 leading-snug">{optionLabels?.[option] ?? option}</span>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  )
}
