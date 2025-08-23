import SelectedStateMap from "../SelectedState/SelectedState";
import InfoTiles from "../InfoTiles/InfoTiles";
import formatDateForUser from "../../Utils/dateFormatter";

interface IStateInfo {
    backyardFlocks: string;
    birdsAffected: string;
    commercialFlocks: number;
    lastReportedDate: string;
    latitude: number;
    longitude: number;
    state: string;
    stateAbbreviation: string;
    totalFlocks: number;
    color: string;
}

interface IStateTiles {
    backyardFlocks: string;
    birdsAffected: string;
    commercialFlocks: number;
    totalFlocks: number;
}

interface Props {
    stateInfo: IStateInfo;
}

function formatNumberToLocale(value: number) {
    return value.toLocaleString();
}

function createInfoTiles(stateInfo: IStateInfo) {
    const titleMap: Record<keyof IStateTiles, string[]> = {
        backyardFlocks: [
            "Backyard Flocks Affected",
            "backyard-flocks",
            "/backyard-flocks2.png",
            "rgba(2, 163, 56, 1)",
        ],
        birdsAffected: [
            "Birds Affected",
            "birds-affected",
            "/birds-affected.png",
            "#ef8700ff",
        ],
        commercialFlocks: [
            "Commercial Flocks Affected",
            "commercial-flocks",
            "/commercial-flocks.png",
            "rgba(131, 0, 239, 1)",
        ],
        totalFlocks: [
            "Total Flocks Affected",
            "total-flocks",
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
        stateInfo.lastReportedDate
    );
    return (
        <>
            <section className="description">
                <h1 className="state-title">
                    {stateInfo.state} ({stateInfo.stateAbbreviation})
                </h1>
                <h2>Outbreak Information</h2>
                <p>Last case reported on {lastUpdatedDateFormatted}</p>
            </section>

            <section className="state-info-container">
                <section className="state-outline">
                    <SelectedStateMap
                        stateAbbreviation={stateInfo.stateAbbreviation}
                        stateName={stateInfo.state}
                        stateColor={stateInfo.color}
                    />
                </section>
                <section className="home-info">{stateInfoTiles}</section>
            </section>
        </>
    );
}
