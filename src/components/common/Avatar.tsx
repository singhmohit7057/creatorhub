import { cn, getInitials } from '@/utils/helpers'

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

const sizes: Record<Size, string> = {
  xs:   'w-6 h-6 text-xs',
  sm:   'w-8 h-8 text-xs',
  md:   'w-10 h-10 text-sm',
  lg:   'w-12 h-12 text-base',
  xl:   'w-16 h-16 text-lg',
  '2xl': 'w-24 h-24 text-2xl',
  '3xl': 'w-36 h-36 text-3xl',
}

interface AvatarProps {
  src?: string | null
  name?: string
  size?: Size
  className?: string
}

export function Avatar({ src, name = '', size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full overflow-hidden flex items-center justify-center shrink-0',
        'bg-gradient-to-br from-brand-500 to-accent-500 text-white font-semibold',
        sizes[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name) || '?'}</span>
      )}
    </div>
  )
}
