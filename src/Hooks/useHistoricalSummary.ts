import { useQuery } from "@tanstack/react-query";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

/** Aggregate summary of all-time HPAI site statuses. */
type HistoricalSummaryResponse = {
    data: {
        total_active_sites: number;
        total_birds_active: number;
        total_birds_affected_all_time: number;
        total_na_sites: number;
        total_released_sites: number;
        total_sites_all_time: number;
    };
    metadata: {
        last_scraped_date: string;
    };
};

/**
 * Fetch historical summary from the server.
 * @param url - Full API URL for historical-summary data.
 */
async function fetchHistoricalSummary(
    url: string
): Promise<HistoricalSummaryResponse> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch historical summary");
    return res.json();
}

/* v8 ignore start -- @preserve*/
/**
 * Load historical-summary fixture for local development.
 * Enabled by setting `VITE_USE_LOCAL=true`.
 */
async function fetchHistoricalSummaryLocal(): Promise<HistoricalSummaryResponse> {
    const data = await import("../../data/historical-summary.json");
    return data;
}
/* v8 ignore stop -- @preserve*/

/**
 * TanStack Query hook to fetch the historical site-status summary.
 * @param flockWatchServerURL - Base URL of the Flock Watch server.
 */
export function useHistoricalSummary(flockWatchServerURL: string) {
    const url = `${flockWatchServerURL}/data/historical-summary`;
    return useQuery({
        queryKey: ["historicalSummary"],
        staleTime: 15 * 60 * 1000,
        queryFn: () =>
            useLocal
                ? fetchHistoricalSummaryLocal()
                : fetchHistoricalSummary(url),
    });
}
