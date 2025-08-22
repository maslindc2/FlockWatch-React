// src/hooks/useFlockCases.ts
import { useQuery } from "@tanstack/react-query";
import { IAllFlockCases } from "../Components/ChoroplethMap/interfaces/IAllFlockCases";

const useLocal = import.meta.env.VITE_USE_LOCAL === "true";

async function fetchFlockCases(url: string): Promise<{ data: IAllFlockCases[] }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch flock cases");
  return res.json();
}

async function fetchFlockCasesLocal() {
  const data = await import("../../data/flock-data.json");
  return data.default;
}

export function useFlockCases(flockWatchServerURL: string) {
  const url = `${flockWatchServerURL}/flock-cases`
  //@ts-ignore
  return useQuery({
    queryKey: ["flockCases"],
    queryFn: () =>
      useLocal ? fetchFlockCasesLocal() : fetchFlockCases(url),
  });
}
