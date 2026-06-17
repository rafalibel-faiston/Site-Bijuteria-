import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-terracotta-500 text-cream-50",
        secondary: "border-transparent bg-sage-100 text-forest-900",
        destructive: "border-transparent bg-red-500 text-white",
        outline: "border-terracotta-500 text-terracotta-500",
        success: "border-transparent bg-sage-500/20 text-sage-700",
        warning: "border-transparent bg-mustard-500/20 text-mustard-600",
        danger: "border-transparent bg-red-500/20 text-red-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
