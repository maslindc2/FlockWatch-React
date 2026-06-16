import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "../../../src/theme/ThemeProvider";
import StateProductionPieChart from "../../../src/Components/StateProductionPieChart/StateProductionPieChart";

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
    window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;
});

function renderWithTheme(ui: React.ReactElement) {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
}

const mockData = [
    { label: "Commercial Table Egg Layer", count: 5 },
    { label: "Backyard", count: 3 },
];

describe("StateProductionPieChart", () => {
    it("renders SVG with aria-label when data is provided", () => {
        renderWithTheme(
            <StateProductionPieChart data={mockData} stateName="Indiana" />
        );
        const svg = screen.getByRole("img");
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Indiana")
        );
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("5 sites")
        );
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("3 sites")
        );
    });

    it("renders SVG with no-data message when data is empty", () => {
        renderWithTheme(
            <StateProductionPieChart data={[]} stateName="Indiana" />
        );
        const svg = screen.getByRole("img");
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("No data available")
        );
    });
});
