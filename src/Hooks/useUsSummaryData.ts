import { useQuery } from "@tanstack/react-query";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

interface IUsSummaryResponse {
    data: {
        totalBackyardFlocksNationwide: number;
        totalBirdsAffectedNationwide: number;
        totalCommercialFlocksNationwide: number;
        totalFlocksAffectedNationwide: number;
        totalStatesAffected: number;
    };
    metadata: {
        lastScrapedDate: string;
    };
}
/**
 * This is the TanStack Query hook that we use to make requests, it
 * @param url This is the full url to the Fetch US Summary path on the Flock Watch Node.js server i.e. https://flockwatch.io/data/us-summary
 * @returns This returns parsed response from our Node.JS server if successful, if in progress isProgress is returned, if the query failed isError will be returned
 */
async function fetchUsSummary(url: string): Promise<IUsSummaryResponse> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch US summary");
    return res.json();
}

/* v8 ignore start -- @preserve*/
/**
 * This function is responsible for returning the data from our JSON files locally during development,
 * this functionality is determined by setting the env var VITE_USE_LOCAL to true
 * VITE_USE_LOCAL = false will run the fetchUsSummary function instead.
 * This function will be ignored by Vitest as it's dev only 
 * @returns A sample response that directly resembles a response from the Flock Watch Server
 */
async function fetchUsSummaryLocal() {
    const data = await import("../../data/us-summary.json");
    return data;
}
/* v8 ignore stop -- @preserve*/
/**
 * This is the TanStack Query hook that we use to make requests to the Flock Watch Server
 * @param flockWatchServerURL This is the base URL for Flock Watch's Node.JS server i.e. https://flockwatch.io
 * @returns This returns parsed response from our Node.JS server if successful, if in progress isProgress is returned, if the query failed isError will be returned
 */
export function useUsSummaryData(flockWatchServerURL: any) {
    const url = `${flockWatchServerURL}/data/us-summary`;
    //@ts-ignore
    return useQuery({
        queryKey: ["usSummaryData"],
        queryFn: () => (useLocal ? fetchUsSummaryLocal() : fetchUsSummary(url)),
    });
}
