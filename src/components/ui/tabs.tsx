"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {cn} from "@/lib/utils";

/**
 * shadcn/ui-style Radix Tabs. Radix owns roving focus, arrow-key navigation,
 * ARIA wiring and manual/automatic activation; these wrappers only style it.
 */
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "flex w-full items-stretch gap-6 overflow-x-auto border-b border-line",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center border-b-2 border-transparent px-0.5 pb-2.5 pt-2 text-[0.875rem] font-semibold text-muted transition-colors duration-[var(--token-duration-fast)] ease-brand",
        "hover:text-ink focus-visible:text-ink disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:border-brand data-[state=active]:text-ink",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

export {Tabs, TabsContent, TabsList, TabsTrigger};
