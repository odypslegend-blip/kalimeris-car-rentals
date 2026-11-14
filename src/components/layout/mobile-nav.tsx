"use client";

import * as React from "react";
import {ChevronRight, Mail, Menu, Phone} from "lucide-react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {LanguageSwitcher} from "@/components/layout/language-switcher";
import {Link, usePathname} from "@/i18n/navigation";
import {site} from "@/lib/site";
import {cn} from "@/lib/utils";

const mobileNavItems = [
  {href: "/", key: "home"},
  {href: "/cars", key: "cars"},
  {href: "/services", key: "services"},
  {href: "/how-it-works", key: "howItWorks"},
  {href: "/faq", key: "faq"},
  {href: "/contact", key: "contact"}
] as const;

export function MobileNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const close = React.useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={t("A11y.openMenu")}
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton
        closeLabel={t("A11y.closeMenu")}
        className="sheet-panel left-0 top-0 flex h-dvh w-[86%] max-w-sm translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-y-0 border-l-0 border-r border-line p-0"
      >
        <div className="border-b border-hairline p-5 pr-16">
          <DialogTitle className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-brand">
            {t("A11y.menuTitle")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("A11y.menuDescription")}
          </DialogDescription>
          <p className="mt-2 text-[1.0625rem] font-bold tracking-[0.1em] text-ink">
            {t("Common.brandName")}
          </p>
          <p className="mt-1 text-[0.5rem] font-bold tracking-[0.36em] text-muted">
            {t("Common.brandSuffix")}
          </p>
        </div>

        <nav aria-label={t("Nav.label")} className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col">
            {mobileNavItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    onClick={close}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center justify-between gap-3 rounded-field px-3 py-3 text-base font-medium transition-colors duration-[var(--token-duration-fast)] ease-brand",
                      isActive
                        ? "bg-brand-subtle text-brand-hover"
                        : "text-ink hover:bg-background"
                    )}
                  >
                    {t(`Nav.${item.key}`)}
                    <ChevronRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-hairline p-5">
          <div className="flex flex-col">
            <a
              href={site.phone.href}
              className="flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-ink hover:text-brand"
            >
              <Phone aria-hidden="true" className="size-4 text-brand" />
              {site.phone.display}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="flex min-h-11 items-center gap-2 text-[0.875rem] text-muted hover:text-ink"
            >
              <Mail aria-hidden="true" className="size-4 text-brand" />
              {site.email}
            </a>
          </div>

          <LanguageSwitcher
            label={t("A11y.languageSwitcher")}
            onNavigate={close}
            className="mt-3"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
