import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  Theme,
  ThemeContext,
  lightChartColors,
  darkChartColors,
  type ChartColors,
} from "./theme";

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem("flockwatch-theme") as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
  } catch { /* ignore */ }
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

/**
 * Provides theme context to the component tree.
 * Persists the user's preference in localStorage and respects
 * the OS-level `prefers-color-scheme` media query as the default.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("flockwatch-theme", theme);
    } catch { /* ignore */ }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const chartColors: ChartColors =
    theme === "light" ? lightChartColors : darkChartColors;

  return (
    <ThemeContext.Provider value={{ theme, chartColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
