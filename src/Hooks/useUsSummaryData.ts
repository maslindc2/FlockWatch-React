import { useQuery } from "@tanstack/react-query";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

/** US-level aggregate totals and period summaries. */
type USSummaryResponse = {
    data: {
        all_time_totals: {
            total_states_affected: number;
            total_birds_affected: number;
            total_flocks_affected: number;
            total_backyard_flocks_affected: number;
            total_commercial_flocks_affected: number;
        };
        period_summaries: {
            last_30_days: {
                total_birds_affected: number;
                total_flocks_affected: number;
                total_backyard_flocks_affected: number;
                total_commercial_flocks_affected: number;
            };
        };
    };
    metadata: {
        last_scraped_date: string;
    };
};
/**
 * Fetch the US summary from the server.
 * @param url - Full API URL for US summary data.
 */
async function fetchUsSummary(url: string): Promise<USSummaryResponse> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch US summary");
    return res.json();
}

/* v8 ignore start -- @preserve*/
/**
 * Load US-summary fixture for local development.
 * Enabled by setting `VITE_USE_LOCAL=true`. Ignored by Vitest.
 */
async function fetchUsSummaryLocal() {
    const data = await import("../../data/us-summary.json");
    return data;
}
/* v8 ignore stop -- @preserve*/
/**
 * TanStack Query hook to fetch the US-level aggregate summary.
 * @param flockWatchServerURL - Base URL of the Flock Watch server.
 */
export function useUsSummaryData(flockWatchServerURL: string) {
    const url = `${flockWatchServerURL}/data/us-summary`;
    return useQuery({
        queryKey: ["usSummaryData"],
        staleTime: 15 * 60 * 1000,
        queryFn: () => (useLocal ? fetchUsSummaryLocal() : fetchUsSummary(url)),
    });
}
