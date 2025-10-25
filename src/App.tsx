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
    console.log(usSummaryAllTimeTotals)
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
            setSelectedState(result);
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
                    <section className="stats-section">
                        <div className="toggle-container">
                            <button
                            className={selectedStat === "30days" ? "toggle-btn active" : "toggle-btn"}
                            onClick={() => setSelectedStat("30days")}
                            aria-label="Avian Influenza statistics for the last thirty days in the united states"
                            >
                                Last 30 Days
                            </button>

                            <button
                                className={selectedStat === "allTime" ? "toggle-btn active" : "toggle-btn"}
                                onClick={() => setSelectedStat("allTime")}
                                aria-label="Avian Influenza statistics for all time in the united states"
                            >
                                All Time Totals
                            </button>
                        </div>
                        <section className="info-tiles">{selectedStat === "30days" ? last30Days : usInfoTiles}</section>
                    </section>
                    <section>
                        <h3>Select a state on the map or from the dropdown to see its latest stats.</h3>
                        
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
