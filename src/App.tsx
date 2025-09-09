import "./App.css";
import { useState } from "react";
import StateInfo from "./Components/StateInfo/StateInfo";
import ChoroplethMap from "./Components/ChoroplethMap/ChoroplethMap";
import createHomeInfoTiles from "./Components/InfoTiles/CreateHomeInfoTiles";
import { useFlockCases } from "./Hooks/useFlockCases.js";
import { useUsSummaryData } from "./Hooks/useUsSummaryData.js";
import formatDateForUser from "./Utils/dateFormatter";
import { useQueries } from "@tanstack/react-query";

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
        return "An error has occurred!";
    }
    const usSummaryData = usSummaryDataFromAPI.data;
    const lastUpdated = flockDataFromAPI.metadata.lastScrapedDate;
    const flockData = flockDataFromAPI.data;

    const usInfoTiles = createHomeInfoTiles(usSummaryData);
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
                    <section className="home-info">{usInfoTiles}</section>
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
