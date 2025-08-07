import { useQuery } from "@tanstack/react-query";

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

async function fetchUsSummary(): Promise<IUsSummaryResponse> {
    // TODO: Switch this to a URL
    const res = await fetch("http://localhost:3000/data/us-summary");
    if (!res.ok) throw new Error("Failed to fetch US summary");
    return res.json();
}

export function useUsSummaryData() {
    return useQuery({
        queryKey: ["usSummaryData"],
        queryFn: fetchUsSummary,
    });
}
