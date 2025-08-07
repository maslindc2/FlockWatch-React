//@ts-ignore
import { allFlockCases } from "../data/all-flocks.js";
//@ts-ignore
import { usSummary } from "../data/us-summary.js";

import "./App.css";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StateInfo from "./Components/StateInfo/StateInfo.js";
import ChoroplethMap from "./Components/ChoroplethMap/ChoroplethMap.js";
import createHomeInfoTiles from "./Components/InfoTiles/CreateHomeInfoTiles";
import { useFlockCases } from "./Hooks/useFlockCases.js";
import { useUsSummaryData } from "./Hooks/useUsSummaryData.js";

async function getUsSummaryData() {
    const res = await fetch("http://localhost:3000/data/us-summary");
    return await res.json();
}

async function getFlockCases() {
    const res = await fetch("http://localhost:3000/data/flock-cases");
    return await res.json();
}

function App() {
    //const flockData = allFlockCases.data;
    //const lastUpdated = allFlockCases.metadata.lastScrapedDate;
    //const usSummaryData = usSummary.data;

    const [selectedState, setState] = useState();

    const {
        isPending: isUsSummaryPending,
        error: usSummaryError,
        data: usSummaryDataFromAPI,
    } = useUsSummaryData();

    const {
        isPending: isFlockCasesPending,
        error: flockCasesError,
        data: flockDataFromAPI,
    } = useFlockCases();

    if (isUsSummaryPending || isFlockCasesPending) return "...Loading";
    if (usSummaryError || flockCasesError) return "An error has occurred!";

    const flockData = flockDataFromAPI.data;
    const usSummaryData = usSummaryDataFromAPI.data;
    const lastUpdated = usSummaryDataFromAPI.metadata.lastScrapedDate;

    const usInfoTiles = createHomeInfoTiles(usSummaryData);

    function findSelectedStateStats(
        stateSelected: string,
        interpolatedColor: string
    ) {
        const result = flockData.find(
            (state: { stateAbbreviation: string }) =>
                state.stateAbbreviation == stateSelected
        );
        //@ts-ignore
        result.color = interpolatedColor;
        //@ts-ignore
        setState(result);
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
                        <p>Last updated on {lastUpdated}</p>
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
                <>
                    <button onClick={closeStateInfo}>Go Back</button>
                    <StateInfo stateInfo={selectedState} />
                </>
            )}
        </main>
    );
}

export default App;
