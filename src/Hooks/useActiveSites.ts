import { useQuery } from "@tanstack/react-query";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

type ActiveSiteRecord = {
    special_id: string;
    birds_affected: number;
    confirmed_diagnosis_date: string;
    county: string;
    production_type: string;
    state: string;
    status: string;
};

type ActiveSitesResponse = {
    data: ActiveSiteRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    metadata: {
        last_scraped_date: string;
    };
};

async function fetchActiveSites(
    url: string
): Promise<ActiveSitesResponse> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch active sites");
    return res.json();
}

/* v8 ignore start -- @preserve*/
async function fetchActiveSitesLocal() {
    const data = await import("../../data/sites-active.json");
    return data;
}
/* v8 ignore stop -- @preserve*/

export function useActiveSites(flockWatchServerURL: string) {
    const url = `${flockWatchServerURL}/data/sites/status/active?page=1&limit=100`;
    return useQuery({
        queryKey: ["activeSitesData"],
        staleTime: 15 * 60 * 1000,
        queryFn: () =>
            useLocal ? fetchActiveSitesLocal() : fetchActiveSites(url),
    });
}
