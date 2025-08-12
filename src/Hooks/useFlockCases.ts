// src/hooks/useFlockCases.ts
import { useQuery } from "@tanstack/react-query";
import { IAllFlockCases } from "../Components/ChoroplethMap/interfaces/IAllFlockCases";

let flockCasesURL: string;

async function fetchFlockCases(): Promise<{ data: IAllFlockCases[] }> {
  const res = await fetch(flockCasesURL);
  if (!res.ok) throw new Error("Failed to fetch flock cases");
  return res.json();
}

export function useFlockCases(flockWatchURL: string) {
  flockCasesURL = flockWatchURL + "/flock-cases"

  return useQuery({
    queryKey: ["flockCases"],
    queryFn: fetchFlockCases,
  });
}
