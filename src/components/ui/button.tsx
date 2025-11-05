import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "premium-button inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-sky-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 dark:hover:from-blue-400 dark:hover:to-blue-500 shadow-lg dark:shadow-[0_0_20px_rgba(59,130,246,0.5)]",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white hover:from-red-600 hover:to-red-700 dark:hover:from-red-500 dark:hover:to-red-600",
        outline:
          "bg-white/90 dark:bg-black/90 backdrop-blur-md hover:bg-gray-50 dark:hover:bg-black/80 text-black dark:text-blue-400 border-sky-300 dark:border-blue-500/30",
        secondary:
          "bg-gradient-to-r from-sky-600 to-blue-700 dark:from-blue-600 dark:to-blue-700 text-white hover:from-sky-700 hover:to-blue-800 dark:hover:from-blue-500 dark:hover:to-blue-600",
        ghost:
          "hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-100 dark:hover:from-blue-950/50 dark:hover:to-blue-900/50 hover:text-sky-700 dark:hover:text-blue-300 text-black dark:text-black",
        link: "text-sky-600 dark:text-blue-400 underline-offset-4 hover:underline hover:text-sky-700 dark:hover:text-blue-300",
      },
      size: {
        default: "h-11 px-6 py-3 has-[>svg]:px-4",
        sm: "h-9 gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 px-8 has-[>svg]:px-6 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
