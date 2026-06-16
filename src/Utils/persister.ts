import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import type { QueryClient } from "@tanstack/react-query";
import { version } from "../../package.json";

export function setupPersister(queryClient: QueryClient) {
  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: "FLOCKWATCH_QC",
  });

  persistQueryClient({
    queryClient,
    persister,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    buster: version,
  });
}
