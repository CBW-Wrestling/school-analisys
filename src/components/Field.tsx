import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
      <Label>{label}{required && <span aria-hidden="true"> *</span>}</Label>
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
    <div className={`flex flex-col gap-1.5${disabled ? ' pointer-events-none opacity-50' : ''}`}>
      <Label>{label}</Label>
      <SelectRoot value={value} disabled={disabled} onValueChange={onChange}>
        <SelectTrigger className="w-full"><SelectValue placeholder={placeholder || options[0]} /></SelectTrigger>
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
    <div className={`flex flex-col gap-1.5${disabled ? ' pointer-events-none opacity-50' : ''}`}>
      <Label>{label}</Label>
      <SelectRoot value={value} disabled={disabled} onValueChange={onChange}>
        <SelectTrigger className="w-full"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </div>
  )
}
