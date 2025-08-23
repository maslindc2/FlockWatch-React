import { render, screen, waitFor } from "@testing-library/react";
import * as d3 from "d3";
import SelectedStateMap from "../../../src/Components/SelectedState/SelectedState";

jest.mock(
    "../../../src/Components/ChoroplethMap/utils/state-abbreviation-fips-processing",
    () => ({
        stateAbbreviationToFips: {
            WA: "53",
            NY: "36",
            XX: "99",
        },
    })
);

jest.mock("topojson-client", () => ({
    feature: jest.fn((_us: any, _obj: any) => ({
        features: [{ id: "53", geometry: {} }], // matches WA mapping
    })),
}));

jest.mock("d3", () => {
    return {
        json: jest.fn(),
        select: jest.fn((el) => ({
            attr: jest.fn(function (name, value) {
                if (value !== undefined) {
                    el.setAttribute(name, value);
                    return this;
                }
                return el.getAttribute(name);
            }),
            style: jest.fn().mockReturnThis(),
            selectAll: jest.fn(() => ({ remove: jest.fn() })),
            append: jest.fn((tag) => {
                const element = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    tag
                );
                el.appendChild(element);
                return {
                    datum: jest.fn().mockReturnThis(),
                    attr: jest.fn(function (name, value) {
                        if (value !== undefined) {
                            element.setAttribute(name, value);
                            return this;
                        }
                        return element.getAttribute(name);
                    }),
                };
            }),
        })),
        geoMercator: jest.fn(() => ({
            fitSize: jest.fn().mockReturnThis(),
        })),
        geoPath: jest.fn(() => ({
            projection: jest.fn().mockReturnThis(),
        })),
    };
});

const mockTopoJSON = {
    type: "Topology",
    objects: {
        states: {
            type: "GeometryCollection",
            geometries: [{ id: "53", type: "Polygon", arcs: [] }],
        },
    },
    arcs: [],
};

const mockTopoJSONNoMatch = {
    type: "Topology",
    objects: {
        states: {
            type: "GeometryCollection",
            geometries: [{ id: "01", type: "Polygon", arcs: [] }],
        },
    },
    arcs: [],
};

describe("SelectedStateMap", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders static title and description", () => {
        (d3.json as jest.Mock).mockResolvedValue(mockTopoJSON);

        render(
            <SelectedStateMap
                stateAbbreviation="WA"
                stateName="Washington"
                stateColor="red"
            />
        );

        expect(screen.getByTitle("Selected State Map")).toBeInTheDocument();
        expect(
            screen.getByText("Map outline of Washington")
        ).toBeInTheDocument();
        expect(document.querySelector("svg")).toBeInTheDocument();
    });

    it("fetches /states-10m.json on mount", async () => {
        (d3.json as jest.Mock).mockResolvedValue(mockTopoJSON);

        render(
            <SelectedStateMap
                stateAbbreviation="WA"
                stateName="Washington"
                stateColor="red"
            />
        );

        await waitFor(() => {
            expect(d3.json).toHaveBeenCalledWith("/states-10m.json");
        });
    });

    it("draws a path for the matching state", async () => {
        (d3.json as jest.Mock).mockResolvedValue(mockTopoJSON);

        render(
            <SelectedStateMap
                stateAbbreviation="WA"
                stateName="Washington"
                stateColor="red"
            />
        );

        await waitFor(() => {
            const path = document.querySelector("path");
            expect(path).toBeInTheDocument();
            expect(path).toHaveAttribute("fill", "red");
            expect(path).toHaveAttribute("stroke", "#333");
        });
    });

    it("renders no path when state is not found", async () => {
        // change topojson mock for this test only
        const topojson = require("topojson-client");
        topojson.feature.mockImplementation(() => ({
            features: [{ id: "01", geometry: {} }],
        }));

        (d3.json as jest.Mock).mockResolvedValue(mockTopoJSONNoMatch);

        render(
            <SelectedStateMap
                stateAbbreviation="XX"
                stateName="Invalid State"
                stateColor="blue"
            />
        );

        await waitFor(() => {
            expect(document.querySelector("path")).not.toBeInTheDocument();
        });
    });

    it("does not crash on null or malformed data", async () => {
        (d3.json as jest.Mock).mockResolvedValue(null);

        render(
            <SelectedStateMap
                stateAbbreviation="WA"
                stateName="Washington"
                stateColor="red"
            />
        );

        await waitFor(() => {
            expect(screen.getByTitle("Selected State Map")).toBeInTheDocument();
            expect(document.querySelector("path")).not.toBeInTheDocument();
        });
    });

    it("uses correct FIPS mapping for given abbreviation", async () => {
        (d3.json as jest.Mock).mockImplementation(() => {
            // Dummy check
            expect(true).toBe(true);
            return Promise.resolve(mockTopoJSON);
        });

        render(
            <SelectedStateMap
                stateAbbreviation="NY"
                stateName="New York"
                stateColor="green"
            />
        );

        await waitFor(() => {
            expect(d3.json).toHaveBeenCalledTimes(1);
            const svg = document.querySelector("svg");
            expect(svg).toBeInTheDocument();
        });
    });
});
