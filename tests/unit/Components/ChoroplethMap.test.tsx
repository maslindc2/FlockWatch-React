import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "../../../src/theme/ThemeProvider";
import ChoroplethMap from "../../../src/Components/ChoroplethMap/ChoroplethMap";

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

vi.mock("d3", async (importOriginal) => {
    const actual = await importOriginal<typeof import("d3")>();
    return {
        ...actual,
        json: vi.fn().mockResolvedValue({
            type: "Topology",
            objects: {
                states: {
                    type: "GeometryCollection",
                    geometries: [
                        {
                            type: "Polygon",
                            id: "06",
                            arcs: [[0]],
                            properties: {},
                        },
                    ],
                },
            },
            arcs: [
                [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 1],
                    [0, 0],
                ],
            ],
        }),
    };
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
];

const mockTrigger = vi.fn();

describe("ChoroplethMap", () => {
    beforeEach(() => {
        mockTrigger.mockClear();
    });

    it("renders container div and SVG", async () => {
        const { container } = renderWithTheme(
            <ChoroplethMap data={mockData} stateTrigger={mockTrigger} />
        );
        const choroplethContainer = container.querySelector(
            ".choropleth-container"
        );
        expect(choroplethContainer).toBeInTheDocument();
        const svg = screen.getByRole("group");
        expect(svg).toBeInTheDocument();
    });

    it("renders tooltip div with tooltip class", async () => {
        const { container } = renderWithTheme(
            <ChoroplethMap data={mockData} stateTrigger={mockTrigger} />
        );
        const tooltip = container.querySelector(".choropleth-tooltip");
        expect(tooltip).toBeInTheDocument();
    });

    it("renders aria-label with top affected state when data exists", async () => {
        renderWithTheme(
            <ChoroplethMap data={mockData} stateTrigger={mockTrigger} />
        );
        const svg = screen.getByRole("group");
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("California")
        );
    });

    it("renders no-data aria-label when data is empty", async () => {
        renderWithTheme(<ChoroplethMap data={[]} stateTrigger={mockTrigger} />);
        const svg = screen.getByRole("group");
        expect(svg).toHaveAttribute(
            "aria-label",
            "Map of the United States showing avian influenza data."
        );
    });
});
