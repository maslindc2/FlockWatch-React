import InfoTiles from "./InfoTiles";

export interface USTileData {
    total_backyard_flocks_affected: number;
    total_birds_affected: number;
    total_commercial_flocks_affected: number;
    total_flocks_affected: number;
    total_states_affected?: number;
}

export default function createInfoTiles(tileData: USTileData) {
    const titleMap: Record<keyof USTileData, string[]> = {
        total_backyard_flocks_affected: [
            "Backyard Flocks Affected",
            "backyard-flocks",
            "/backyard-flocks2.png",
            "rgba(2, 163, 56, 1)",
        ],
        total_birds_affected: [
            "Birds Affected",
            "birds-affected",
            "/birds-affected.png",
            "#ef8700ff",
        ],
        total_commercial_flocks_affected: [
            "Commercial Flocks Affected",
            "commercial-flocks",
            "/commercial-flocks.png",
            "rgba(131, 0, 239, 1)",
        ],
        total_flocks_affected: [
            "Total Flocks Affected",
            "total-flocks",
            "/flocks-affected.webp",
            "rgba(255, 97, 131, 1)",
        ],
        total_states_affected: [
            "States Affected",
            "states-affected",
            "/us-states.png",
            "hsla(192, 98%, 37%, 1.00)",
        ],
    };

    const infoTilesArr = Object.entries(tileData)
        .map(([key, value], index) => {
            const title = titleMap[key as keyof USTileData];
            if (!title || value === undefined) {
                return null;
            }
            return (
                <InfoTiles
                    key={index}
                    id={title[1]}
                    title={title[0]}
                    amount={value.toLocaleString()}
                    icon={title[2]}
                    bgColor={title[3]}
                />
            );
        })
        .filter(Boolean);

    return infoTilesArr;
}
