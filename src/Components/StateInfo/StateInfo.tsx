import SelectedStateMap from "../SelectedState/SelectedState";

import InfoTiles from "../InfoTiles/InfoTiles";
import { stateAbbreviationToFips } from "../ChoroplethMap/utils/state-abbreviation-fips-processing";

interface IStateInfo {
    backyardFlocks: string;
    birdsAffected: string;
    commercialFlocks: number;
    lastReportDate: Date;
    latitude: number;
    longitude: number;
    state: string;
    stateAbbreviation: string;
    totalFlocks: number;
}

interface IStateTiles {
    backyardFlocks: string;
    birdsAffected: string;
    commercialFlocks: number;
    totalFlocks: number;
}

function formatNumberToLocale(value: Number) {
    return value.toLocaleString();
}

function createInfoTiles(stateInfo: IStateInfo) {
    const titleMap: Record<keyof IStateTiles, string[]> = {
        backyardFlocks: [
            "Backyard Flocks Affected",
            "/backyard-flocks2.png",
            "rgba(2, 163, 56, 1)",
        ],
        birdsAffected: ["Birds Affected", "/birds-affected.png", "#ef8700ff"],
        commercialFlocks: [
            "Commercial Flocks Affected",
            "/commercial-flocks.png",
            "rgba(131, 0, 239, 1)",
        ],
        totalFlocks: [
            "Total Flocks Affected",
            "/flocks-affected.webp",
            "rgba(255, 97, 131, 1)",
        ],
    };

    const infoTilesArr = Object.entries(stateInfo)
        .map(([key, value], index) => {
            const title = titleMap[key as keyof IStateTiles];
            if (!title) {
                return null;
            }
            return (
                <InfoTiles
                    key={index}
                    title={title[0]}
                    amount={formatNumberToLocale(value)}
                    icon={title[1]}
                    bgColor={title[2]}
                />
            );
        })
        .filter(Boolean);
    return infoTilesArr;
}

// <section className="home-info">{usInfoTiles}</section>
export default function StateInfo({ stateInfo }) {
    console.log(stateInfo);
    const stateInfoTiles = createInfoTiles(stateInfo);
    const fipsCodeForState =
        stateAbbreviationToFips[stateInfo.stateAbbreviation];
    return (
        <>
            <section className="description">
                <h2 className="state-title">
                    Hello {stateInfo.state} ({stateInfo.stateAbbreviation})
                </h2>
                <p>
                    Stay informed about avian influenza cases in{" "}
                    {stateInfo.state}. See how many birds and flocks have been
                    affected, including both commercial and backyard operations.
                    Check the latest report date and total number of outbreaks
                    to stay up to date.
                </p>
                <p>Last updated on {stateInfo.lastReportedDate}</p>
            </section>
            <section>
                <section className="state-outline">
                    <SelectedStateMap
                        fipsCode={fipsCodeForState}
                        stateColor={stateInfo.color}
                    />
                </section>
                <section className="home-info">{stateInfoTiles}</section>
            </section>
        </>
    );
}
