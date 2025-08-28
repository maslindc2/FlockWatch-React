import { describe, test, vi } from "vitest";
import formatDateForUser from "../../../src/Utils/dateFormatter";

describe("dateFormatter utility unit test", () => {
    test("should return the date with en-US format MM/DD/YYYY", () => {
        // Format the test string: "2024-11-26T00:00:00.000Z" to be MM/DD/YYYY
        const formattedUnixEpoch = formatDateForUser(
            "2024-11-26T00:00:00.000Z"
        );
        expect(formattedUnixEpoch).toEqual("11/26/2024");
    });
    test("should return the date with en-GB format DD/MM/YYYY", () => {
        vi.spyOn(global.navigator, "language", "get").mockReturnValue("en-GB");
        // Format the test string: "2024-11-26T00:00:00.000Z" to be DD/MM/YYYY
        const formattedUnixEpoch = formatDateForUser(
            "2024-11-26T00:00:00.000Z"
        );
        expect(formattedUnixEpoch).toEqual("26/11/2024");
    });
    test("should return the date with de-DE format DD.MM.YYYY", () => {
        vi.spyOn(global.navigator, "language", "get").mockReturnValue("de-DE");
        // Format the test string: "2024-11-26T00:00:00.000Z" to be DD.MM.YYYY
        const formattedUnixEpoch = formatDateForUser(
            "2024-11-26T00:00:00.000Z"
        );
        expect(formattedUnixEpoch).toEqual("26.11.2024");
    });
    test("should return the date with ja-JP format YYYY/MM/DD", () => {
        vi.spyOn(global.navigator, "language", "get").mockReturnValue("ja-JP");
        // Format the test string: "2024-11-26T00:00:00.000Z" to be YYYY/DD/MM
        const formattedUnixEpoch = formatDateForUser(
            "2024-11-26T00:00:00.000Z"
        );
        expect(formattedUnixEpoch).toEqual("2024/11/26");
    });
    test("should return the date with ko-KO format YYYY.MM.DD.", () => {
        vi.spyOn(global.navigator, "language", "get").mockReturnValue("ko-KO");
        // Format the test string: "2024-11-26T00:00:00.000Z" to be YYYY. MM. DD.
        const formattedUnixEpoch = formatDateForUser(
            "2024-11-26T00:00:00.000Z"
        );
        expect(formattedUnixEpoch).toEqual("2024. 11. 26.");
    });
    test("should default to en-US format when navigator.language fails to detect the locale", () => {
        // Mock the navigator.language to not return a value causing the en-US fallback to be used
        vi.spyOn(global.navigator, "language", "get").mockReturnValue("");
        // Format our test string "2024-11-26T00:00:00.000Z"
        const formattedUnixEpoch = formatDateForUser(
            "2024-11-26T00:00:00.000Z"
        );
        // The formatted string should be in the en-US format
        expect(formattedUnixEpoch).toEqual("11/26/2024");
    });
});
