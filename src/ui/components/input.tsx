import * as React from "react"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "az:h-9 az:w-full az:min-w-0 az:rounded-md az:border az:border-input az:bg-transparent az:px-3 az:py-1 az:text-base az:shadow-xs az:transition-[color,box-shadow] az:outline-none az:selection:bg-primary az:selection:text-primary-foreground az:file:inline-flex az:file:h-7 az:file:border-0 az:file:bg-transparent az:file:text-sm az:file:font-medium az:file:text-foreground az:placeholder:text-muted-foreground az:disabled:pointer-events-none az:disabled:cursor-not-allowed az:disabled:opacity-50 az:md:text-sm az:dark:bg-input/30",
        "az:focus-visible:border-ring az:focus-visible:ring-[3px] az:focus-visible:ring-ring/50",
        "az:aria-invalid:border-destructive az:aria-invalid:ring-destructive/20 az:dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
