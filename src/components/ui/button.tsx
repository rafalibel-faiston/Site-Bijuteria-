import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gold-500 text-dark-900 hover:bg-gold-600 font-semibold",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-gold-500 bg-transparent text-gold-500 hover:bg-gold-500 hover:text-dark-900",
        secondary: "bg-dark-800 text-white hover:bg-dark-700",
        ghost: "hover:bg-gold-500/10 hover:text-gold-500",
        link: "text-gold-500 underline-offset-4 hover:underline",
        luxury: "bg-gradient-to-r from-gold-600 to-gold-400 text-dark-900 hover:from-gold-700 hover:to-gold-500 font-semibold shadow-lg shadow-gold-500/25",
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
