"use client"

import * as React from "react"
import { cn } from "cn"
import { ChevronDownIcon } from "lucide-react"
import { Accordion as AccordionPrimitive } from "radix-ui"

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("az:border-b az:last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="az:flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "az:flex az:flex-1 az:items-start az:justify-between az:gap-4 az:rounded-md az:py-4 az:text-left az:text-sm az:font-medium az:transition-all az:outline-none az:hover:underline az:focus-visible:border-ring az:focus-visible:ring-[3px] az:focus-visible:ring-ring/50 az:disabled:pointer-events-none az:disabled:opacity-50 az:[&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="az:pointer-events-none az:size-4 az:shrink-0 az:translate-y-0.5 az:text-muted-foreground az:transition-transform az:duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="az:overflow-hidden az:text-sm az:data-[state=closed]:animate-accordion-up az:data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("az:pt-0 az:pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
