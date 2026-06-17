import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import nock from "nock";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSitesData } from "../../../src/Hooks/useSitesData";

describe("useSitesData Hook integration test", () => {
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
            .get("/data/sites?page=1&limit=10")
            .reply(200, {
                data: [
                    {
                        special_id: "SITE001",
                        birds_affected: 5000,
                        confirmed_diagnosis_date: "2025-01-15T00:00:00.000Z",
                        county: "Elkhart",
                        production_type: "Commercial Table Egg Layer",
                        state: "Indiana",
                        status: "active",
                    },
                ],
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
                metadata: {
                    last_scraped_date: "2025-10-20T23:32:50.348Z",
                },
            });

        const { result } = renderHook(
            () => useSitesData("http://flockwatch.io"),
            { wrapper }
        );

        await vi.waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data?.data).toHaveLength(1);
            expect(result.current.data?.data[0].special_id).toBe("SITE001");
            expect(result.current.data?.data[0].state).toBe("Indiana");
            expect(result.current.data?.data[0].status).toBe("active");
            expect(result.current.data?.total).toBe(1);
        });
    });

    test("should throw a Failed to fetch sites error when fetch fails", async () => {
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
            .get("/data/sites?page=1&limit=10")
            .reply(500, {
                code: 500,
                message: "Server ERROR 500",
            });

        const { result } = renderHook(
            () => useSitesData("http://flockwatch.io"),
            { wrapper }
        );

        await vi.waitFor(() => {
            expect(result.current.isError).toEqual(true);
            expect(result.current.error?.message).toBe("Failed to fetch sites");
        });
    });
});
