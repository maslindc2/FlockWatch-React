import "./App.css";
import ChoroplethMap from "./Components/ChoroplethMap/ChoroplethMap.js";
//@ts-ignore
import { allFlockCases } from "../data/all-flocks.js";
//@ts-ignore
import { usSummary } from "../data/us-summary.js";
import InfoTiles from "./Components/InfoTiles/InfoTiles.js";
import { useState } from "react";
import StateInfo from "./Components/StateInfo/StateInfo.js";

interface IUSTileData {
    totalBackyardFlocksNationwide: Number;
    totalBirdsAffectedNationwide: Number;
    totalCommercialFlocksNationwide: Number;
    totalFlocksAffectedNationwide: Number;
    totalStatesAffected: Number;
}

function createHomeInfoTiles(tileData: IUSTileData) {
    const titleMap: Record<keyof IUSTileData, string[]> = {
        totalBackyardFlocksNationwide: [
            "Backyard Flocks Affected",
            "backyard-flocks",
            "/backyard-flocks2.png",
            "rgba(2, 163, 56, 1)",
        ],
        totalBirdsAffectedNationwide: [
            "Birds Affected",
            "birds-affected",
            "/birds-affected.png",
            "#ef8700ff",
        ],
        totalCommercialFlocksNationwide: [
            "Commercial Flocks Affected",
            "commercial-flocks",
            "/commercial-flocks.png",
            "rgba(131, 0, 239, 1)",
        ],
        totalFlocksAffectedNationwide: [
            "Total Flocks Affected",
            "total-flocks",
            "/flocks-affected.webp",
            "rgba(255, 97, 131, 1)",
        ],
        totalStatesAffected: [
            "States Affected",
            "states-affected",
            "/us-states.png",
            "hsla(192, 98%, 37%, 1.00)",
        ],
    };

    const infoTilesArr = Object.entries(tileData)
        .map(([key, value], index) => {
            const title = titleMap[key as keyof IUSTileData];
            if (!title) {
                console.error(`Unexpected key in tileData: ${key}`);
                return null;
            }
            return (
                <InfoTiles
                    key={index}
                    id={title[1]}
                    title={title[0]}
                    amount={value.toLocaleString()}
                    icon={title[2]}
                    bgColor={title[3]}
                />
            );
        })
        .filter(Boolean);

    return infoTilesArr;
}

function App() {
    const flockData = allFlockCases.data;
    const lastUpdated = allFlockCases.metadata.lastScrapedDate;
    const usSummaryData = usSummary.data;

    const usInfoTiles = createHomeInfoTiles(usSummaryData);
    const [selectedState, setState] = useState();

    function stateStats(stateSelected: string, interpolatedColor: string) {
        const result = flockData.find(
            (state: { stateAbbreviation: string }) =>
                state.stateAbbreviation == stateSelected
        );
        result.color = interpolatedColor;
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
                            stateTrigger={stateStats}
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
