"use client";

import * as React from "react";
import {Check, Monitor, Moon, Sun} from "lucide-react";
import {useTranslations} from "next-intl";
import {useTheme} from "@/components/providers/theme-provider";
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
 * The icon is chosen by CSS from the `dark` class on <html> (applied before the
 * first paint by the inline bootstrap), so it is correct on first render
 * without waiting for hydration.
 *
 * The popover implements the ARIA menu-button keyboard model: roving tabindex,
 * ArrowUp/ArrowDown/Home/End, focus starts on the current choice, and Tab
 * closes the menu so focus continues in the page.
 */
export function ThemeToggle({label, className}: ThemeToggleProps) {
  const t = useTranslations("A11y");
  const {theme, setTheme} = useTheme();
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  function moveFocus(offset: number | "first" | "last") {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitemradio"]'
      ) ?? []
    );
    if (items.length === 0) return;

    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const index =
      offset === "first"
        ? 0
        : offset === "last"
          ? items.length - 1
          : (current + offset + items.length) % items.length;

    items[index]?.focus();
  }

  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveFocus(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocus(-1);
        break;
      case "Home":
        event.preventDefault();
        moveFocus("first");
        break;
      case "End":
        event.preventDefault();
        moveFocus("last");
        break;
      case "Tab":
        // Let focus leave the menu naturally after it closes.
        setOpen(false);
        break;
      default:
        break;
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors duration-[var(--token-duration-fast)] ease-brand hover:bg-brand-subtle",
            className
          )}
        >
          <Sun aria-hidden="true" className="size-5 dark:hidden" />
          <Moon aria-hidden="true" className="hidden size-5 dark:block" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-52 p-1.5"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          const checked = menuRef.current?.querySelector<HTMLElement>(
            '[aria-checked="true"]'
          );
          const first = menuRef.current?.querySelector<HTMLElement>(
            '[role="menuitemradio"]'
          );
          (checked ?? first)?.focus();
        }}
      >
        <div
          ref={menuRef}
          role="menu"
          aria-label={label}
          className="flex flex-col"
          onKeyDown={handleMenuKeyDown}
        >
          {options.map((option) => {
            const OptionIcon = option.icon;
            const isActive = theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                tabIndex={isActive ? 0 : -1}
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
