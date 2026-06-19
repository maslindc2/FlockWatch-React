import { fetchWithCache } from "../_lib/cache.js";

export async function GET(): Promise<Response> {
    try {
        const data = await fetchWithCache("/data/sites/summary");
        return Response.json(data);
    } catch {
        return Response.json(
            { error: "Failed to fetch production type summary" },
            { status: 502 }
        );
    }
}
