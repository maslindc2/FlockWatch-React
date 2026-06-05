import { useQuery } from "@tanstack/react-query";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

type SiteRecord = {
    special_id: string;
    birds_affected: number;
    confirmed_diagnosis_date: string;
    county: string;
    production_type: string;
    state: string;
    status: string;
};

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

async function fetchSites(url: string): Promise<SitesResponse> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch sites");
    return res.json();
}

/* v8 ignore start -- @preserve*/
async function fetchSitesLocal() {
    const data = await import("../../data/sites-page.json");
    return data;
}
/* v8 ignore stop -- @preserve*/

export function useSitesData(flockWatchServerURL: string) {
    const url = `${flockWatchServerURL}/data/sites?page=1&limit=10`;
    return useQuery({
        queryKey: ["sitesData"],
        staleTime: 15 * 60 * 1000,
        queryFn: () => (useLocal ? fetchSitesLocal() : fetchSites(url)),
    });
}
