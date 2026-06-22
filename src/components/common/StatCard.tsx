import { cn } from '@/utils/helpers'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: { value: number; label: string; unit?: string }
  className?: string
}

export function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-surface-200 shadow-card p-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500">{title}</p>
          <p className="text-2xl font-bold text-surface-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-surface-400 mt-1">{subtitle}</p>}
          {trend && (
            <p className={cn(
              'text-xs font-medium mt-2',
              trend.value >= 0 ? 'text-green-600' : 'text-red-500',
            )}>
              {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}{trend.unit ?? '%'} {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
