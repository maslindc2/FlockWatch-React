import { useQuery, type UseQueryResult } from "@tanstack/react-query";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

/** Bird count and status breakdown by production type (e.g. backyard, commercial). */
export interface ProductionTypeSummary {
    production_type: string;
    total_sites: number;
    total_birds_affected: number;
    by_status: {
        active: number;
        released: number;
        na: number;
    };
}

interface ProductionTypeSummaryResponse {
    data: ProductionTypeSummary[];
    metadata: {
        last_scraped_date: string;
    };
}

/**
 * Fetch production-type summary from the server.
 * @param url - Full API URL for production-type summary data.
 */
async function fetchProductionTypeSummary(
    url: string
): Promise<ProductionTypeSummaryResponse> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch production type summary");
    return res.json();
}

/* v8 ignore start -- @preserve*/
/**
 * Load production-type summary fixture for local development.
 * Enabled by setting `VITE_USE_LOCAL=true`.
 */
async function fetchProductionTypeSummaryLocal(): Promise<ProductionTypeSummaryResponse> {
    const data = await import("../../data/production-type-summary.json");
    return data;
}
/* v8 ignore stop -- @preserve*/

/**
 * TanStack Query hook to fetch the production-type breakdown.
 * @param flockWatchServerURL - Base URL of the Flock Watch server.
 */
export function useProductionTypeSummary(
    flockWatchServerURL: string
): UseQueryResult<ProductionTypeSummaryResponse, Error> {
    const url = `${flockWatchServerURL}/data/sites/summary`;
    return useQuery<ProductionTypeSummaryResponse, Error>({
        queryKey: ["productionTypeSummary"],
        staleTime: 15 * 60 * 1000,
        queryFn: () =>
            useLocal
                ? fetchProductionTypeSummaryLocal()
                : fetchProductionTypeSummary(url),
    });
}
