"use client";

import type {ReactNode} from "react";
import {ThemeProvider as NextThemesProvider} from "next-themes";

type ThemeProviderProps = {
  children: ReactNode;
};

/**
 * Single theme boundary for the site. next-themes writes the active theme to
 * `<html class="light|dark">` before first paint (its inline script), so the
 * `html.dark` token block in globals.css applies without a flash of the light
 * theme.
 */
export function ThemeProvider({children}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="kalimeris-theme"
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
