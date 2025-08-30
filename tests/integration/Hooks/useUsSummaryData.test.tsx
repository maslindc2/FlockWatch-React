import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import nock, { restore } from "nock";
import { describe, test, expect, vi, beforeEach } from "vitest";

import { act, renderHook } from "@testing-library/react";
import { useUsSummaryData } from "../../../src/Hooks/useUsSummaryData";

describe("testing network", () => {
    beforeEach(() => {
        import.meta.env.VITE_USE_LOCAL = false;
    });
    test("should return expected structure when used", async () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,        // don’t retry on error
                    cacheTime: 0,        // no stale cache between tests
                },
            },
        });

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
    test("should throw a Failed to fetch US Summary data when fetch fails", async () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,        // don’t retry on error
                    cacheTime: 0,        // no stale cache between tests
                },
            },
        });

        const wrapper = ({ children }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );

        nock("http://flockwatch.io")
            .get("/data/us-summary")
            .delay(500)
            .reply( 500, {
                code: 500,
                message: "Server ERROR 500"
            });

        const { result } = renderHook(
            () => useUsSummaryData("http://flockwatch.io"),
            { wrapper }
        );

        await vi.waitFor(() => {
            expect(result.current.isError).toBe(true);
            expect(result.current.error?.message).toBe("Failed to fetch US summary");
        });
    });
});
