"use client";

import * as React from "react";
import {THEME_STORAGE_KEY, type Theme} from "@/lib/theme/theme-script";

type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme | undefined;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredTheme(): Theme {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" || value === "system"
      ? value
      : "system";
  } catch {
    return "system";
  }
}

/** Writes the class + `color-scheme` the CSS token blocks key off. */
function applyTheme(theme: Theme): ResolvedTheme {
  const resolved = theme === "system" ? systemTheme() : theme;
  const root = document.documentElement;

  root.classList.toggle("dark", resolved === "dark");
  root.classList.toggle("light", resolved === "light");
  root.style.colorScheme = resolved;

  return resolved;
}

/**
 * Theme boundary. The first paint is handled by the server-emitted inline
 * script (`themeInitScript`); this provider only keeps React state in sync with
 * the stored preference and with the OS setting when "system" is selected.
 */
export function ThemeProvider({children}: {children: React.ReactNode}) {
  const [theme, setThemeState] = React.useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = React.useState<
    ResolvedTheme | undefined
  >(undefined);
  const themeRef = React.useRef<Theme>("system");

  React.useEffect(() => {
    const initial = readStoredTheme();
    themeRef.current = initial;
    // Synchronising with browser-only state (localStorage + matchMedia) is
    // exactly what this effect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initial);
    setResolvedTheme(applyTheme(initial));

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (themeRef.current === "system") {
        setResolvedTheme(applyTheme("system"));
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;

      const next = readStoredTheme();
      themeRef.current = next;
      setThemeState(next);
      setResolvedTheme(applyTheme(next));
    };

    media.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorage);

    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setTheme = React.useCallback((next: Theme) => {
    themeRef.current = next;
    setThemeState(next);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode / storage disabled: the class still applies for this tab.
    }

    setResolvedTheme(applyTheme(next));
  }, []);

  const value = React.useMemo(
    () => ({theme, resolvedTheme, setTheme}),
    [theme, resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }

  return context;
}
