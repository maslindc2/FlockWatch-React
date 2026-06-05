import { useQuery } from "@tanstack/react-query";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

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

async function fetchHistoricalSummary(
    url: string
): Promise<HistoricalSummaryResponse> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch historical summary");
    return res.json();
}

/* v8 ignore start -- @preserve*/
async function fetchHistoricalSummaryLocal(): Promise<HistoricalSummaryResponse> {
    const data = await import("../../data/historical-summary.json");
    return data;
}
/* v8 ignore stop -- @preserve*/

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
