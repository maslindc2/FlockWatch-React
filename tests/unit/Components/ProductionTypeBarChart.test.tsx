import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "../../../src/theme/ThemeProvider";
import ProductionTypeBarChart from "../../../src/Components/ProductionTypeBarChart/ProductionTypeBarChart";

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

beforeEach(() => {
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        x: 0,
        y: 0,
        toJSON: () => ({}),
    });
});

function renderWithTheme(ui: React.ReactElement) {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
}

const mockData = [
    {
        production_type: "Commercial Table Egg Layer",
        total_sites: 129,
        total_birds_affected: 142863900,
        by_status: { active: 0, released: 129, na: 0 },
    },
    {
        production_type: "Commercial Turkey Meat Bird",
        total_sites: 476,
        total_birds_affected: 20758200,
        by_status: { active: 0, released: 474, na: 2 },
    },
    {
        production_type: "Backyard",
        total_sites: 200,
        total_birds_affected: 5000000,
        by_status: { active: 1, released: 199, na: 0 },
    },
];

describe("ProductionTypeBarChart", () => {
    it("renders compact mode with production type labels", () => {
        renderWithTheme(<ProductionTypeBarChart data={mockData} compact />);
        expect(
            screen.getByText("Birds by Production Type")
        ).toBeInTheDocument();
        expect(
            screen.getByText("Commercial Table Egg Layer")
        ).toBeInTheDocument();
        expect(
            screen.getByText("Commercial Turkey Meat Bird")
        ).toBeInTheDocument();
        expect(screen.getByText("Backyard")).toBeInTheDocument();
    });

    it("renders compact mode with bird counts in millions", () => {
        renderWithTheme(<ProductionTypeBarChart data={mockData} compact />);
        expect(screen.getByText("142.9M")).toBeInTheDocument();
        expect(screen.getByText("20.8M")).toBeInTheDocument();
        expect(screen.getByText("5.0M")).toBeInTheDocument();
    });

    it("renders non-compact mode with SVG", () => {
        renderWithTheme(
            <ProductionTypeBarChart data={mockData} compact={false} />
        );
        const svg = screen.getByRole("img");
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Commercial Table Egg Layer")
        );
    });

    it("handles empty data in compact mode", () => {
        renderWithTheme(<ProductionTypeBarChart data={[]} compact />);
        expect(
            screen.getByText("Birds by Production Type")
        ).toBeInTheDocument();
    });

    it("handles empty data in non-compact mode", () => {
        renderWithTheme(<ProductionTypeBarChart data={[]} compact={false} />);
        const svg = screen.getByRole("img");
        expect(svg).toBeInTheDocument();
    });
});
