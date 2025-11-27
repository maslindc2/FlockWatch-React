import SelectedStateMap from "../SelectedState/SelectedState";
import InfoTiles from "../InfoTiles/InfoTiles";
import formatDateForUser from "../../Utils/dateFormatter";
import { FlockRecord } from "../../Hooks/useFlockCases";

interface StateInfo extends FlockRecord {
    color: string;
}

type StateTiles = {
    backyard_flocks: number;
    birds_affected: number;
    commercial_flocks: number;
    total_flocks: number;
};

type Props = {
    stateInfo: StateInfo;
};

function formatNumberToLocale(value: number) {
    return value.toLocaleString();
}

function createInfoTiles(stateInfo: StateTiles) {
    const titleMap: Record<keyof StateTiles, string[]> = {
        backyard_flocks: [
            "Backyard Flocks Affected",
            "backyard-flocks",
            "/backyard-flocks2.png",
            "rgba(2, 163, 56, 1)",
        ],
        birds_affected: [
            "Birds Affected",
            "birds-affected",
            "/birds-affected.png",
            "#ef8700ff",
        ],
        commercial_flocks: [
            "Commercial Flocks Affected",
            "commercial-flocks",
            "/commercial-flocks.png",
            "rgba(131, 0, 239, 1)",
        ],
        total_flocks: [
            "Total Flocks Affected",
            "total-flocks",
            "/flocks-affected.webp",
            "rgba(255, 97, 131, 1)",
        ],
    };

    const infoTilesArr = Object.entries(stateInfo)
        .map(([key, value], index) => {
            const title = titleMap[key as keyof StateTiles];
            if (!title) {
                return null;
            }
            return (
                <InfoTiles
                    key={index}
                    id={title[1]}
                    title={title[0]}
                    amount={formatNumberToLocale(value)}
                    icon={title[2]}
                    bgColor={title[3]}
                />
            );
        })
        .filter(Boolean);
    return infoTilesArr;
}

export default function StateInfo({ stateInfo }: Props) {
    const stateInfoTiles = createInfoTiles(stateInfo);
    const lastUpdatedDateFormatted = formatDateForUser(
        stateInfo.last_reported_detection
    );
    return (
        <>
            <div
                aria-live="polite"
                aria-atomic="true"
                className="visually-hidden"
            >
                {`Showing avian influenza data for ${stateInfo.state}`}
            </div>
            <section className="description">
                <h1 className="state-title">
                    {stateInfo.state} ({stateInfo.state_abbreviation})
                </h1>
                <h2>Outbreak Information</h2>
                <p>Last case reported on {lastUpdatedDateFormatted}</p>
            </section>

            <section className="state-info-container">
                <section className="state-outline">
                    <SelectedStateMap
                        stateAbbreviation={stateInfo.state_abbreviation}
                        stateName={stateInfo.state}
                        stateColor={stateInfo.color}
                    />
                </section>
                <section className="state-info-tiles">{stateInfoTiles}</section>
            </section>
        </>
    );
}
