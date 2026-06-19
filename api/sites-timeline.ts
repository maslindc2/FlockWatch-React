import { fetchWithCache } from "./_lib/cache.js";

export async function GET(request: Request): Promise<Response> {
    try {
        const { searchParams } = new URL(request.url);
        const granularity = searchParams.get("granularity") || "month";
        const endpoint = `/data/sites/timeline?granularity=${granularity}`;
        const data = await fetchWithCache(endpoint);
        return Response.json(data);
    } catch {
        return Response.json(
            { error: "Failed to fetch sites timeline" },
            { status: 502 }
        );
    }
}
