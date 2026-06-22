import { cn } from '@/utils/helpers'

interface SkeletonProps { className?: string }

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      'bg-surface-200 rounded-lg animate-pulse',
      className,
    )} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="flex items-end gap-4 px-6 -mt-12">
        <Skeleton className="w-24 h-24 rounded-full border-4 border-white" />
      </div>
      <div className="px-6 space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}
