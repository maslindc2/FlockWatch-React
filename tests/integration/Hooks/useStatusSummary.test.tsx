import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import nock from "nock";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStatusSummary } from "../../../src/Hooks/useStatusSummary";

describe("useStatusSummary Hook integration test", () => {
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
            .get("/data/status-summary")
            .reply(200, {
                data: {
                    birds_affected_last_30_days: 276675,
                    sites_confirmed_last_30_days: 23,
                    sites_released_last_30_days: 11,
                },
                metadata: {
                    last_scraped_date: "2025-10-20T23:32:50.348Z",
                },
            });

        const { result } = renderHook(
            () => useStatusSummary("http://flockwatch.io"),
            { wrapper }
        );

        await vi.waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data?.data.birds_affected_last_30_days).toBe(
                276675
            );
            expect(result.current.data?.data.sites_confirmed_last_30_days).toBe(
                23
            );
            expect(result.current.data?.data.sites_released_last_30_days).toBe(
                11
            );
        });
    });

    test("should throw a Failed to fetch status summary error when fetch fails", async () => {
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

        nock("http://flockwatch.io").get("/data/status-summary").reply(500, {
            code: 500,
            message: "Server ERROR 500",
        });

        const { result } = renderHook(
            () => useStatusSummary("http://flockwatch.io"),
            { wrapper }
        );

        await vi.waitFor(() => {
            expect(result.current.isError).toEqual(true);
            expect(result.current.error?.message).toBe(
                "Failed to fetch status summary"
            );
        });
    });
});
