import {Phone} from "lucide-react";
import {cn} from "@/lib/utils";

type BookCallButtonProps = {
  href: string;
  label: string;
  className?: string;
};

/**
 * EasyUI BookCallButton-inspired CTA pill: expands background warmth on hover
 * and animates concentric call rings around the phone icon while keeping a
 * minimum 44px touch target and token-driven dark/light contrast.
 */
export function BookCallButton({href, label, className}: BookCallButtonProps) {
  return (
    <a
      href={href}
      className={cn(
        "book-call-btn group inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line bg-surface pl-1.5 pr-4 text-[0.875rem] font-semibold text-ink transition-[border-color,background-color,color,transform,box-shadow] duration-[var(--token-duration-normal)] ease-brand hover:border-brand/50 hover:bg-brand-subtle active:scale-[0.985]",
        className
      )}
    >
      <span className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-strong text-brand-ink transition-transform duration-[var(--token-duration-normal)] ease-brand group-hover:scale-105">
        <span
          aria-hidden="true"
          className="call-wave pointer-events-none absolute inset-0 rounded-full border border-brand/60 opacity-0"
        />
        <span
          aria-hidden="true"
          className="call-wave call-wave-delay pointer-events-none absolute inset-0 rounded-full border border-brand/40 opacity-0"
        />
        <Phone aria-hidden="true" className="size-3.5" />
      </span>
      <span>{label}</span>
    </a>
  );
}
