import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-terracotta-500 text-cream-50 hover:bg-terracotta-600 font-semibold",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-terracotta-500 bg-transparent text-terracotta-500 hover:bg-terracotta-500 hover:text-cream-50",
        secondary: "bg-sage-100 text-forest-900 hover:bg-sage-200",
        ghost: "hover:bg-terracotta-500/10 hover:text-terracotta-500",
        link: "text-terracotta-500 underline-offset-4 hover:underline",
        luxury: "bg-gradient-to-r from-terracotta-500 to-sage-600 text-cream-50 hover:from-terracotta-600 hover:to-sage-700 font-semibold warm-shadow",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
