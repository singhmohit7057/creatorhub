import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image, Video } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface FileUploaderProps {
  onFiles: (files: File[]) => void
  accept?: Record<string, string[]>
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  label?: string
  hint?: string
  className?: string
  variant?: 'image' | 'video' | 'any'
}

export function FileUploader({
  onFiles,
  accept,
  maxSize,
  multiple = false,
  disabled = false,
  label,
  hint,
  className,
  variant = 'any',
}: FileUploaderProps) {
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length) onFiles(accepted)
  }, [onFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled,
  })

  const Icon = variant === 'image' ? Image : variant === 'video' ? Video : Upload

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
        isDragActive
          ? 'border-brand-500 bg-brand-50'
          : 'border-surface-200 hover:border-brand-400 hover:bg-surface-50',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          isDragActive ? 'bg-brand-100 text-brand-600' : 'bg-surface-100 text-surface-400',
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-surface-700">
            {isDragActive ? 'Drop files here' : (label || 'Drag & drop or click to upload')}
          </p>
          {hint && <p className="text-xs text-surface-400 mt-1">{hint}</p>}
        </div>
      </div>
    </div>
  )
}
