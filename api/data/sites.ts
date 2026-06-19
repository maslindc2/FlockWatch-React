import { fetchWithCache } from "../_lib/cache.js";

export async function GET(request: Request): Promise<Response> {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";
        const limit = searchParams.get("limit") || "10";
        const endpoint = `/data/sites?page=${page}&limit=${limit}`;
        const data = await fetchWithCache(endpoint);
        return Response.json(data);
    } catch {
        return Response.json(
            { error: "Failed to fetch sites" },
            { status: 502 }
        );
    }
}
