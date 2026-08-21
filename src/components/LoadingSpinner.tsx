import './LoadingSpinner.css'

interface Props {
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ label, size = 'md' }: Props) {
  return (
    <div className={`spinner-wrapper spinner--${size}`} role="status" aria-label={label ?? 'Carregando'}>
      <div className="spinner" />
      {label && <p className="spinner-label">{label}</p>}
    </div>
  )
}
