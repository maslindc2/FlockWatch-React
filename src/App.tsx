import "./App.css";
import { useEffect, useState } from "react";
import StateInfo from "./Components/StateInfo/StateInfo";
import ChoroplethMap from "./Components/ChoroplethMap/ChoroplethMap";
import createInfoTiles from "./Components/InfoTiles/CreateInfoTiles";
import { FlockRecord, useFlockCases } from "./Hooks/useFlockCases.js";
import { useUsSummaryData } from "./Hooks/useUsSummaryData.js";
import formatDateForUser from "./Utils/dateFormatter";
import ErrorComponent from "./Components/TanStackPages/ErrorComponent";
import * as d3 from "d3";
import StateDropdown from "./Components/StateDropdown/StateDropdown";
import { useBackToClose } from "./Hooks/useBackToClose";

interface StateInformation extends FlockRecord {
    color: string;
}

const flockWatchServerURL =
    import.meta.env.VITE_FLOCKWATCH_SERVER || "http://localhost:3000/data";

function App() {
    // Used for displaying specific states statistics
    const [selectedState, setSelectedState] = useState<StateInformation | null>(
        null
    );

    // Used for toggling between the two stat modes "Last 30 Days" and "All Time Totals"
    // Default is Last 30 Days
    const [selectedStat, setSelectedStat] = useState("30days");

    // Handle back and forward interactions on mobile
    useBackToClose(Boolean(selectedState), closeStateInfo);

    useEffect(() => {
        if (selectedState) {
            document.body.classList.add("state-window-open");
        } else {
            document.body.classList.remove("state-window-open");
        }
        return () => document.body.classList.remove("state-window-open");
    }, [selectedState]);

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
    const usSummaryAllTimeTotals = usSummaryDataFromAPI.data.all_time_totals;

    // Store the period summaries for the US
    const usPeriodSummaries = usSummaryDataFromAPI.data.period_summaries;
    // Store the last update date
    const lastUpdated = flockDataFromAPI.metadata.last_scraped_date;
    // Store the flock data
    const flockData = flockDataFromAPI.data;
    // Create info tiles using the us summary all time totals
    const usInfoTiles = createInfoTiles(usSummaryAllTimeTotals);
    // Create info tiles using the last 30 days data
    const last30Days = createInfoTiles(usPeriodSummaries.last_30_days);
    // Format the last updated date
    const lastUpdatedDateFormatted = formatDateForUser(lastUpdated);

    function findSelectedStateColor(birdsAffectedInState: number): string {
        // For determining the color needed for the State Info component we need to first determine the color of the state
        // that is found on the Choropleth Map
        const maxNumBirdsAffected =
            d3.max(flockData, (state) => state.birds_affected) ?? 1;
        const color = d3
            .scaleLinear<string>()
            .domain([0, maxNumBirdsAffected / 8, maxNumBirdsAffected])
            .range(["#d0ffc6ff", "#94d190ff", "#006400"]);
        return color(birdsAffectedInState);
    }

    function findSetSelectedState(stateSelected: string): void {
        const result = flockData.find(
            (state: { state_abbreviation: string }) =>
                state.state_abbreviation === stateSelected
        );
        if (!result) return;
        const interpolatedColor = findSelectedStateColor(result.birds_affected);
        setSelectedState({ ...result, color: interpolatedColor });
    }

    function closeStateInfo(): void {
        setSelectedState(null);
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
                                className={
                                    selectedStat === "30days"
                                        ? "toggle-btn active"
                                        : "toggle-btn"
                                }
                                onClick={() => setSelectedStat("30days")}
                                aria-label="Avian Influenza statistics for the last thirty days in the united states"
                            >
                                Last 30 Days
                            </button>

                            <button
                                className={
                                    selectedStat === "allTime"
                                        ? "toggle-btn active"
                                        : "toggle-btn"
                                }
                                onClick={() => setSelectedStat("allTime")}
                                aria-label="Avian Influenza statistics for all time in the united states"
                            >
                                All Time Totals
                            </button>
                        </div>
                        <section className="info-tiles">
                            {selectedStat === "30days"
                                ? last30Days
                                : usInfoTiles}
                        </section>
                    </section>
                    <section className="state-dropdown">
                        <StateDropdown onSelect={findSetSelectedState} />
                    </section>
                    <section className="choropleth-map">
                        <ChoroplethMap
                            data={flockData}
                            stateTrigger={findSetSelectedState}
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
