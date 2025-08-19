import React from "react";
import { render, screen } from "@testing-library/react";
import InfoTiles from "../../src/Components/InfoTiles/InfoTiles";
import createHomeInfoTiles from "../../src/Components/InfoTiles/CreateHomeInfoTiles";

describe("createHomeInfoTiles integration with real InfoTiles", () => {
    it("renders all InfoTiles with correct text and formatting", () => {
        const tileData = {
            totalBackyardFlocksNationwide: 12345,
            totalBirdsAffectedNationwide: 67890,
            totalCommercialFlocksNationwide: 222,
            totalFlocksAffectedNationwide: 333,
            totalStatesAffected: 44,
        };

        const tilesArray = createHomeInfoTiles(tileData);

        render(<div>{tilesArray}</div>);

        // We expect one tile per key:
        const tiles = screen.getAllByTitle(/.+/); // all divs with a title attribute
        expect(tiles).toHaveLength(Object.keys(tileData).length);

        // Check specific tile contents

        // 1. By title text
        expect(
            screen.getByText("Backyard Flocks Affected")
        ).toBeInTheDocument();
        expect(screen.getByText("12,345")).toBeInTheDocument();

        // 2. By image alt text with the icon
        expect(
            screen.getByAltText("Backyard Flocks Affected Icon")
        ).toHaveAttribute("src", "/backyard-flocks2.png");

        // 3. Another tile check
        expect(screen.getByText("Birds Affected")).toBeInTheDocument();
        expect(screen.getByText("67,890")).toBeInTheDocument();
        expect(screen.getByAltText("Birds Affected Icon")).toHaveAttribute(
            "src",
            "/birds-affected.png"
        );
    });

    it("logs error and skips unexpected keys", () => {
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const tileData = {
            totalBackyardFlocksNationwide: 100,
            unexpectedKey: 200,
        } as any;

        const tilesArray = createHomeInfoTiles(tileData);
        render(<div>{tilesArray}</div>);

        expect(consoleSpy).toHaveBeenCalledWith(
            "Unexpected key in tileData: unexpectedKey"
        );

        // Only one tile rendered:
        const tiles = screen.getAllByTitle(/.+/);
        expect(tiles).toHaveLength(1);

        consoleSpy.mockRestore();
    });
});
