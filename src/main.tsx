import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./theme/ThemeProvider";
import App from "./App";

const queryClient = new QueryClient();

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
