import type { QueryClient } from "@tanstack/react-query";

const SEED_ENTRIES: { queryKey: readonly unknown[]; file: string }[] = [
  { queryKey: ["flockCases"], file: "flock-data.json" },
  { queryKey: ["usSummaryData"], file: "us-summary.json" },
  { queryKey: ["statusSummaryData"], file: "status-summary.json" },
  { queryKey: ["sitesData"], file: "sites-page.json" },
  { queryKey: ["activeSitesData"], file: "sites-active.json" },
  { queryKey: ["historicalSummary"], file: "historical-summary.json" },
  { queryKey: ["productionTypeSummary"], file: "production-type-summary.json" },
  { queryKey: ["sitesTimeline", "month"], file: "sites-timeline.json" },
];

export async function seedCache(queryClient: QueryClient) {
  try {
    const raw = localStorage.getItem("FLOCKWATCH_QC");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.clientState?.queries?.length > 0) return;
      } catch {
        /* ignore parse errors, fall through to seed */
      }
    }
  } catch {
    /* localStorage unavailable */
  }

  try {
    const results = await Promise.allSettled(
      SEED_ENTRIES.map(async ({ queryKey, file }) => {
        const res = await fetch(`/cached-data/${file}`);
        if (!res.ok) throw new Error(`Failed to load ${file}`);
        return { queryKey, data: await res.json() };
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        queryClient.setQueryData(result.value.queryKey, result.value.data);
      }
    }

    queryClient.invalidateQueries();
  } catch (err) {
    console.warn("Cache seed failed, will load from server:", err);
  }
}
