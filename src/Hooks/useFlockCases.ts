// src/hooks/useFlockCases.ts
import { useQuery } from "@tanstack/react-query";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

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

/**
 * This is the TanStack Query hook that we use to make requests, it
 * @param flockWatchServerURL This is the base URL for Flock Watch's Node.JS server i.e. https://flockwatch.io/data/flock-cases
 * @returns This returns parsed response from our Node.JS server if successful, if in progress isProgress is returned, if the query failed isError will be returned
 */
async function fetchFlockCases(url: string): Promise<{ data: IFlockRecord[] }> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch flock cases");
    return res.json();
}

/* v8 ignore start -- @preserve*/
/**
 * This function is responsible for returning the data from our JSON files locally during development,
 * this functionality is determined by setting the env var VITE_USE_LOCAL to true
 * VITE_USE_LOCAL = false will run the fetchFlockCases function instead.
 * This function will be ignored by Vitest as it's dev only 
 * @returns A sample response that directly resembles a response from the Flock Watch Server
 */
async function fetchFlockCasesLocal() {
    const data = await import("../../data/flock-data.json");
    return data.default;
}
/* v8 ignore stop -- @preserve*/
/**
 * This is the TanStack Query hook that we use to make requests to the Flock Watch Server
 * @param flockWatchServerURL This is the base URL for Flock Watch's Node.JS server i.e. https://flockwatch.io/data/flock-cases
 * @returns This returns parsed response from our Node.JS server if successful, if in progress isProgress is returned, if the query failed isError will be returned
 */
export function useFlockCases(flockWatchServerURL: string) {
    const url = `${flockWatchServerURL}/data/flock-cases`;   
    //@ts-ignore
    return useQuery({
        queryKey: ["flockCases"],
        queryFn: () =>
            useLocal ? fetchFlockCasesLocal() : fetchFlockCases(url),
    });
}
