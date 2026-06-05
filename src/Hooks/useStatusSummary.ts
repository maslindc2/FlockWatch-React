import { useQuery } from "@tanstack/react-query";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

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

async function fetchStatusSummary(url: string): Promise<StatusSummaryResponse> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch status summary");
    return res.json();
}

/* v8 ignore start -- @preserve*/
async function fetchStatusSummaryLocal() {
    const data = await import("../../data/status-summary.json");
    return data;
}
/* v8 ignore stop -- @preserve*/

export function useStatusSummary(flockWatchServerURL: string) {
    const url = `${flockWatchServerURL}/data/status-summary`;
    return useQuery({
        queryKey: ["statusSummaryData"],
        staleTime: 15 * 60 * 1000,
        queryFn: () =>
            useLocal ? fetchStatusSummaryLocal() : fetchStatusSummary(url),
    });
}
