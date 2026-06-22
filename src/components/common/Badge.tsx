import { cn } from '@/utils/helpers'

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple'

const variants: Record<Variant, string> = {
  default: 'bg-surface-100 text-surface-600',
  primary: 'bg-brand-100 text-brand-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger:  'bg-red-100 text-red-700',
  purple:  'bg-purple-100 text-purple-700',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className,
    )}>
      {children}
    </span>
  )
}
