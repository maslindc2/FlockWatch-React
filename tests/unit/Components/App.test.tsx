// src/App.test.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "../../../src/theme/ThemeProvider";
import App from "../../../src/App";

function renderWithTheme(ui: React.ReactElement) {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
}
import { useUsSummaryData } from "../../../src/Hooks/useUsSummaryData";
import { useFlockCases } from "../../../src/Hooks/useFlockCases";
import { useStatusSummary } from "../../../src/Hooks/useStatusSummary";
import { useSitesData } from "../../../src/Hooks/useSitesData";
import { useActiveSites } from "../../../src/Hooks/useActiveSites";
import { useHistoricalSummary } from "../../../src/Hooks/useHistoricalSummary";
import { useProductionTypeSummary } from "../../../src/Hooks/useProductionTypeSummary";
import { useSitesTimeline } from "../../../src/Hooks/useSitesTimeline";

vi.mock("../../../src/Hooks/useUsSummaryData", () => ({
    useUsSummaryData: vi.fn(),
}));
vi.mock("../../../src/Hooks/useFlockCases", () => ({
    useFlockCases: vi.fn(),
}));
vi.mock("../../../src/Hooks/useStatusSummary", () => ({
    useStatusSummary: vi.fn(),
}));
vi.mock("../../../src/Hooks/useSitesData", () => ({
    useSitesData: vi.fn(),
}));
vi.mock("../../../src/Hooks/useActiveSites", () => ({
    useActiveSites: vi.fn(),
}));
vi.mock("../../../src/Hooks/useHistoricalSummary", () => ({
    useHistoricalSummary: vi.fn(),
}));
vi.mock("../../../src/Hooks/useProductionTypeSummary", () => ({
    useProductionTypeSummary: vi.fn(),
}));
vi.mock("../../../src/Hooks/useSitesTimeline", () => ({
    useSitesTimeline: vi.fn(),
}));

vi.mock("../../../src/Components/StateInfo/StateInfo", () => ({
    default: ({ stateInfo }: { stateInfo: any }) => (
        <div data-testid="state-info">
            Mock StateInfo ({stateInfo?.stateAbbreviation})
        </div>
    ),
}));

vi.mock("../../../src/Components/ChoroplethMap/ChoroplethMap", () => ({
    default: ({
        stateTrigger,
    }: {
        stateTrigger: (abbr: string, color: string) => void;
    }) => (
        <button onClick={() => stateTrigger("CA", "#ff0000")}>
            Select California
        </button>
    ),
}));

vi.mock(
    "../../../src/Components/SitesTimelineChart/SitesTimelineChart",
    () => ({
        default: () => <div data-testid="timeline-chart">Timeline Chart</div>,
    })
);

vi.mock("../../../src/Utils/dateFormatter", () => ({
    default: (date: string) => `Formatted(${date})`,
}));

const mockUsSummary = {
    data: {
        all_time_totals: {
            total_states_affected: 51,
            total_birds_affected: 183664206,
            total_flocks_affected: 1869,
            total_backyard_flocks_affected: 1000,
            total_commercial_flocks_affected: 869,
        },
        period_summaries: {
            last_30_days: {
                total_birds_affected: 1880000,
                total_flocks_affected: 88,
                total_backyard_flocks_affected: 50,
                total_commercial_flocks_affected: 38,
            },
        },
    },
};

const mockFlockCases = {
    data: [
        {
            state_abbreviation: "CA",
            state: "California",
            birds_affected: 100,
            backyard_flocks: 0,
            commercial_flocks: 0,
            total_flocks: 0,
            latitude: 0,
            longitude: 0,
            last_reported_detection: "2024-12-19T00:00:00.000Z",
        },
    ],
    metadata: { last_scraped_date: "2024-12-19T00:00:00.000Z" },
};

const mockActiveSitesData = {
    data: [
        { birds_affected: 6000 },
        { birds_affected: 7500 },
        { birds_affected: 28300 },
        { birds_affected: 28500 },
        { birds_affected: 5300 },
        { birds_affected: 11600 },
        { birds_affected: 4300 },
        { birds_affected: 13600 },
        { birds_affected: 7700 },
        { birds_affected: 4400 },
        { birds_affected: 7300 },
        { birds_affected: 2400 },
        { birds_affected: 19900 },
        { birds_affected: 23000 },
        { birds_affected: 29800 },
        { birds_affected: 19700 },
        { birds_affected: 4600 },
    ],
    total: 17,
    page: 1,
    limit: 100,
    totalPages: 1,
    metadata: { last_scraped_date: "2026-06-03T00:50:47.375Z" },
};

