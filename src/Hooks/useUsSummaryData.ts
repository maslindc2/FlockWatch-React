import { useQuery } from "@tanstack/react-query";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

interface IUsSummaryResponse {
    data: {
        totalBackyardFlocksNationwide: number;
        totalBirdsAffectedNationwide: number;
        totalCommercialFlocksNationwide: number;
        totalFlocksAffectedNationwide: number;
        totalStatesAffected: number;
    };
    metadata: {
        lastScrapedDate: string;
    };
}

async function fetchUsSummary(url: string): Promise<IUsSummaryResponse> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch US summary");
    return res.json();
}

async function fetchUsSummaryLocal() {
  const data = await import("../../data/us-summary.json");
  return data;
}

export function useUsSummaryData(flockWatchServerURL: any) {
    const url = `${flockWatchServerURL}/us-summary`
    //@ts-ignore
    return useQuery({
        queryKey: ["usSummaryData"],
        queryFn: () =>
        useLocal ? fetchUsSummaryLocal() : fetchUsSummary(url),
    });
}
