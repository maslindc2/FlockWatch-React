import { useQuery } from "@tanstack/react-query";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

/** Recent 30-day activity summary. */
type StatusSummaryResponse = {
    data: {
        birds_affected_last_30_days: number;
        sites_confirmed_last_30_days: number;
        sites_released_last_30_days: number;
    };
    metadata: {
        last_scraped_date: string;
    };
};

/**
 * Fetch the recent-activity status summary from the server.
 * @param url - Full API URL for status summary data.
 */
async function fetchStatusSummary(url: string): Promise<StatusSummaryResponse> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch status summary");
    return res.json();
}

/* v8 ignore start -- @preserve*/
/**
 * Load status-summary fixture for local development.
 * Enabled by setting `VITE_USE_LOCAL=true`.
 */
async function fetchStatusSummaryLocal() {
    const data = await import("../../data/status-summary.json");
    return data;
}
/* v8 ignore stop -- @preserve*/

/**
 * TanStack Query hook to fetch the recent 30-day status summary.
 * @param flockWatchServerURL - Base URL of the Flock Watch server.
 */
export function useStatusSummary(flockWatchServerURL: string) {
    const url = `${flockWatchServerURL}/data/status-summary`;
    return useQuery({
        queryKey: ["statusSummaryData"],
        staleTime: 15 * 60 * 1000,
        queryFn: () =>
            useLocal ? fetchStatusSummaryLocal() : fetchStatusSummary(url),
    });
}
