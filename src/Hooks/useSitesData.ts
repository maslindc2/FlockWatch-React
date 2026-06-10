import { useQuery } from "@tanstack/react-query";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

/** A single HPAI site record. */
export type SiteRecord = {
    special_id: string;
    birds_affected: number;
    confirmed_diagnosis_date: string;
    county: string;
    production_type: string;
    state: string;
    status: string;
};

/** Paginated response containing site records. */
type SitesResponse = {
    data: SiteRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    metadata: {
        last_scraped_date: string;
    };
};

/**
 * Fetch paginated site records from the server.
 * @param url - Full API URL for sites data.
 */
async function fetchSites(url: string): Promise<SitesResponse> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch sites");
    return res.json();
}

/* v8 ignore start -- @preserve*/
/**
 * Load sites fixture for local development.
 * Enabled by setting `VITE_USE_LOCAL=true`.
 */
async function fetchSitesLocal() {
    const data = await import("../../data/sites-page.json");
    return data;
}
/* v8 ignore stop -- @preserve*/

/**
 * TanStack Query hook to fetch paginated site records.
 * @param flockWatchServerURL - Base URL of the Flock Watch server.
 */
export function useSitesData(flockWatchServerURL: string) {
    const url = `${flockWatchServerURL}/data/sites?page=1&limit=10`;
    return useQuery({
        queryKey: ["sitesData"],
        staleTime: 15 * 60 * 1000,
        queryFn: () => (useLocal ? fetchSitesLocal() : fetchSites(url)),
    });
}
