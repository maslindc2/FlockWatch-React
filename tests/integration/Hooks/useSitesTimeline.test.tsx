import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import nock from "nock";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSitesTimeline } from "../../../src/Hooks/useSitesTimeline";

describe("useSitesTimeline Hook integration test", () => {
    beforeEach(() => {
        import.meta.env.VITE_USE_LOCAL = false;
    });

    test("should return expected structure when used with month granularity", async () => {
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
            .get("/data/sites/timeline?granularity=month")
            .reply(200, {
                data: {
                    granularity: "month",
                    periods: [
                        {
                            period: "2022-02",
                            new_confirmations: 10,
                            birds_affected: 1154298,
                            cumulative_birds_affected: 1154298,
                        },
                    ],
                },
                metadata: {
                    last_scraped_date: "2025-10-20T23:32:50.348Z",
                },
            });

        const { result } = renderHook(
            () => useSitesTimeline("http://flockwatch.io", "month"),
            { wrapper }
        );

        await vi.waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data?.data.granularity).toBe("month");
            expect(result.current.data?.data.periods).toHaveLength(1);
            expect(result.current.data?.data.periods[0].period).toBe("2022-02");
            expect(
                result.current.data?.data.periods[0].new_confirmations
            ).toBe(10);
            expect(
                result.current.data?.data.periods[0].birds_affected
            ).toBe(1154298);
        });
    });

    test("should throw a Failed to fetch sites timeline error when fetch fails", async () => {
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
            .get("/data/sites/timeline?granularity=month")
            .reply(500, {
                code: 500,
                message: "Server ERROR 500",
            });

        const { result } = renderHook(
            () => useSitesTimeline("http://flockwatch.io", "month"),
            { wrapper }
        );

        await vi.waitFor(() => {
            expect(result.current.isError).toEqual(true);
            expect(result.current.error?.message).toBe(
                "Failed to fetch sites timeline"
            );
        });
    });
});
