import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4 text-surface-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-surface-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-surface-500 max-w-xs mb-6">{description}</p>}
      {action && (
        <Button size="md" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
