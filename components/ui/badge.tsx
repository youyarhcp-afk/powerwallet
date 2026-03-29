import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles: Record<string, string> = {
    default: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
    success: 'bg-green-500/10 text-green-400 border border-green-500/25',
    warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25',
    error: 'bg-red-500/10 text-red-400 border border-red-500/25',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
    brand: 'bg-green-500 text-black font-semibold',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
