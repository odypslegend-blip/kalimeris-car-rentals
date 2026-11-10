import * as React from "react";
import {Slot} from "@radix-ui/react-slot";
import {cva, type VariantProps} from "class-variance-authority";
import {cn} from "@/lib/utils";

/**
 * Single button system for the site (shadcn/ui conventions on Radix `Slot`).
 * Every size keeps a >=44px tall hit area so touch targets stay compliant.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-field font-semibold transition-colors duration-[var(--token-duration-fast)] ease-brand disabled:pointer-events-none disabled:opacity-55 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white hover:bg-brand-hover",
        secondary:
          "border border-line bg-surface text-ink hover:border-brand hover:text-brand",
        ghost: "text-ink hover:bg-brand-subtle",
        link: "text-brand underline-offset-4 hover:underline"
      },
      size: {
        sm: "h-11 px-4 text-sm",
        md: "h-11 px-5 text-[0.9375rem]",
        lg: "h-12 px-6 text-base",
        icon: "size-11"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({variant, size}), className)}
      {...props}
    />
  );
}

export {Button, buttonVariants};
export type {ButtonProps};
