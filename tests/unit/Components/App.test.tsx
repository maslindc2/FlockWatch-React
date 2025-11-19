// src/App.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../../../src/App";
import { useUsSummaryData } from "../../../src/Hooks/useUsSummaryData";
import { useFlockCases } from "../../../src/Hooks/useFlockCases";

vi.mock("../../../src/Hooks/useUsSummaryData", () => ({
    useUsSummaryData: vi.fn(),
}));
vi.mock("../../../src/Hooks/useFlockCases", () => ({
    useFlockCases: vi.fn(),
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
            total_commercial_flocks_affected: 869
        },
        period_summaries: {
            last_30_days: {
                total_birds_affected: 1880000,
                total_flocks_affected: 88,
                total_backyard_flocks_affected: 50,
                total_commercial_flocks_affected: 38
            }
        }
    },
};

const mockFlockCases = {
    data: [
        {
            state_abbreviation: "CA",
            state: "California",
            birdsAffected: 100,
        },
    ],
    metadata: { last_reported_detection: "2024-12-19T00:00:00.000Z" },
};

describe("App", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading state", () => {
        (useUsSummaryData as any).mockReturnValue({ isPending: true });
        (useFlockCases as any).mockReturnValue({ isPending: true });

        render(<App />);
        expect(screen.getByText("...Loading")).toBeInTheDocument();
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

        render(<App />);
        expect(screen.getByText("So Sorry!")).toBeInTheDocument();
        expect(
            screen.getByText(
                "We ran into some problems getting the page you were looking for"
            )
        ).toBeInTheDocument();
        expect(screen.getByText("Please try again later!")).toBeInTheDocument();
    });

    it("renders main dashboard", () => {
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

        render(<App />);
        expect(screen.getByText("Flock Watch")).toBeInTheDocument();
        expect(screen.getByText(/Last updated on/)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Select California" })
        ).toBeInTheDocument();
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

        render(<App />);

        fireEvent.click(screen.getByText("Select California"));

        const closeButton = screen.getByRole("button");
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toHaveClass("close-button");
    });
});
