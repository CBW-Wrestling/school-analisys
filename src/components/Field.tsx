import { ChevronDown } from 'lucide-react'

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
    <label className="field">
      <span>{label}{required && <b> *</b>}</span>
      <input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="select-wrap">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{placeholder || options[0]}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}{label.includes('Peso') ? ' kg' : ''}
            </option>
          ))}
        </select>
        <ChevronDown size={15} aria-hidden="true" />
      </div>
    </label>
  )
}
