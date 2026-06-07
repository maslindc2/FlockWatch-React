import { createContext, useContext } from "react";

export type Theme = "light" | "dark";

export interface ChartColors {
  choroplethColorRange: string[];
  choroplethLegendRange: string[];
  choroplethNoData: string;
  choroplethStroke: string;
  choroplethLabelColor: string;
  choroplethLegendStroke: string;
  choroplethPointerLine: string;
  choroplethHover: string;
  pieBackyard: string;
  pieCommercial: string;
  pieStroke: string;
  pieTextColor: string;
  pieSubtextColor: string;
  pieToggleSelectedBg: string;
  pieToggleUnselectedBg: string;
  pieToggleSelectedText: string;
  pieToggleUnselectedText: string;
  pieToggleStroke: string;
  siteStatusActive: string;
  siteStatusReleased: string;
  siteStatusNa: string;
  barActiveColor: string;
  barInactiveColor: string;
  barBg: string;
  barTextColor: string;
  barLegendColor: string;
  barTitleColor: string;
  prodBarColorRange: string[];
  prodBarBg: string;
  prodBarTextColor: string;
  prodBarTitleColor: string;
  timelineConfirmationsColor: string;
  timelineBirdsColor: string;
  timelineGridColor: string;
  timelineTooltipBg: string;
  timelineTooltipBorder: string;
  timelineTooltipShadow: string;
  timelineCrosshairColor: string;
  timelineAxisLabelColor: string;
  timelineTitleColor: string;
  timelineLegendColor: string;
  timelineTooltipTextColor: string;
  selectedStateColorRange: string[];
}

export const lightChartColors: ChartColors = {
  choroplethColorRange: ["#defad7ff", "#94d190ff", "#006400"],
  choroplethLegendRange: ["#ffffffff", "#94d190ff", "#006400"],
  choroplethNoData: "#eee",
  choroplethStroke: "hsla(0, 0%, 21%, 1.00)",
  choroplethLabelColor: "#000",
  choroplethLegendStroke: "#333",
  choroplethPointerLine: "#333",
  choroplethHover: "hsla(0, 0%, 17%, 0.55)",
  pieBackyard: "#1a5276",
  pieCommercial: "#85c1e9",
  pieStroke: "#fff",
  pieTextColor: "#333",
  pieSubtextColor: "#666",
  pieToggleSelectedBg: "#333",
  pieToggleUnselectedBg: "#e8e8e8",
  pieToggleSelectedText: "#fff",
  pieToggleUnselectedText: "#333",
  pieToggleStroke: "#ccc",
  siteStatusActive: "#dc322f",
  siteStatusReleased: "#27ae60",
  siteStatusNa: "#95a5a6",
  barActiveColor: "#dc322f",
  barInactiveColor: "#0077ff",
  barBg: "#e8e8e8",
  barTextColor: "#333",
  barLegendColor: "#666",
  barTitleColor: "#333",
  prodBarColorRange: ["#cce5ff", "#004b99"],
  prodBarBg: "#e8e8e8",
  prodBarTextColor: "#333",
  prodBarTitleColor: "#333",
  timelineConfirmationsColor: "#dc322f",
  timelineBirdsColor: "#0077ff",
  timelineGridColor: "#e8e8e8",
  timelineTooltipBg: "rgba(255,255,255,0.95)",
  timelineTooltipBorder: "#ddd",
  timelineTooltipShadow: "rgba(0,0,0,0.1)",
  timelineCrosshairColor: "#999",
  timelineAxisLabelColor: "#666",
  timelineTitleColor: "#333",
  timelineLegendColor: "#666",
  timelineTooltipTextColor: "#333",
  selectedStateColorRange: ["#d0ffc6ff", "#94d190ff", "#006400"],
};

export const darkChartColors: ChartColors = {
  choroplethColorRange: ["#1b3a1b", "#2d6a2d", "#00cc00"],
  choroplethLegendRange: ["#ffffffff", "#94d190ff", "#00cc00"],
  choroplethNoData: "#2a2a2a",
  choroplethStroke: "hsla(0, 0%, 40%, 1.00)",
  choroplethLabelColor: "#ccc",
  choroplethLegendStroke: "#888",
  choroplethPointerLine: "#888",
  choroplethHover: "hsla(0, 0%, 60%, 0.35)",
  pieBackyard: "#5b9bd5",
  pieCommercial: "#2e75b6",
  pieStroke: "#1e1e2e",
  pieTextColor: "#e0e0e0",
  pieSubtextColor: "#a0a0a0",
  pieToggleSelectedBg: "#e0e0e0",
  pieToggleUnselectedBg: "#333",
  pieToggleSelectedText: "#1e1e2e",
  pieToggleUnselectedText: "#e0e0e0",
  pieToggleStroke: "#555",
  siteStatusActive: "#ff5252",
  siteStatusReleased: "#4caf50",
  siteStatusNa: "#757575",
  barActiveColor: "#ff5252",
  barInactiveColor: "#64b5f6",
  barBg: "#333",
  barTextColor: "#e0e0e0",
  barLegendColor: "#a0a0a0",
  barTitleColor: "#e0e0e0",
  prodBarColorRange: ["#1a3a5c", "#64b5f6"],
  prodBarBg: "#333",
  prodBarTextColor: "#e0e0e0",
  prodBarTitleColor: "#e0e0e0",
  timelineConfirmationsColor: "#ff5252",
  timelineBirdsColor: "#64b5f6",
  timelineGridColor: "#333",
  timelineTooltipBg: "rgba(30,30,46,0.95)",
  timelineTooltipBorder: "#444",
  timelineTooltipShadow: "rgba(0,0,0,0.5)",
  timelineCrosshairColor: "#666",
  timelineAxisLabelColor: "#a0a0a0",
  timelineTitleColor: "#e0e0e0",
  timelineLegendColor: "#a0a0a0",
  timelineTooltipTextColor: "#e0e0e0",
  selectedStateColorRange: ["#1b3a1b", "#2d6a2d", "#00cc00"],
};

export interface ThemeContextType {
  theme: Theme;
  chartColors: ChartColors;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
