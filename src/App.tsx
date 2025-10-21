import "./App.css";
import { useState } from "react";
import StateInfo from "./Components/StateInfo/StateInfo";
import ChoroplethMap from "./Components/ChoroplethMap/ChoroplethMap";
import createInfoTiles from "./Components/InfoTiles/CreateInfoTiles";
import { useFlockCases } from "./Hooks/useFlockCases.js";
import { useUsSummaryData } from "./Hooks/useUsSummaryData.js";
import formatDateForUser from "./Utils/dateFormatter";
import ErrorComponent from "./Components/TanStackPages/ErrorComponent";

const flockWatchServerURL =
    import.meta.env.VITE_FLOCKWATCH_SERVER || "http://localhost:3000/data";

function App() {
    const [selectedState, setState] = useState();

    const {
        isPending: isUsSummaryPending,
        error: usSummaryError,
        data: usSummaryDataFromAPI,
    } = useUsSummaryData(flockWatchServerURL);

    const {
        isPending: isFlockCasesPending,
        error: flockCasesError,
        data: flockDataFromAPI,
    } = useFlockCases(flockWatchServerURL);

    if (isUsSummaryPending || isFlockCasesPending) return "...Loading";
    if (usSummaryError || flockCasesError) {
        console.log(usSummaryError);
        console.log(flockCasesError);
        return <ErrorComponent />;
    }
    const usSummaryAllTimeTotals = usSummaryDataFromAPI.data.allTimeTotals;
    const usPeriodSummaries = usSummaryDataFromAPI.data.periodSummaries;
    const lastUpdated = flockDataFromAPI.metadata.lastScrapedDate;
    const flockData = flockDataFromAPI.data;

    const usInfoTiles = createInfoTiles(usSummaryAllTimeTotals);

    const last30Days = createInfoTiles(usPeriodSummaries.last30Days);

    const lastUpdatedDateFormatted = formatDateForUser(lastUpdated);

    function findSelectedStateStats(
        stateSelected: string,
        interpolatedColor: string
    ) {
        const result = flockData.find(
            (state: { stateAbbreviation: string }) =>
                state.stateAbbreviation === stateSelected
        );
        if (result) {
            //@ts-ignore
            result.color = interpolatedColor;
            //@ts-ignore
            setState(result);
        }
    }

    function closeStateInfo() {
        setState(undefined);
    }

    return (
        <main>
            <header>
                <div className="logo-banner">
                    <h1>Flock Watch</h1>
                    <img
                        src="/game-icons_chicken.svg"
                        alt="Flock Watch Logo"
                    ></img>
                </div>
            </header>

            {!selectedState ? (
                <>
                    <section className="description">
                        <p>
                            Track avian influenza across the U.S. View current
                            stats on affected flocks, birds, and states whether
                            backyard or commercial all in one simple dashboard.
                        </p>
                        <p>Last updated on {lastUpdatedDateFormatted}</p>
                    </section>

                    <section>
                        <h1 className="info-tile-title">Last 30 Days</h1>
                        <section className="info-tiles">{last30Days}</section>
                    </section>

                    <section>
                        <h1 className="info-tile-title">All Time Totals</h1>
                        <section className="info-tiles">{usInfoTiles}</section>
                    </section>

                    <section className="choropleth-map">
                        <ChoroplethMap
                            data={flockData}
                            stateTrigger={findSelectedStateStats}
                        />
                    </section>
                </>
            ) : (
                <div className="state-window">
                    <button
                        onClick={closeStateInfo}
                        className="close-button"
                    ></button>
                    <StateInfo stateInfo={selectedState} />
                </div>
            )}
        </main>
    );
}

export default App;
