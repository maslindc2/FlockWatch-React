import InfoTiles from "../../src/Components/InfoTiles/InfoTiles";
import {render} from "@testing-library/react";

describe("InfoTiles Component", () => {
    let infoTileRoot: HTMLElement;
    let infoTileChildren: HTMLCollection;
    const TILE_TITLE = "Test Info Tile";
    const TILE_ID = "test-info-tile"
    const TILE_AMOUNT = "1970";
    const TILE_BG_COLOR = "#50fff0ff";
    const TILE_ICON = "/flocks-affected.webp";
    beforeEach(() => {
        // Render the InfoTile Component
        const {container} = render(<InfoTiles id={TILE_ID} title={TILE_TITLE} amount={TILE_AMOUNT.toLocaleString()} bgColor={TILE_BG_COLOR} icon={TILE_ICON} />);
        // Get the root element of the InfoTile Component
        infoTileRoot = container.firstChild as HTMLElement;
        // Get the children of the root element
        infoTileChildren = infoTileRoot.children as HTMLCollection;
    })
    it("root should have classname tile-container and have expected properties when rendered", ()=>{
        // Expect the InfoTile root to be in the document
        expect(infoTileRoot).toBeInTheDocument();
        // Expect it to have the correct classname
        expect(infoTileRoot).toHaveClass("tile-container");
        // Expect that it has the background color applied to it from above
        expect(infoTileRoot).toHaveStyle(`background-color: ${TILE_BG_COLOR}`);
        // Expect the root to have 2 children a Div and an image which we will be testing next
        expect(infoTileChildren).toHaveLength(2);
    });
    it("information div should have the expected elements when rendered", () => {
        // Get the first div of the root children which is the Information portion of the tile
        const tileInner = infoTileChildren[0];
        const tileInnerChildren = tileInner.children;
        
        // There should be 2 elements that make up this
        expect(tileInnerChildren).toHaveLength(2);
        // Expect the tile-inner div to be rendered
        expect(tileInner).toBeInTheDocument();
        // The root of the information portion should have the class tile-inner
        expect(tileInner).toHaveClass("tile-inner");
        
        const tileInfoParagraph = tileInnerChildren[0];
        // Expect the paragraph to be rendered
        expect(tileInfoParagraph).toBeInTheDocument();
        // The first element should be a P
        expect(tileInfoParagraph.tagName).toBe("P");
        // The P should have our expected title
        expect(tileInfoParagraph.innerHTML).toBe(TILE_TITLE);
        // The id used for accessibility should have the test-info-tile-label
        expect(tileInfoParagraph.id).toBe(`${TILE_ID}-label`);

        const tileInfoH3 = tileInnerChildren[1];
        // Expect the h3 to be rendered
        expect(tileInfoH3).toBeInTheDocument();
        // The next element should be an H3
        expect(tileInfoH3.tagName).toBe("H3");
        // A screen reader if the element is targeted should simply read out the Tile's title and the amount
        expect(tileInfoH3).toHaveAccessibleName(`${TILE_TITLE} ${TILE_AMOUNT}`);
    });
    it("has the correct accessible name", () => {
        // Access the div containing our info tile's icon
        const tileIconDiv = infoTileChildren[1];
        // Expect the info tile icon to be rendered
        expect(tileIconDiv).toBeInTheDocument();
        // Expect it to be a div that's holding the image tag
        expect(tileIconDiv.tagName).toBe("DIV");
        // Expect the div to have the class tile-icon
        expect(tileIconDiv).toHaveClass("tile-icon");

        // Expect the tile-icon div to only have 1 child which is the image tag
        expect(tileIconDiv.children.length).toBe(1);
        // Access the icon in the tile-icon div
        const infoTileIcon = tileIconDiv.children[0];
        // Expect the info tile icon to be rendered in the document
        expect(infoTileIcon).toBeInTheDocument();
        // Expect the info tile icon to have the expected source we defined above
        expect(infoTileIcon).toHaveAttribute("src", TILE_ICON);
        // Expect the info tile icon to have the expected alt text we defined above
        expect(infoTileIcon).toHaveAttribute("alt", `${TILE_TITLE} Icon`);
        
    });
})