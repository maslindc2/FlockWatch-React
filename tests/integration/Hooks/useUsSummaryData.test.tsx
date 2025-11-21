import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import nock from "nock";
import { describe, test, expect, vi, beforeEach } from "vitest";

import { renderHook } from "@testing-library/react";
import { useUsSummaryData } from "../../../src/Hooks/useUsSummaryData";

describe("useUsSummaryData Hook integration test", () => {
    beforeEach(() => {
        import.meta.env.VITE_USE_LOCAL = false;
    });
    test("should return expected structure when used", async () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    cacheTime: 0,
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
                    allTimeTotals: {
                        totalStatesAffected: 51,
                        totalBirdsAffected: 181750149,
                        totalFlocksAffected: 1777,
                        totalBackyardFlocksAffected: 949,
                        totalCommercialFlocksAffected: 828,
                    },
                    periodSummaries: {
                        last30Days: {
                            totalBirdsAffected: 6340000,
                            totalFlocksAffected: 49,
                            totalBackyardFlocksAffected: 20,
                            totalCommercialFlocksAffected: 29,
                        },
                    },
                },
                metadata: {
                    lastScrapedDate: "2025-10-20T23:32:50.348Z",
                },
            });

        const { result } = renderHook(
            () => useUsSummaryData("http://flockwatch.io"),
            { wrapper }
        );

        await vi.waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            // Asserting the allTimeTotals
            expect(
                result.current.data?.data.allTimeTotals.totalStatesAffected
            ).toBe(51);
            expect(
                result.current.data?.data.allTimeTotals.totalBirdsAffected
            ).toBe(181750149);
            expect(
                result.current.data?.data.allTimeTotals.totalFlocksAffected
            ).toBe(1777);
            expect(
                result.current.data?.data.allTimeTotals
                    .totalBackyardFlocksAffected
            ).toBe(949);
            expect(
                result.current.data?.data.allTimeTotals
                    .totalCommercialFlocksAffected
            ).toBe(828);
            // Asserting the periodSummaries
            expect(
                result.current.data?.data.periodSummaries.last30Days
                    .totalBirdsAffected
            ).toBe(6340000);
            expect(
                result.current.data?.data.periodSummaries.last30Days
                    .totalFlocksAffected
            ).toBe(49);
            expect(
                result.current.data?.data.periodSummaries.last30Days
                    .totalBackyardFlocksAffected
            ).toBe(20);
            expect(
                result.current.data?.data.periodSummaries.last30Days
                    .totalCommercialFlocksAffected
            ).toBe(29);
        });
    });
    test("should throw a Failed to fetch US Summary data when fetch fails", async () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    cacheTime: 0,
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
            .reply(500, {
                code: 500,
                message: "Server ERROR 500",
            });

        const { result } = renderHook(
            () => useUsSummaryData("http://flockwatch.io"),
            { wrapper }
        );

        await vi.waitFor(() => {
            expect(result.current.isError).toEqual(true);
            expect(result.current.error?.message).toBe(
                "Failed to fetch US summary"
            );
        });
    });
});
