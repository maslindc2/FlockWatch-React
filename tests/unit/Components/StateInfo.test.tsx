import { render, screen } from "@testing-library/react";
import StateInfo from "../../../src/Components/StateInfo/StateInfo";
import formatDateForUser from "../../../src/Utils/dateFormatter";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import { KpiTileProps } from "../../../src/Components/KpiTiles/KpiTiles";

// Mock the InfoTiles components as we already have tests for that
vi.mock("../../../src/Components/KpiTiles/KpiTiles", () => ({
    __esModule: true,
    default: ({ id, title, amount, icon, bgColor }: KpiTileProps) => (
        <div data-testid={`info-tile-${id}`}>
            {title}-{amount}-{icon}-{bgColor}
        </div>
    ),
}));

// Mock the dateFormatter as we have tests for it already
vi.mock("../../../src/Utils/dateFormatter");

// Mock the StateProductionPieChart as it uses d3 internally
vi.mock("../../../src/Components/StateProductionPieChart/StateProductionPieChart", () => ({
    __esModule: true,
    default: ({ data, stateName }: { data: { label: string; count: number }[]; stateName: string }) => (
        <div data-testid="state-production-pie-chart">
            {stateName}-{data.length} types
        </div>
    ),
}));

describe("StateInfo", () => {
    // Create our mock state info based on the Washington State flock info
    const mockStateInfo = {
        backyard_flocks: 52,
        birds_affected: 2167079,
        commercial_flocks: 3,
        last_reported_detection: "2025-02-10T00:00:00.000Z",
        latitude: 47.556837171,
        longitude: -122.16233971,
        state: "Washington",
        state_abbreviation: "WA",
        total_flocks: 55,
        color: "blue",
    };

    // Before each test return the below formatted date
    beforeEach(() => {
        vi.mocked(formatDateForUser).mockReturnValue("02/10/2025");
    });

    const defaultProps = {
        stateActiveSitesCount: 5,
        stateBirdsAtRisk: 25000,
        stateProductionTypes: [
            { label: "Commercial Duck", count: 3 },
            { label: "Backyard Flock", count: 2 },
        ],
        stateCountyData: [
            { county: "Elkhart", count: 3, birds: 18000, types: "Commercial Duck Meat Bird" },
            { county: "Lagrange", count: 2, birds: 7000, types: "WOAH Poultry, Commercial Duck Breeder" },
        ],
    };

    it("should contain the state title and abbreviation when the component is rendered", () => {
        render(<StateInfo stateInfo={mockStateInfo} {...defaultProps} />);
        expect(
            screen.getByRole("heading", {
                level: 1,
                name: /Washington \(WA\)/i,
            })
        ).toBeInTheDocument();
    });

    it("should render the the last case reported when the state info component is rendered", () => {
        render(<StateInfo stateInfo={mockStateInfo} {...defaultProps} />);
        expect(
            screen.getByText("Last case reported on 02/10/2025")
        ).toBeInTheDocument();
        expect(formatDateForUser).toHaveBeenCalledWith(
            "2025-02-10T00:00:00.000Z"
        );
    });

    it("should render the InfoTiles with the expected text content using mockedStateInfo when the StateInfo component is rendered", () => {
        render(<StateInfo stateInfo={mockStateInfo} {...defaultProps} />);

        // Expect the backyard flock info tile to have the expected text content
        expect(
            screen.getByTestId("info-tile-backyard-flocks")
        ).toHaveTextContent("Backyard Flocks Affected");

        // Expect the birds affected info tile to have the expected text content
        expect(
            screen.getByTestId("info-tile-birds-affected")
        ).toHaveTextContent("Birds Affected");

        // Expect the commercial flocks affected info tile to have the expected text content
        expect(
            screen.getByTestId("info-tile-commercial-flocks")
        ).toHaveTextContent("Commercial Flocks Affected");

        // Expect the total flocks info tile to have the expected text content
        expect(screen.getByTestId("info-tile-total-flocks")).toHaveTextContent(
            "Total Flocks Affected"
        );

        // Expect new active-site KPI tiles
        expect(
            screen.getByTestId("info-tile-state-active-sites")
        ).toHaveTextContent("Active Sites (current)");

        expect(
            screen.getByTestId("info-tile-state-birds-at-risk")
        ).toHaveTextContent("Birds at Risk (active)");
    });

    it("should render the production-type pie chart section when there are active production types", () => {
        render(<StateInfo stateInfo={mockStateInfo} {...defaultProps} />);

        expect(
            screen.getByText("Active Sites by Production Type")
        ).toBeInTheDocument();

        expect(
            screen.getByTestId("state-production-pie-chart")
        ).toHaveTextContent("Washington-2 types");
    });

    it("should render the county table with affected counties when there are active sites", () => {
        render(<StateInfo stateInfo={mockStateInfo} {...defaultProps} />);

        expect(
            screen.getByText("Affected Counties")
        ).toBeInTheDocument();

        expect(screen.getByText("Elkhart")).toBeInTheDocument();
        expect(screen.getByText("Lagrange")).toBeInTheDocument();

        // County table headers
        expect(screen.getByText("County")).toBeInTheDocument();
        expect(screen.getByText("Active Sites")).toBeInTheDocument();
        expect(screen.getByText("Birds at Risk")).toBeInTheDocument();
    });

    it("should not render the production-type pie chart section when there are no active sites", () => {
        render(
            <StateInfo
                stateInfo={mockStateInfo}
                stateActiveSitesCount={0}
                stateBirdsAtRisk={0}
                stateProductionTypes={[]}
                stateCountyData={[]}
            />
        );

        expect(
            screen.queryByText("Active Sites by Production Type")
        ).not.toBeInTheDocument();

        expect(
            screen.queryByText("Affected Counties")
        ).not.toBeInTheDocument();
    });
});
