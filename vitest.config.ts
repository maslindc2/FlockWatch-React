import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            include: ["src/**"],
            exclude: [
                "src/main.tsx", 
                "src/vite-env.d.ts",
                "src/Components/ChoroplethMap/interfaces/IAllFlockCases.ts"
            ]
        },
        environment: "jsdom",
        globals: true,
    },
});
