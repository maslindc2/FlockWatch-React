import { keepPreviousData, useQuery } from "@tanstack/react-query";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

/** A single time-bucketed period in the outbreak timeline. */
export type TimelinePeriod = {
    period: string;
    new_confirmations: number;
    birds_affected: number;
    cumulative_birds_affected: number;
};

/** Timeline response from the server. */
export type SitesTimelineResponse = {
    data: {
        granularity: string;
        periods: TimelinePeriod[];
    };
    metadata: {
        last_scraped_date: string;
    };
};

/**
 * Fetch the outbreak timeline from the server.
 * @param url - Full API URL for sites timeline data.
 */
async function fetchSitesTimeline(url: string): Promise<SitesTimelineResponse> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch sites timeline");
    return res.json();
}

/* v8 ignore start -- @preserve*/
/**
 * Load sites-timeline fixture for local development.
 * Enabled by setting `VITE_USE_LOCAL=true`.
 */
async function fetchSitesTimelineLocal(): Promise<SitesTimelineResponse> {
    const data = await import("../../data/sites-timeline.json");
    return data;
}
/* v8 ignore stop -- @preserve*/

/**
 * TanStack Query hook to fetch the outbreak timeline at a given granularity.
 * @param flockWatchServerURL - Base URL of the Flock Watch server.
 * @param granularity - Time bucket size: week, month, or year.
 */
export function useSitesTimeline(
    flockWatchServerURL: string,
    granularity: "week" | "month" | "year"
) {
    const url = `${flockWatchServerURL}/data/sites/timeline?granularity=${granularity}`;
    return useQuery({
        queryKey: ["sitesTimeline", granularity],
        staleTime: 15 * 60 * 1000,
        placeholderData: keepPreviousData,
        queryFn: () =>
            useLocal ? fetchSitesTimelineLocal() : fetchSitesTimeline(url),
    });
}
