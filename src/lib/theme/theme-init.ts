/**
 * Pre-paint theme bootstrap, emitted by the server layout as the first child of
 * `<body>`. A parser-blocking inline script there runs before the rest of the
 * page is painted and is adopted by React during hydration.
 *
 * Keep the storage key in sync with THEME_STORAGE_KEY in theme-provider.tsx.
 */
export const themeInitScript = `(function(){try{var key="kalimeris-theme";var stored=window.localStorage.getItem(key);var media=window.matchMedia("(prefers-color-scheme: dark)");var theme=stored==="light"||stored==="dark"?stored:media.matches?"dark":"light";var root=document.documentElement;root.classList.toggle("dark",theme==="dark");root.classList.toggle("light",theme==="light");root.style.colorScheme=theme;}catch(error){}})();`;
