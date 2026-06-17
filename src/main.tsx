import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/query-persist-client-core";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ThemeProvider } from "./theme/ThemeProvider";
import App from "./App";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 24 * 60 * 60 * 1000,
        },
    },
});

/** Persist query cache to localStorage so data survives page reloads. */
const localStoragePersister = createSyncStoragePersister({
    storage: window.localStorage,
    deserialize: (data: string) => {
        try {
            return JSON.parse(data);
        } catch {
            return undefined;
        }
    },
});

persistQueryClient({
    queryClient,
    persister: localStoragePersister,
    maxAge: 24 * 60 * 60 * 1000,
    buster: "v1",
});

/** Application entry point. Wraps `App` with TanStack Query and theme providers. */
createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <StrictMode>
            <ThemeProvider>
                <App />
            </ThemeProvider>
        </StrictMode>
    </QueryClientProvider>
);
