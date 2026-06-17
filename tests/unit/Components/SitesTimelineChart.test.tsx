import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "../../../src/theme/ThemeProvider";
import SitesTimelineChart from "../../../src/Components/SitesTimelineChart/SitesTimelineChart";

function renderWithTheme(ui: React.ReactElement) {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
}

function renderChart(
    props?: Partial<React.ComponentProps<typeof SitesTimelineChart>>
) {
    const defaultProps: React.ComponentProps<typeof SitesTimelineChart> = {
        data: [
            {
                period: "2022-02",
                new_confirmations: 10,
                birds_affected: 1154298,
                cumulative_birds_affected: 1154298,
            },
            {
                period: "2022-03",
                new_confirmations: 15,
                birds_affected: 2000000,
                cumulative_birds_affected: 3154298,
            },
        ],
        granularity: "month",
        onGranularityChange: vi.fn(),
        ...props,
    };
    return renderWithTheme(<SitesTimelineChart {...defaultProps} />);
}

describe("SitesTimelineChart", () => {
    it("renders granularity control buttons", () => {
        renderChart();
        expect(screen.getByText("Week")).toBeInTheDocument();
        expect(screen.getByText("Month")).toBeInTheDocument();
        expect(screen.getByText("Year")).toBeInTheDocument();
    });

    it("highlights the active granularity button", () => {
        renderChart();
        const monthBtn = screen.getByText("Month");
        expect(monthBtn).toHaveClass("active");
        expect(screen.getByText("Week")).not.toHaveClass("active");
    });

    it("calls onGranularityChange when a button is clicked", () => {
        const onGranularityChange = vi.fn();
        renderChart({ onGranularityChange });
        fireEvent.click(screen.getByText("Year"));
        expect(onGranularityChange).toHaveBeenCalledWith("year");
    });

    it("renders data table inside details element", () => {
        renderChart();
        expect(
            screen.getByText("View timeline data as a table")
        ).toBeInTheDocument();
        expect(screen.getByText("2022-02")).toBeInTheDocument();
        expect(screen.getByText("2022-03")).toBeInTheDocument();
    });

    it("renders SVG with aria-label", () => {
        renderChart();
        const svg = screen.getByRole("img");
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute(
            "aria-label",
            expect.stringContaining("Timeline chart")
        );
    });

    it("renders empty state with no data", () => {
        renderChart({ data: [] });
        expect(
            screen.getByText("View timeline data as a table")
        ).toBeInTheDocument();
        const svg = screen.getByRole("img");
        expect(svg).toHaveAttribute(
            "aria-label",
            "Timeline chart showing avian influenza outbreak over time."
        );
    });
});
