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
let usSummaryURL: string;
async function fetchUsSummary(): Promise<IUsSummaryResponse> {
    const res = await fetch(usSummaryURL);
    if (!res.ok) throw new Error("Failed to fetch US summary");
    return res.json();
}

export function useUsSummaryData(flockWatchServerURL: any) {
    usSummaryURL = flockWatchServerURL + "/us-summary"
    console.log(usSummaryURL);
    return useQuery({
        queryKey: ["usSummaryData"],
        queryFn: fetchUsSummary,
    });
}
