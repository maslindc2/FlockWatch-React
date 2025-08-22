import InfoTiles from "./InfoTiles";

interface IUSTileData {
    totalBackyardFlocksNationwide: number;
    totalBirdsAffectedNationwide: number;
    totalCommercialFlocksNationwide: number;
    totalFlocksAffectedNationwide: number;
    totalStatesAffected: number;
}

export default function createHomeInfoTiles(tileData: IUSTileData) {
    const titleMap: Record<keyof IUSTileData, string[]> = {
        totalBackyardFlocksNationwide: [
            "Backyard Flocks Affected",
            "backyard-flocks",
            "/backyard-flocks2.png",
            "rgba(2, 163, 56, 1)",
        ],
        totalBirdsAffectedNationwide: [
            "Birds Affected",
            "birds-affected",
            "/birds-affected.png",
            "#ef8700ff",
        ],
        totalCommercialFlocksNationwide: [
            "Commercial Flocks Affected",
            "commercial-flocks",
            "/commercial-flocks.png",
            "rgba(131, 0, 239, 1)",
        ],
        totalFlocksAffectedNationwide: [
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
            if (!title) {
                console.error(`Unexpected key in tileData: ${key}`);
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
