import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import nock from "nock";
import { describe, test, expect, vi } from "vitest";

import { act, renderHook } from "@testing-library/react";
import { useUsSummaryData } from "../../../src/Hooks/useUsSummaryData";

describe("testing network", () => {
    beforeEach(() => {
        import.meta.env.VITE_USE_LOCAL = false;
    });
    test("should return expected structure when used", async () => {
        const queryClient = new QueryClient();

        const wrapper = ({ children }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );

        nock("http://flockwatch.io")
            .get("/data/us-summary")
            .reply(200, {
                data: {
                    totalBackyardFlocksNationwide: 922,
                    totalBirdsAffectedNationwide: 174834748,
                    totalCommercialFlocksNationwide: 788,
                    totalFlocksAffectedNationwide: 1710,
                    totalStatesAffected: 51,
                },
                metadata: {
                    lastScrapedDate: "2025-08-19T01:03:32.231Z",
                },
            });

        const { result } = renderHook(
            () => useUsSummaryData("http://flockwatch.io"),
            { wrapper }
        );

        await vi.waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            expect(
                result.current.data?.data.totalBackyardFlocksNationwide
            ).toBe(922);
            expect(result.current.data?.data.totalBirdsAffectedNationwide).toBe(
                174834748
            );
            expect(
                result.current.data?.data.totalCommercialFlocksNationwide
            ).toBe(788);
            expect(
                result.current.data?.data.totalFlocksAffectedNationwide
            ).toBe(1710);
            expect(result.current.data?.data.totalStatesAffected).toBe(51);
        });
    });
});
