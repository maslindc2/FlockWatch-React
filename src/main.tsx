import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./theme/ThemeProvider";
import { setupPersister } from "./Utils/persister";
import { seedCache } from "./Utils/seedCache";
import App from "./App";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24,
        },
    },
});

setupPersister(queryClient);
seedCache(queryClient);

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
