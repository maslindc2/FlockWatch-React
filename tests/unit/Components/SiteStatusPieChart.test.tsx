import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "../../../src/theme/ThemeProvider";
import SiteStatusPieChart from "../../../src/Components/SiteStatusPieChart/SiteStatusPieChart";

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

describe("SiteStatusPieChart", () => {
    it("renders SVG with aria-label containing all status labels", () => {
        renderWithTheme(
            <SiteStatusPieChart
                activeSites={10}
                releasedSites={50}
                naSites={5}
            />
        );
        const svg = screen.getByRole("img");
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Active")
        );
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Released")
        );
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("N/A")
        );
    });

    it("shows no-data label when all values are zero", () => {
        renderWithTheme(
            <SiteStatusPieChart activeSites={0} releasedSites={0} naSites={0} />
        );
        const svg = screen.getByRole("img");
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("No data available")
        );
    });

    it("handles only one non-zero category", () => {
        renderWithTheme(
            <SiteStatusPieChart
                activeSites={0}
                releasedSites={100}
                naSites={0}
            />
        );
        const svg = screen.getByRole("img");
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Released")
        );
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Active")
        );
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("0.0%")
        );
    });
});
