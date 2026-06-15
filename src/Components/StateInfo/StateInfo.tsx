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
    const titleMap: Record<keyof StateTiles, [string, string, string]> = {
        backyard_flocks: [
            "Backyard Flocks Affected",
            "backyard-flocks",
            "rgba(40, 150, 60, 1)",
        ],
        birds_affected: [
            "Birds Affected",
            "birds-affected",
            "rgba(230, 140, 30, 1)",
        ],
        commercial_flocks: [
            "Commercial Flocks Affected",
            "commercial-flocks",
            "rgba(130, 50, 200, 1)",
        ],
        total_flocks: [
            "Total Flocks Affected",
            "total-flocks",
            "hsla(210, 70%, 45%, 1.00)",
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
                    bgColor={title[2]}
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
                <section className="state-info-tiles">
                    <InfoTiles
                        id="state-active-sites"
                        title="Active Sites (current)"
                        amount={stateActiveSitesCount.toLocaleString()}
                        bgColor="rgba(200, 45, 45, 1)"
                    />
                    <InfoTiles
                        id="state-birds-at-risk"
                        title="Birds at Risk (active)"
                        amount={stateBirdsAtRisk.toLocaleString()}
                        bgColor="rgba(200, 45, 45, 1)"
                    />
                    {stateInfoTiles}
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
