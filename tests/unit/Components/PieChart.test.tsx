import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "../../../src/theme/ThemeProvider";
import PieChart from "../../../src/Components/PieChart/PieChart";

beforeAll(() => {
    class IntersectionObserverMock {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
        root = null;
        rootMargin = "";
        thresholds = [];
        takeRecords = () => [];
    }
    window.IntersectionObserver =
        IntersectionObserverMock as unknown as typeof IntersectionObserver;
});

function renderWithTheme(ui: React.ReactElement) {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe("PieChart", () => {
    it("renders SVG with aria-label referencing the title", () => {
        renderWithTheme(
            <PieChart
                backyardFlocks={100}
                commercialFlocks={200}
                title="Flocks Affected (Test)"
            />
        );
        const svg = screen.getByRole("img");
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Flocks Affected (Test)")
        );
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Backyard")
        );
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Commercial")
        );
    });

    it("shows no-data label when total is zero", () => {
        renderWithTheme(
            <PieChart
                backyardFlocks={0}
                commercialFlocks={0}
                title="Flocks Affected"
            />
        );
        const svg = screen.getByRole("img");
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("No data available")
        );
    });

    it("renders multiple instances with different data", () => {
        renderWithTheme(
            <div>
                <PieChart
                    backyardFlocks={50}
                    commercialFlocks={50}
                    title="Chart 1"
                />
                <PieChart
                    backyardFlocks={0}
                    commercialFlocks={100}
                    title="Chart 2"
                />
            </div>
        );
        const svgs = screen.getAllByRole("img");
        expect(svgs).toHaveLength(2);
        expect(svgs[0]).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Chart 1")
        );
        expect(svgs[1]).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Chart 2")
        );
    });
});
