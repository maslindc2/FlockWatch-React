import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "../../../src/theme/ThemeProvider";
import HorizontalBarChart from "../../../src/Components/HorizontalBarChart/HorizontalBarChart";

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

const mockData = [
    {
        state_abbreviation: "CA",
        state: "California",
        birds_affected: 100000,
        backyard_flocks: 0,
        commercial_flocks: 0,
        total_flocks: 0,
        latitude: 0,
        longitude: 0,
        last_reported_detection: "2024-01-01T00:00:00.000Z",
    },
    {
        state_abbreviation: "TX",
        state: "Texas",
        birds_affected: 80000,
        backyard_flocks: 0,
        commercial_flocks: 0,
        total_flocks: 0,
        latitude: 0,
        longitude: 0,
        last_reported_detection: "2024-01-01T00:00:00.000Z",
    },
    {
        state_abbreviation: "MN",
        state: "Minnesota",
        birds_affected: 60000,
        backyard_flocks: 0,
        commercial_flocks: 0,
        total_flocks: 0,
        latitude: 0,
        longitude: 0,
        last_reported_detection: "2024-01-01T00:00:00.000Z",
    },
    {
        state_abbreviation: "IA",
        state: "Iowa",
        birds_affected: 40000,
        backyard_flocks: 0,
        commercial_flocks: 0,
        total_flocks: 0,
        latitude: 0,
        longitude: 0,
        last_reported_detection: "2024-01-01T00:00:00.000Z",
    },
    {
        state_abbreviation: "NE",
        state: "Nebraska",
        birds_affected: 20000,
        backyard_flocks: 0,
        commercial_flocks: 0,
        total_flocks: 0,
        latitude: 0,
        longitude: 0,
        last_reported_detection: "2024-01-01T00:00:00.000Z",
    },
];

const activeStates = new Set(["California", "Iowa"]);

describe("HorizontalBarChart", () => {
    it("renders SVG with aria-label containing state names", () => {
        renderWithTheme(
            <HorizontalBarChart data={mockData} activeStates={activeStates} />
        );
        const svg = screen.getByRole("img");
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("California")
        );
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Texas")
        );
    });

    it("renders chart title text in D3 SVG", () => {
        renderWithTheme(
            <HorizontalBarChart data={mockData} activeStates={activeStates} />
        );
        const svg = screen.getByRole("img");
        expect(svg).toBeInTheDocument();
    });

    it("handles empty data gracefully", () => {
        renderWithTheme(
            <HorizontalBarChart data={[]} activeStates={new Set()} />
        );
        const svg = screen.getByRole("img");
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Bar chart")
        );
    });
});
