// src/hooks/useFlockCases.ts
import { useQuery } from "@tanstack/react-query";

interface IFlockRecord {
    stateAbbreviation: string;
    state: string;
    backyardFlocks: number;
    commercialFlocks: number;
    birdsAffected: number;
    totalFlocks: number;
    latitude: number;
    longitude: number;
    lastReportedDate: string;
}

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

async function fetchFlockCases(url: string): Promise<{ data: IFlockRecord[] }> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch flock cases");
    return res.json();
}

async function fetchFlockCasesLocal() {
    const data = await import("../../data/flock-data.json");
    return data.default;
}

export function useFlockCases(flockWatchServerURL: string) {
    const url = `${flockWatchServerURL}/data/flock-cases`;
    //@ts-ignore
    return useQuery({
        queryKey: ["flockCases"],
        queryFn: () =>
            useLocal ? fetchFlockCasesLocal() : fetchFlockCases(url),
    });
}