const mockSitesData = {
    data: [],
    total: 2027,
    page: 1,
    limit: 10,
    totalPages: 203,
    metadata: { last_scraped_date: "2026-06-03T00:50:47.375Z" },
};

const mockStatusSummary = {
    data: {
        birds_affected_last_30_days: 276675,
        sites_confirmed_last_30_days: 23,
        sites_released_last_30_days: 11,
    },
    metadata: { last_scraped_date: "2026-06-03T00:50:47.375Z" },
};

const mockHistoricalSummary = {
    data: {
        total_active_sites: 17,
        total_birds_active: 223900,
        total_birds_affected_all_time: 206687076,
        total_na_sites: 639,
        total_released_sites: 1571,
        total_sites_all_time: 2227,
    },
    metadata: { last_scraped_date: "2026-06-03T00:50:47.375Z" },
};

const mockTimelineData = {
    data: {
        granularity: "month",
        periods: [
            {
                period: "2022-02",
                new_confirmations: 10,
                birds_affected: 1154298,
                cumulative_birds_affected: 1154298,
            },
        ],
    },
    metadata: { last_scraped_date: "2026-06-04T23:19:44.252Z" },
};

const mockProductionTypeSummary = {
    data: [
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
    ],
    metadata: { last_scraped_date: "2026-06-03T00:50:47.375Z" },
};

