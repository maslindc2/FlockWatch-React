import formatDateForUser from "../../../src/Utils/dateFormatter"
describe("dateFormatter utility unit test",() => {
    it("should return the date with en-US format MM/DD/YYYY", () => {
        // Format the test string: "2024-11-26T00:00:00.000Z" to be MM/DD/YYYY
        const formattedUnixEpoch = formatDateForUser("2024-11-26T00:00:00.000Z");
        expect(formattedUnixEpoch).toEqual("11/26/2024");
    });
    it("should return the date with en-GB format DD/MM/YYYY", () => {
        jest.spyOn(global.navigator, "language", "get").mockReturnValue("en-GB")
        // Format the test string: "2024-11-26T00:00:00.000Z" to be MM/DD/YYYY
        const formattedUnixEpoch = formatDateForUser("2024-11-26T00:00:00.000Z");
        expect(formattedUnixEpoch).toEqual("26/11/2024");
    });
    it("should return the date with de-DE format DD.MM.YYYY", () => {
        jest.spyOn(global.navigator, "language", "get").mockReturnValue("de-DE")
        // Format the test string: "2024-11-26T00:00:00.000Z" to be MM/DD/YYYY
        const formattedUnixEpoch = formatDateForUser("2024-11-26T00:00:00.000Z");
        expect(formattedUnixEpoch).toEqual("26.11.2024");
    });
    it("should return the date with ja-JP format YYYY/MM/DD", () => {
        jest.spyOn(global.navigator, "language", "get").mockReturnValue("ja-JP")
        // Format the test string: "2024-11-26T00:00:00.000Z" to be MM/DD/YYYY
        const formattedUnixEpoch = formatDateForUser("2024-11-26T00:00:00.000Z");
        expect(formattedUnixEpoch).toEqual("2024/11/26");
    });
    it("should return the date with ko-KO format YYYY.MM.DD.", () => {
        jest.spyOn(global.navigator, "language", "get").mockReturnValue("ko-KO")
        // Format the test string: "2024-11-26T00:00:00.000Z" to be MM/DD/YYYY
        const formattedUnixEpoch = formatDateForUser("2024-11-26T00:00:00.000Z");
        expect(formattedUnixEpoch).toEqual("2024. 11. 26.");
    });
    it("should default to en-US format when navigator.language fails to detect the locale", () => {
        jest.spyOn(global.navigator, "language", "get").mockReturnValue("");
        const formattedUnixEpoch = formatDateForUser("2024-11-26T00:00:00.000Z");
        expect(formattedUnixEpoch).toEqual("11/26/2024");
    })
})