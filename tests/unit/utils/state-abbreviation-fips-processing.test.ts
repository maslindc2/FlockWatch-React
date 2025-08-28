import {
    stateAbbreviationToFips,
    fipsToAbbreviation,
} from "../../../src/Components/ChoroplethMap/utils/state-abbreviation-fips-processing";
import {describe, test} from "vitest";
// Unit Testing the object for looking up a State Abbreviation's FIPS Code and going from FIPS to State Abbreviation
describe("state abbreviation to fips and fips to state abbreviation unit test", () => {
    test("stateAbbreviationToFips should return the correct Fips code for Washington State", () => {
        expect(stateAbbreviationToFips["WA"]).toEqual("53");
    });
    test("fipsToAbbreviation should return the WA for the fips code 53", () => {
        expect(fipsToAbbreviation["53"]).toEqual("WA");
    });
});
