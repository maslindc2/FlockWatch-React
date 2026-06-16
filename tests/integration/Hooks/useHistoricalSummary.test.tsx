import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import nock from "nock";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHistoricalSummary } from "../../../src/Hooks/useHistoricalSummary";

describe("useHistoricalSummary Hook integration test", () => {
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
            .get("/data/historical-summary")
            .reply(200, {
                data: {
                    total_active_sites: 17,
                    total_birds_active: 223900,
                    total_birds_affected_all_time: 206687076,
                    total_na_sites: 639,
                    total_released_sites: 1571,
                    total_sites_all_time: 2227,
                },
                metadata: {
                    last_scraped_date: "2025-10-20T23:32:50.348Z",
                },
            });

        const { result } = renderHook(
            () => useHistoricalSummary("http://flockwatch.io"),
            { wrapper }
        );

        await vi.waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data?.data.total_active_sites).toBe(17);
            expect(result.current.data?.data.total_birds_active).toBe(223900);
            expect(
                result.current.data?.data.total_birds_affected_all_time
            ).toBe(206687076);
            expect(result.current.data?.data.total_sites_all_time).toBe(2227);
        });
    });

    test("should throw a Failed to fetch historical summary error when fetch fails", async () => {
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
            .get("/data/historical-summary")
            .reply(500, {
                code: 500,
                message: "Server ERROR 500",
            });

        const { result } = renderHook(
            () => useHistoricalSummary("http://flockwatch.io"),
            { wrapper }
        );

        await vi.waitFor(() => {
            expect(result.current.isError).toEqual(true);
            expect(result.current.error?.message).toBe(
                "Failed to fetch historical summary"
            );
        });
    });
});
