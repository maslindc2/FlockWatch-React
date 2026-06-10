import { useQuery, type UseQueryResult } from "@tanstack/react-query";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

/** Aggregate flock case data per US state. */
export interface FlockRecord {
    state_abbreviation: string;
    state: string;
    backyard_flocks: number;
    commercial_flocks: number;
    birds_affected: number;
    total_flocks: number;
    latitude: number;
    longitude: number;
    last_reported_detection: string;
}

interface FlockCasesResponse {
    data: FlockRecord[];
    metadata: {
        last_scraped_date: string;
    };
}

/**
 * Fetch flock case data from the Flock Watch server.
 * @param url - Full API URL for flock-case data.
 */
async function fetchFlockCases(url: string): Promise<FlockCasesResponse> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch flock cases");
    return res.json();
}

/* v8 ignore start -- @preserve*/
/**
 * Load flock-case fixture data for local development.
 * Enabled by setting `VITE_USE_LOCAL=true`. Ignored by Vitest.
 */
async function fetchFlockCasesLocal(): Promise<FlockCasesResponse> {
    const data = await import("../../data/flock-data.json");
    return data;
}
/* v8 ignore stop -- @preserve*/
/**
 * TanStack Query hook to fetch flock case data by US state.
 * @param flockWatchServerURL - Base URL of the Flock Watch server.
 */
export function useFlockCases(
    flockWatchServerURL: string
): UseQueryResult<FlockCasesResponse, Error> {
    const url = `${flockWatchServerURL}/data/flock-cases`;
    return useQuery<FlockCasesResponse, Error>({
        queryKey: ["flockCases"],
        staleTime: 15 * 60 * 1000,
        queryFn: () =>
            useLocal ? fetchFlockCasesLocal() : fetchFlockCases(url),
    });
}