describe("App", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading state", () => {
        (useUsSummaryData as any).mockReturnValue({ isPending: true });
        (useFlockCases as any).mockReturnValue({ isPending: true });
        (useStatusSummary as any).mockReturnValue({ isPending: true });
        (useSitesData as any).mockReturnValue({ isPending: true });
        (useActiveSites as any).mockReturnValue({ isPending: true });
        (useHistoricalSummary as any).mockReturnValue({ isPending: true });
        (useProductionTypeSummary as any).mockReturnValue({ isPending: true });
        (useSitesTimeline as any).mockReturnValue({ isPending: true });

        renderWithTheme(<App />);
        expect(screen.getByText("Flock Watch")).toBeInTheDocument();
        expect(screen.getByText("Skip to main content")).toBeInTheDocument();
    });

    it("renders error state", () => {
        (useUsSummaryData as any).mockReturnValue({
            isPending: false,
            error: "Error",
        });
        (useFlockCases as any).mockReturnValue({
            isPending: false,
            error: "Error",
        });
        (useStatusSummary as any).mockReturnValue({
            isPending: false,
            error: "Error",
        });
        (useSitesData as any).mockReturnValue({
            isPending: false,
            error: "Error",
        });
        (useActiveSites as any).mockReturnValue({
            isPending: false,
            error: "Error",
        });
        (useHistoricalSummary as any).mockReturnValue({
            isPending: false,
            error: "Error",
        });
        (useProductionTypeSummary as any).mockReturnValue({
            isPending: false,
            error: "Error",
        });
        (useSitesTimeline as any).mockReturnValue({
            isPending: false,
            error: "Error",
        });

        renderWithTheme(<App />);
        expect(screen.getByText("So Sorry!")).toBeInTheDocument();
        expect(
            screen.getByText(
                "We ran into some problems getting the page you were looking for"
            )
        ).toBeInTheDocument();
        expect(screen.getByText("Please try again later!")).toBeInTheDocument();
    });

    it("renders main dashboard with both tile groups", () => {
        (useUsSummaryData as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockUsSummary,
        });
        (useFlockCases as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockFlockCases,
        });
        (useStatusSummary as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockStatusSummary,
        });
        (useSitesData as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockSitesData,
        });
        (useActiveSites as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockActiveSitesData,
        });
        (useHistoricalSummary as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockHistoricalSummary,
        });
        (useProductionTypeSummary as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockProductionTypeSummary,
        });
        (useSitesTimeline as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockTimelineData,
        });

        renderWithTheme(<App />);
        expect(screen.getByText("Flock Watch")).toBeInTheDocument();
        expect(screen.getByText(/Last updated on/)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Select California" })
        ).toBeInTheDocument();

        expect(screen.getByText("Overview")).toBeInTheDocument();
        expect(screen.queryByText("All Time Totals")).not.toBeInTheDocument();
        expect(screen.getByText("New Confirmations (30d)")).toBeInTheDocument();
        expect(screen.getByText("Sites Released (30d)")).toBeInTheDocument();
        expect(screen.getByText("depopulation complete")).toBeInTheDocument();
        expect(screen.getByText("2,027 total sites")).toBeInTheDocument();
        expect(screen.getByText("Birds at risk (active)")).toBeInTheDocument();
        expect(screen.getByText("223,900")).toBeInTheDocument();
        expect(screen.getByText("17 active sites")).toBeInTheDocument();
    });

    it("switches to StateInfo view when a state is selected", () => {
        (useUsSummaryData as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockUsSummary,
        });
        (useFlockCases as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockFlockCases,
        });
        (useStatusSummary as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockStatusSummary,
        });
        (useSitesData as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockSitesData,
        });
        (useActiveSites as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockActiveSitesData,
        });
        (useHistoricalSummary as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockHistoricalSummary,
        });
        (useProductionTypeSummary as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockProductionTypeSummary,
        });
        (useSitesTimeline as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockTimelineData,
        });

        renderWithTheme(<App />);

        fireEvent.click(screen.getByText("Select California"));

        const buttons = screen.getAllByRole("button");
        const closeButton = buttons.find((b) =>
            b.classList.contains("state-panel-close")
        );
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toHaveClass("state-panel-close");
    });

    it("renders theme toggle button that changes aria-label on click", () => {
        (useUsSummaryData as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockUsSummary,
        });
        (useFlockCases as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockFlockCases,
        });
        (useStatusSummary as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockStatusSummary,
        });
        (useSitesData as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockSitesData,
        });
        (useActiveSites as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockActiveSitesData,
        });
        (useHistoricalSummary as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockHistoricalSummary,
        });
        (useProductionTypeSummary as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockProductionTypeSummary,
        });
        (useSitesTimeline as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockTimelineData,
        });

        renderWithTheme(<App />);

        const toggle = screen.getByRole("button", {
            name: "Switch to dark mode",
        });
        expect(toggle).toHaveClass("theme-toggle");

        fireEvent.click(toggle);

        expect(
            screen.getByRole("button", { name: "Switch to light mode" })
        ).toBeInTheDocument();
    });

    it("closes state panel on Escape keydown", () => {
        (useUsSummaryData as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockUsSummary,
        });
        (useFlockCases as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockFlockCases,
        });
        (useStatusSummary as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockStatusSummary,
        });
        (useSitesData as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockSitesData,
        });
        (useActiveSites as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockActiveSitesData,
        });
        (useHistoricalSummary as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockHistoricalSummary,
        });
        (useProductionTypeSummary as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockProductionTypeSummary,
        });
        (useSitesTimeline as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockTimelineData,
        });

        renderWithTheme(<App />);

        fireEvent.click(screen.getByText("Select California"));
        expect(screen.getByTestId("state-info")).toBeInTheDocument();

        fireEvent.keyDown(window, { key: "Escape" });
        expect(screen.queryByTestId("state-info")).not.toBeInTheDocument();
    });

    it("renders timeline error message when only timeline fails", () => {
        (useUsSummaryData as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockUsSummary,
        });
        (useFlockCases as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockFlockCases,
        });
        (useStatusSummary as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockStatusSummary,
        });
        (useSitesData as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockSitesData,
        });
        (useActiveSites as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockActiveSitesData,
        });
        (useHistoricalSummary as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockHistoricalSummary,
        });
        (useProductionTypeSummary as any).mockReturnValue({
            isPending: false,
            error: null,
            data: mockProductionTypeSummary,
        });
        (useSitesTimeline as any).mockReturnValue({
            isPending: false,
            error: "Timeline error",
            data: null,
        });

        renderWithTheme(<App />);
        expect(
            screen.getByText("Failed to load timeline data")
        ).toBeInTheDocument();
    });
});
