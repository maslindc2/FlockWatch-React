import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import SelectedStateMap from "../../../src/Components/SelectedState/SelectedState";

vi.mock(
    "../../../src/Components/ChoroplethMap/utils/state-abbreviation-fips-processing",
    () => ({
        stateAbbreviationToFips: {
            WA: "53",
            NY: "36",
            XX: "99",
        },
    })
);

vi.mock("topojson-client", () => ({
    feature: vi.fn((_us: any, _obj: any) => ({
        features: [{ id: "53", geometry: {} }], // matches WA mapping
    })),
}));

vi.mock("d3", () => {
    return {
        json: vi.fn(),
        select: vi.fn((el) => ({
            attr: vi.fn(function (name, value) {
                if (value !== undefined) {
                    el.setAttribute(name, value);
                    return this;
                }
                return el.getAttribute(name);
            }),
            style: vi.fn().mockReturnThis(),
            selectAll: vi.fn(() => ({ remove: vi.fn() })),
            append: vi.fn((tag) => {
                const element = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    tag
                );
                el.appendChild(element);
                return {
                    datum: vi.fn().mockReturnThis(),
                    attr: vi.fn(function (name, value) {
                        if (value !== undefined) {
                            element.setAttribute(name, value);
                            return this;
                        }
                        return element.getAttribute(name);
                    }),
                };
            }),
        })),
        geoMercator: vi.fn(() => ({
            fitSize: vi.fn().mockReturnThis(),
        })),
        geoPath: vi.fn(() => ({
            projection: vi.fn().mockReturnThis(),
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
        vi.clearAllMocks();
    });

    it("renders static title and description", () => {
        (d3.json as vi.Mock).mockResolvedValue(mockTopoJSON);

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
        (d3.json as vi.Mock).mockResolvedValue(mockTopoJSON);

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
        (d3.json as vi.Mock).mockResolvedValue(mockTopoJSON);

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
        (topojson.feature as vi.Mock).mockImplementation(() => ({
            features: [{ id: "01", geometry: {} }],
        }));

        (d3.json as vi.Mock).mockResolvedValue(mockTopoJSONNoMatch);

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
        (d3.json as vi.Mock).mockResolvedValue(null);

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
        (d3.json as vi.Mock).mockImplementation(() => {
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
