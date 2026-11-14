"use client";

import {useEffect, useState} from "react";
import {Check, Monitor, Moon, Sun} from "lucide-react";
import {useTranslations} from "next-intl";
import {useTheme} from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {cn} from "@/lib/utils";

type ThemeToggleProps = {
  label: string;
  className?: string;
};

const options = [
  {value: "light", icon: Sun, labelKey: "themeLight"},
  {value: "dark", icon: Moon, labelKey: "themeDark"},
  {value: "system", icon: Monitor, labelKey: "themeSystem"}
] as const;

/**
 * Sun/moon trigger that opens a three-way Light / Dark / System menu.
 *
 * The icon is rendered only after mount: `resolvedTheme` is unknown during
 * server rendering, so painting it eagerly would hydrate a different icon.
 */
export function ThemeToggle({label, className}: ThemeToggleProps) {
  const t = useTranslations("A11y");
  const {theme, setTheme, resolvedTheme} = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Deliberate post-hydration flag: the resolved theme only exists in the
    // browser, so the icon must wait one tick to avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const ActiveIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-haspopup="menu"
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors duration-[var(--token-duration-fast)] ease-brand hover:bg-brand-subtle",
            className
          )}
        >
          {mounted ? (
            <ActiveIcon aria-hidden="true" className="size-5" />
          ) : (
            <span aria-hidden="true" className="size-5" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-52 p-1.5">
        <div role="menu" aria-label={label} className="flex flex-col">
          {options.map((option) => {
            const OptionIcon = option.icon;
            const isActive = theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 rounded-[6px] px-2.5 text-left text-sm font-medium transition-colors duration-[var(--token-duration-fast)] ease-brand",
                  isActive
                    ? "bg-brand-subtle text-ink"
                    : "text-ink hover:bg-brand-subtle"
                )}
              >
                <OptionIcon aria-hidden="true" className="size-4" />
                <span className="flex-1">{t(option.labelKey)}</span>
                <Check
                  aria-hidden="true"
                  className={cn(
                    "size-4 text-brand",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
