"use client";

import {useTranslations} from "next-intl";
import {Link, usePathname} from "@/i18n/navigation";
import {cn} from "@/lib/utils";

const navItems = [
  {href: "/cars", key: "cars"},
  {href: "/services", key: "services"},
  {href: "/how-it-works", key: "howItWorks"},
  {href: "/faq", key: "faq"},
  {href: "/contact", key: "contact"}
] as const;

const linkClasses =
  "relative inline-flex min-h-11 items-center text-[0.875rem] font-medium text-muted transition-colors duration-[var(--token-duration-fast)] ease-brand after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-brand after:transition-[width] after:duration-[var(--token-duration-normal)] after:ease-brand hover:text-ink hover:after:w-full";

export function NavLinks() {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="hidden items-center gap-7 lg:flex">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            aria-current={isActive ? "page" : undefined}
            className={cn(linkClasses, isActive && "text-ink after:w-full")}
          >
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
