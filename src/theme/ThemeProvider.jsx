import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeCtx = createContext(undefined);
const STORAGE_KEY = "app-theme-v1";

function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || getSystemTheme();
    } catch {
      return getSystemTheme();
    }
  });

  const apply = useCallback((t) => {
    const root = document.documentElement; // <html>
    root.setAttribute("data-theme", t); // opcional, já ajuda se usar CSS vars próprias
    if (t === "dark") root.classList.add("dark");
    // *** ESSENCIAL p/ Tailwind v4 + seus tokens em App.css
    else root.classList.remove("dark");
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch (err) {
      console.warn("Erro ao salvar tema no localStorage:", err);
    }
  }, []);

  useEffect(() => {
    apply(theme);
  }, [theme, apply]);

  // Segue mudanças do SO se o usuário não fixou preferência
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () =>
      !localStorage.getItem(STORAGE_KEY) && setThemeState(getSystemTheme());
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const setTheme = useCallback((t) => setThemeState(t), []);
  const toggle = useCallback(
    () => setThemeState((p) => (p === "dark" ? "light" : "dark")),
    []
  );

  const value = useMemo(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle]
  );
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
