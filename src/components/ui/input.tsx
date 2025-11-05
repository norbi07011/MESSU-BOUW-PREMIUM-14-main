import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "premium-input file:text-foreground placeholder:text-black dark:placeholder:text-gray-400 selection:bg-blue-600 selection:text-white bg-white/90 dark:bg-black/90 text-black dark:text-white backdrop-blur-md flex h-12 w-full min-w-0 px-4 py-3 text-base transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
