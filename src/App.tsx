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
    // Used for displaying specific states statistics
    const [selectedState, setSelectedState] = useState();
    // Used for toggling between the two stat modes "Last 30 Days" and "All Time Totals"
    // Default is Last 30 Days
    const [selectedStat, setSelectedStat] = useState("30days");

    // Fetch data using our useUsSummaryData with the server URL
    const {
        isPending: isUsSummaryPending,
        error: usSummaryError,
        data: usSummaryDataFromAPI,
    } = useUsSummaryData(flockWatchServerURL);
    
    // Fetch data using our useFlockCases with the server URL
    const {
        isPending: isFlockCasesPending,
        error: flockCasesError,
        data: flockDataFromAPI,
    } = useFlockCases(flockWatchServerURL);

    // If we are currently loading data render the loading data component
    if (isUsSummaryPending || isFlockCasesPending) return "...Loading";
    // If we encountered an error log the error that occurred
    if (usSummaryError || flockCasesError) {
        console.log(usSummaryError);
        console.log(flockCasesError);
        return <ErrorComponent />;
    }

    // Store the all time totals
    const usSummaryAllTimeTotals = usSummaryDataFromAPI.data.allTimeTotals;
    // Store the period summaries for the US
    const usPeriodSummaries = usSummaryDataFromAPI.data.periodSummaries;
    // Store the last update date
    const lastUpdated = flockDataFromAPI.metadata.lastScrapedDate;
    // Store the flock data
    const flockData = flockDataFromAPI.data;
    // Create info tiles using the us summary all time totals
    const usInfoTiles = createInfoTiles(usSummaryAllTimeTotals);
    // Create info tiles using the last 30 days data
    const last30Days = createInfoTiles(usPeriodSummaries.last30Days);
    // Format the last updated date
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
        setSelectedState(undefined);
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
                <p>Last updated on {lastUpdatedDateFormatted}</p>
            </header>

            {!selectedState ? (
                <>  
                    <section>
                        <button
                            className={selectedStat === "30days" ? "toggle-btn active" : "toggle-btn"}
                            onClick={() => setSelectedStat("30days")}
                        >
                            Last 30 Days
                        </button>

                        <button
                            className={selectedStat === "alltime" ? "toggle-btn active" : "toggle-btn"}
                            onClick={() => setSelectedStat("alltime")}
                        >
                            All Time Totals
                        </button>
                        {selectedStat === "30days" ? (
                            <section className="info-tiles">{last30Days}</section>
                        ): (
                            <section className="info-tiles">{usInfoTiles}</section>
                        )}
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
