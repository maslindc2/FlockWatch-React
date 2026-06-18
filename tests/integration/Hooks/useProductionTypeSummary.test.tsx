import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import nock from "nock";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useProductionTypeSummary } from "../../../src/Hooks/useProductionTypeSummary";

describe("useProductionTypeSummary Hook integration test", () => {
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
            .get("/data/sites/summary")
            .reply(200, {
                data: [
                    {
                        production_type: "Commercial Table Egg Layer",
                        total_sites: 129,
                        total_birds_affected: 142863900,
                        by_status: {
                            active: 0,
                            released: 129,
                            na: 0,
                        },
                    },
                    {
                        production_type: "Commercial Turkey Meat Bird",
                        total_sites: 476,
                        total_birds_affected: 20758200,
                        by_status: {
                            active: 0,
                            released: 474,
                            na: 2,
                        },
                    },
                ],
                metadata: {
                    last_scraped_date: "2025-10-20T23:32:50.348Z",
                },
            });

        const { result } = renderHook(
            () => useProductionTypeSummary("http://flockwatch.io"),
            { wrapper }
        );

        await vi.waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data?.data).toHaveLength(2);
            expect(result.current.data?.data[0].production_type).toBe(
                "Commercial Table Egg Layer"
            );
            expect(result.current.data?.data[0].total_birds_affected).toBe(
                142863900
            );
            expect(result.current.data?.data[1].production_type).toBe(
                "Commercial Turkey Meat Bird"
            );
        });
    });

    test("should throw a Failed to fetch production type summary error when fetch fails", async () => {
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

        nock("http://flockwatch.io").get("/data/sites/summary").reply(500, {
            code: 500,
            message: "Server ERROR 500",
        });

        const { result } = renderHook(
            () => useProductionTypeSummary("http://flockwatch.io"),
            { wrapper }
        );

        await vi.waitFor(() => {
            expect(result.current.isError).toEqual(true);
            expect(result.current.error?.message).toBe(
                "Failed to fetch production type summary"
            );
        });
    });
});
