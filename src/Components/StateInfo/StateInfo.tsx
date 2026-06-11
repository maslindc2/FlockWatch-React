import SelectedStateMap from "../SelectedState/SelectedState";
import InfoTiles from "../KpiTiles/KpiTiles";
import StateProductionPieChart from "../StateProductionPieChart/StateProductionPieChart";
import formatDateForUser from "../../Utils/dateFormatter";
import { FlockRecord } from "../../Hooks/useFlockCases";

/** Combined state info including a color for the map highlight. */
interface StateInfo extends FlockRecord {
    color: string;
}

interface ProductionTypeEntry {
    label: string;
    count: number;
}

interface CountyEntry {
    county: string;
    count: number;
    birds: number;
    types: string;
}

type StateTiles = {
    backyard_flocks: number;
    birds_affected: number;
    commercial_flocks: number;
    total_flocks: number;
};

type Props = {
    stateInfo: StateInfo;
    stateActiveSitesCount: number;
    stateBirdsAtRisk: number;
    stateProductionTypes: ProductionTypeEntry[];
    stateCountyData: CountyEntry[];
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

/** Detail panel showing state-level outbreak info, map, and KPI tiles. */
export default function StateInfo({
    stateInfo,
    stateActiveSitesCount,
    stateBirdsAtRisk,
    stateProductionTypes,
    stateCountyData,
}: Props) {
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
                <section className="state-info-tiles">
                    {stateInfoTiles}
                    <InfoTiles
                        id="state-active-sites"
                        title="Active Sites (current)"
                        amount={stateActiveSitesCount.toLocaleString()}
                        icon="/rooster.png"
                        bgColor="rgba(220, 50, 50, 1)"
                    />
                    <InfoTiles
                        id="state-birds-at-risk"
                        title="Birds at Risk (active)"
                        amount={stateBirdsAtRisk.toLocaleString()}
                        icon="/rooster.png"
                        bgColor="rgba(255, 100, 50, 1)"
                    />
                </section>
            </section>

            {stateProductionTypes.length > 0 && (
                <section className="state-production-section">
                    <h3 className="state-production-title">
                        Active Sites by Production Type
                    </h3>
                    <div className="state-production-chart">
                        <StateProductionPieChart
                            data={stateProductionTypes}
                            stateName={stateInfo.state}
                        />
                    </div>
                </section>
            )}

            {stateCountyData.length > 0 && (
                <section className="state-production-section">
                    <h3 className="state-production-title">
                        Affected Counties
                    </h3>
                    <div className="state-county-table-wrapper">
                        <table className="state-county-table">
                            <thead>
                                <tr>
                                    <th>County</th>
                                    <th>Active Sites</th>
                                    <th>Birds at Risk</th>
                                    <th>Production Types</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stateCountyData.map((row) => (
                                    <tr key={row.county}>
                                        <td>{row.county}</td>
                                        <td>{row.count.toLocaleString()}</td>
                                        <td>{row.birds.toLocaleString()}</td>
                                        <td className="county-types">{row.types}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </>
    );
}
