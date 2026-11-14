"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {Plus} from "lucide-react";
import {cn} from "@/lib/utils";

/**
 * Radix accordion in shadcn/ui conventions. Radix supplies button semantics,
 * `aria-expanded`/`aria-controls`, ArrowUp/ArrowDown/Home/End and Enter/Space,
 * so no custom key handling is needed here.
 */
function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-line", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex min-h-[60px] flex-1 items-start justify-between gap-5 rounded-field py-5 text-left text-[1.0625rem] font-semibold leading-snug text-ink transition-colors duration-[var(--token-duration-fast)] ease-brand hover:text-brand [&[data-state=open]>svg]:rotate-45",
          className
        )}
        {...props}
      >
        <span className="min-w-0 flex-1">{children}</span>
        <Plus
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-brand transition-transform duration-[var(--token-duration-normal)] ease-brand"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="accordion-content"
      {...props}
    >
      <div
        className={cn(
          "max-w-[64ch] pb-6 pr-9 text-[0.9375rem] leading-relaxed text-muted md:text-base",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export {Accordion, AccordionItem, AccordionTrigger, AccordionContent};
