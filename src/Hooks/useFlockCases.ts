// src/hooks/useFlockCases.ts
import { useQuery } from "@tanstack/react-query";
import { IAllFlockCases } from "../Components/ChoroplethMap/interfaces/IAllFlockCases";


async function fetchFlockCases(): Promise<{ data: IAllFlockCases[] }> {
  const res = await fetch("http://localhost:3000/data/flock-cases");
  if (!res.ok) throw new Error("Failed to fetch flock cases");
  return res.json();
}

export function useFlockCases() {
  return useQuery({
    queryKey: ["flockCases"],
    queryFn: fetchFlockCases,
  });
}
