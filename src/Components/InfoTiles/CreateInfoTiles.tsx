import InfoTiles from "./InfoTiles";

export interface IUSTileData {
    totalBackyardFlocksAffected: number;
    totalBirdsAffected: number;
    totalCommercialFlocksAffected: number;
    totalFlocksAffected: number;
    totalStatesAffected?: number;
}

export default function createInfoTiles(tileData: IUSTileData) {
    const titleMap: Record<keyof IUSTileData, string[]> = {
        totalBackyardFlocksAffected: [
            "Backyard Flocks Affected",
            "backyard-flocks",
            "/backyard-flocks2.png",
            "rgba(2, 163, 56, 1)",
        ],
        totalBirdsAffected: [
            "Birds Affected",
            "birds-affected",
            "/birds-affected.png",
            "#ef8700ff",
        ],
        totalCommercialFlocksAffected: [
            "Commercial Flocks Affected",
            "commercial-flocks",
            "/commercial-flocks.png",
            "rgba(131, 0, 239, 1)",
        ],
        totalFlocksAffected: [
            "Total Flocks Affected",
            "total-flocks",
            "/flocks-affected.webp",
            "rgba(255, 97, 131, 1)",
        ],
        totalStatesAffected: [
            "States Affected",
            "states-affected",
            "/us-states.png",
            "hsla(192, 98%, 37%, 1.00)",
        ],
    };

    const infoTilesArr = Object.entries(tileData)
        .map(([key, value], index) => {
            const title = titleMap[key as keyof IUSTileData];
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
