import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import nock from "nock";
import {describe, test, expect, vi} from "vitest";
import { renderHook } from "@testing-library/react";
import { useFlockCases } from "../../../src/Hooks/useFlockCases";


describe("testing network", () => {
    beforeEach(() => {
        import.meta.env.VITE_USE_LOCAL = false;
    });
    test("should return expected structure when used", async () => {
        const queryClient = new QueryClient();
        
        const wrapper = ({children}) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );

        nock("http://flockwatch.io").get("/data/flock-cases").reply(200, {
            data: [
                {
                    "state": "Alaska",
                    "backyardFlocks": 11,
                    "birdsAffected": 1370,
                    "commercialFlocks": 0,
                    "lastReportedDate": "2024-11-26T00:00:00.000Z",
                    "latitude": 23.220494732,
                    "longitude": -118.42924009,
                    "stateAbbreviation": "AK",
                    "totalFlocks": 11
                }
            ],
            metadata: {
                "lastScrapedDate": "2025-08-19T01:03:32.231Z"
            }
        });

        const {result} = renderHook(() => useFlockCases("http://flockwatch.io"), { wrapper });

        await vi.waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data?.data).toHaveLength(1);
            expect(result.current.data?.data[0].state).toBe("Alaska");
            expect(result.current.data?.data[0].backyardFlocks).toBe(11);
            expect(result.current.data?.data[0].birdsAffected).toBe(1370);
            expect(result.current.data?.data[0].commercialFlocks).toBe(0);
            expect(result.current.data?.data[0].lastReportedDate).toBe("2024-11-26T00:00:00.000Z");
            expect(result.current.data?.data[0].latitude).toBe(23.220494732);
            expect(result.current.data?.data[0].longitude).toBe(-118.42924009);
            expect(result.current.data?.data[0].stateAbbreviation).toBe("AK");
            expect(result.current.data?.data[0].totalFlocks).toBe(11);
        });
    });
});