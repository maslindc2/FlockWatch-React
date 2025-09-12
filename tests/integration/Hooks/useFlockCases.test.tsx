import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import nock from "nock";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFlockCases } from "../../../src/Hooks/useFlockCases";

describe("useFlockCases Hook integration test", () => {
    // Set the env VITE_USE_LOCAL to false as we want to test the TanStack Query
    beforeEach(() => {
        import.meta.env.VITE_USE_LOCAL = false;
    });

    test("should return the mocked response from nock when we call useFlockCases", async () => {
        // Creating and setting the TanStack QueryClient to not retry the request if an error occurs
        // And not to cache the response
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    cacheTime: 0,
                },
            },
        });

        // Create a wrapper to house our QueryClientProvider
        const wrapper = ({ children }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );

        // Use Nock to reply with status 200 and the data when the expected route receives a GET request
        nock("http://flockwatch.io")
            .get("/data/flock-cases")
            .reply(200, {
                data: [
                    {
                        state: "Alaska",
                        backyardFlocks: 11,
                        birdsAffected: 1370,
                        commercialFlocks: 0,
                        lastReportedDate: "2024-11-26T00:00:00.000Z",
                        latitude: 23.220494732,
                        longitude: -118.42924009,
                        stateAbbreviation: "AK",
                        totalFlocks: 11,
                    },
                ],
                metadata: {
                    lastScrapedDate: "2025-08-19T01:03:32.231Z",
                },
            });

        // Call useFlockCases with our base URL
        const { result } = renderHook(
            () => useFlockCases("http://flockwatch.io"),
            { wrapper }
        );

        // Wait for the result
        await vi.waitFor(() => {
            // isSuccess should be True
            expect(result.current.isSuccess).toBe(true);
            // Should have a response data array of length 1
            expect(result.current.data?.data).toHaveLength(1);
            // The state key should be Alaska
            expect(result.current.data?.data[0].state).toBe("Alaska");
            // The backyardFlocks key should match our nock mock
            expect(result.current.data?.data[0].backyardFlocks).toBe(11);
            // The birdsAffected key should match our nock mock
            expect(result.current.data?.data[0].birdsAffected).toBe(1370);
            // The commercialFlocks key should match our nock mock
            expect(result.current.data?.data[0].commercialFlocks).toBe(0);
            // The lastReportedDate key should match our nock mock
            expect(result.current.data?.data[0].lastReportedDate).toBe(
                "2024-11-26T00:00:00.000Z"
            );
            // The latitude key should match our nock mock
            expect(result.current.data?.data[0].latitude).toBe(23.220494732);
            // The longitude key should match our nock mock
            expect(result.current.data?.data[0].longitude).toBe(-118.42924009);
            // The stateAbbreviation key should match our nock mock
            expect(result.current.data?.data[0].stateAbbreviation).toBe("AK");
            // The totalFlocks key should match our nock mock
            expect(result.current.data?.data[0].totalFlocks).toBe(11);
        });
    });
    test("should throw a failed to fetch Flock Cases error when server error is encountered", async () => {
        // Creating and setting the TanStack QueryClient to not retry the request if an error occurs
        // And not to cache the response
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    cacheTime: 0,
                },
            },
        });

        // Create a wrapper to house our QueryClientProvider
        const wrapper = ({ children }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );

        // Use Nock to reply with status 500 when the expected route gets a GET request
        nock("http://flockwatch.io").get("/data/flock-cases").reply(500, {
            code: 500,
            message: "Server ERROR 500",
        });

        // Call useFlockCases with our base URL
        const { result } = renderHook(
            () => useFlockCases("http://flockwatch.io"),
            { wrapper }
        );
        // Wait for the result
        await vi.waitFor(() => {
            // Since nock returned status 500, isError should be True
            expect(result.current.isError).toBe(true);
            // Since nock returned status 500, isSuccess should be false
            expect(result.current.isSuccess).toBe(false);
            // We should have an error message of "Failed to fetch flock cases"
            expect(result.current.error?.message).toBe(
                "Failed to fetch flock cases"
            );
        });
    });
});
