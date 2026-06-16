import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "../../../src/theme/ThemeProvider";
import { useTheme } from "../../../src/theme/theme";

function TestConsumer() {
    const { theme, chartColors, toggleTheme } = useTheme();
    return (
        <div>
            <span data-testid="theme">{theme}</span>
            <span data-testid="pie-stroke">{chartColors.pieStroke}</span>
            <button onClick={toggleTheme}>Toggle</button>
        </div>
    );
}

describe("useTheme", () => {
    it("returns context values when used within ThemeProvider", () => {
        render(
            <ThemeProvider>
                <TestConsumer />
            </ThemeProvider>
        );
        expect(screen.getByTestId("theme")).toHaveTextContent("light");
        expect(screen.getByTestId("pie-stroke")).toHaveTextContent("#fff");
    });

    it("throws when used outside ThemeProvider", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        expect(() => render(<TestConsumer />)).toThrow(
            "useTheme must be used within ThemeProvider"
        );
        consoleSpy.mockRestore();
    });
});
