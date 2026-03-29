import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'brand' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variantStyles: Record<string, string> = {
      default:
        'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700',
      outline:
        'border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white',
      ghost:
        'text-zinc-400 hover:text-white hover:bg-zinc-800/80',
      brand:
        'bg-green-500 text-black font-semibold hover:bg-green-400 shadow-lg shadow-green-500/20 hover:shadow-green-500/30',
      destructive:
        'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
    }

    const sizeStyles: Record<string, string> = {
      sm: 'px-3 py-1.5 text-xs h-7',
      md: 'px-4 py-2 text-sm h-9',
      lg: 'px-6 py-3 text-base h-11',
      icon: 'w-9 h-9 p-0',
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
