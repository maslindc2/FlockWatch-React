import { fetchWithCache } from "./_lib/cache.js";

export async function GET(): Promise<Response> {
    try {
        const data = await fetchWithCache("/data/status-summary");
        return Response.json(data);
    } catch {
        return Response.json(
            { error: "Failed to fetch status summary" },
            { status: 502 }
        );
    }
}
