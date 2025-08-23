import { render, screen } from "@testing-library/react";
import StateInfo from "../../../src/Components/StateInfo/StateInfo";
import formatDateForUser from "../../../src/Utils/dateFormatter";

// Mock the Selected State as we already have tests for that
jest.mock("../../../src/Components/SelectedState/SelectedState", () => ({
    __esModule: true,
    default: ({ stateAbbreviation, stateName, stateColor }: any) => (
        <div data-testid="selected-state-map">
            {stateAbbreviation}-{stateName}-{stateColor}
        </div>
    ),
}));

// Mock the InfoTiles components as we already have tests for that
jest.mock("../../../src/Components/InfoTiles/InfoTiles", () => ({
    __esModule: true,
    default: ({ id, title, amount, icon, bgColor }: any) => (
        <div data-testid={`info-tile-${id}`}>
            {title}-{amount}-{icon}-{bgColor}
        </div>
    ),
}));

// Mock the dateFormatter as we have tests for it already
jest.mock("../../../src/Utils/dateFormatter");

describe("StateInfo", () => {
    
    // Create our mock state info based on the Washington State flock info
    const mockStateInfo = {
        backyardFlocks: "52",
        birdsAffected: "2167079",
        commercialFlocks: 3,
        lastReportedDate: "2025-02-10T00:00:00.000Z",
        latitude: 47.556837171,
        longitude: -122.16233971,
        state: "Washington",
        stateAbbreviation: "WA",
        totalFlocks: 55,
        color: "blue",
    };

    // Before each test return the below formatted date
    beforeEach(() => {
        (formatDateForUser as jest.Mock).mockReturnValue("02/10/2025");
    });

    it("should contain the state title and abbreviation when the component is rendered", () => {
        render(<StateInfo stateInfo={mockStateInfo} />);
        expect(
            screen.getByRole("heading", { level: 1, name: /Washington \(WA\)/i })
        ).toBeInTheDocument();
    });

    it("should render the the last case reported when the state info component is rendered", () => {
        render(<StateInfo stateInfo={mockStateInfo} />);
        expect(
            screen.getByText("Last case reported on 02/10/2025")
        ).toBeInTheDocument();
        expect(formatDateForUser).toHaveBeenCalledWith("2025-02-10T00:00:00.000Z");
    });

    it("should render the mocked state info and SelectedStateMap should have the text content when the StateInfo is rendered", () => {
        render(<StateInfo stateInfo={mockStateInfo} />);
        expect(screen.getByTestId("selected-state-map")).toHaveTextContent(
            "WA-Washington-blue"
        );
    });

    it("should render the InfoTiles with the expected text content using mockedStateInfo when the StateInfo component is rendered", () => {
        render(<StateInfo stateInfo={mockStateInfo} />);

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
    });
});
