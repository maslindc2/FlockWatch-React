import { useQuery, type UseQueryResult } from "@tanstack/react-query";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

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

async function fetchProductionTypeSummary(
    url: string
): Promise<ProductionTypeSummaryResponse> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch production type summary");
    return res.json();
}

/* v8 ignore start -- @preserve*/
async function fetchProductionTypeSummaryLocal(): Promise<ProductionTypeSummaryResponse> {
    const data = await import("../../data/production-type-summary.json");
    return data;
}
/* v8 ignore stop -- @preserve*/

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
