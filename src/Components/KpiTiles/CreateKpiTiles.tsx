import KpiTiles from "./KpiTiles";

/** Data shape used to render the US overview KPI tiles. */
export interface USTileData {
    total_backyard_flocks_affected: number;
    total_birds_affected: number;
    total_commercial_flocks_affected: number;
    total_flocks_affected: number;
    total_states_affected?: number;
}

/**
 * Build an array of KpiTile elements from US-level aggregate data.
 * @param tileData - US summary numbers to display.
 * @param subtextMap - Optional map of keys to subtext strings.
 */
export default function createKpiTiles(
    tileData: USTileData,
    subtextMap?: Partial<Record<keyof USTileData, string>>
) {
    const titleMap: Record<keyof USTileData, [string, string, string]> = {
        total_backyard_flocks_affected: [
            "Backyard Flocks Affected",
            "backyard-flocks",
            "rgba(40, 150, 60, 1)",
        ],
        total_birds_affected: [
            "Birds Affected",
            "birds-affected",
            "rgba(230, 140, 30, 1)",
        ],
        total_commercial_flocks_affected: [
            "Commercial Flocks Affected",
            "commercial-flocks",
            "rgba(130, 50, 200, 1)",
        ],
        total_flocks_affected: [
            "Total Flocks Affected",
            "total-flocks",
            "hsla(210, 70%, 45%, 1.00)",
        ],
        total_states_affected: [
            "States Affected",
            "states-affected",
            "hsla(210, 70%, 45%, 1.00)",
        ],
    };

    const infoTilesArr = Object.entries(tileData)
        .map(([key, value], index) => {
            const title = titleMap[key as keyof USTileData];
            if (!title || value === undefined) {
                return null;
            }
            return (
                <KpiTiles
                    key={index}
                    id={title[1]}
                    title={title[0]}
                    amount={value.toLocaleString()}
                    bgColor={title[2]}
                    subtext={subtextMap?.[key as keyof USTileData]}
                />
            );
        })
        .filter(Boolean);

    return infoTilesArr;
}
