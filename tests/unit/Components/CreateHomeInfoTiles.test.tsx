import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";
import createHomeInfoTiles, { IUSTileData } from "../../../src/Components/InfoTiles/CreateInfoTiles";

describe("createHomeInfoTiles unit test with real InfoTiles", () => {
    it("renders all InfoTiles with correct text and formatting", () => {
        const tileData = {
            totalBackyardFlocksAffected: 12345,
            totalBirdsAffected: 67890,
            totalCommercialFlocksAffected: 222,
            totalFlocksAffected: 333,
            totalStatesAffected: 44,
        };

        const tilesArray = createHomeInfoTiles(tileData);

        render(<div>{tilesArray}</div>);

        const tiles = screen.getAllByTitle(/.+/);
        expect(tiles).toHaveLength(Object.keys(tileData).length);

        expect(
            screen.getByText("Backyard Flocks Affected")
        ).toBeInTheDocument();
        expect(screen.getByText("12,345")).toBeInTheDocument();
        expect(
            screen.getByAltText("Backyard Flocks Affected Icon")
        ).toHaveAttribute("src", "/backyard-flocks2.png");

        expect(screen.getByText("Birds Affected")).toBeInTheDocument();
        expect(screen.getByText("67,890")).toBeInTheDocument();
        expect(screen.getByAltText("Birds Affected Icon")).toHaveAttribute(
            "src",
            "/birds-affected.png"
        );
    });
});
