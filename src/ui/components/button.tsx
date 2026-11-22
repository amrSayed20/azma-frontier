import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "az:inline-flex az:shrink-0 az:items-center az:justify-center az:gap-2 az:rounded-md az:text-sm az:font-medium az:whitespace-nowrap az:transition-all az:outline-none az:focus-visible:border-ring az:focus-visible:ring-[3px] az:focus-visible:ring-ring/50 az:disabled:pointer-events-none az:disabled:opacity-50 az:aria-invalid:border-destructive az:aria-invalid:ring-destructive/20 az:dark:aria-invalid:ring-destructive/40 az:[&_svg]:pointer-events-none az:[&_svg]:shrink-0 az:[&_svg:not([class*=size-])]:size-4",
  {
    variants: {
      variant: {
        default: "az:bg-primary az:text-primary-foreground az:hover:bg-primary/90",
        destructive:
          "az:bg-destructive az:text-white az:hover:bg-destructive/90 az:focus-visible:ring-destructive/20 az:dark:bg-destructive/60 az:dark:focus-visible:ring-destructive/40",
        outline:
          "az:border az:bg-background az:shadow-xs az:hover:bg-accent az:hover:text-accent-foreground az:dark:border-input az:dark:bg-input/30 az:dark:hover:bg-input/50",
        secondary:
          "az:bg-secondary az:text-secondary-foreground az:hover:bg-secondary/80",
        ghost:
          "az:hover:bg-accent az:hover:text-accent-foreground az:dark:hover:bg-accent/50",
        link: "az:text-primary az:underline-offset-4 az:hover:underline",
      },
      size: {
        default: "az:h-9 az:px-4 az:py-2 az:has-[>svg]:px-3",
        xs: "az:h-6 az:gap-1 az:rounded-md az:px-2 az:text-xs az:has-[>svg]:px-1.5 az:[&_svg:not([class*=size-])]:size-3",
        sm: "az:h-8 az:gap-1.5 az:rounded-md az:px-3 az:has-[>svg]:px-2.5",
        lg: "az:h-10 az:rounded-md az:px-6 az:has-[>svg]:px-4",
        icon: "az:size-9",
        "icon-xs": "az:size-6 az:rounded-md az:[&_svg:not([class*=size-])]:size-3",
        "icon-sm": "az:size-8",
        "icon-lg": "az:size-10",
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
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
