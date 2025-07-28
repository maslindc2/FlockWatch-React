import "./App.css";
import ChoroplethMap from "./Components/ChoroplethMap/ChoroplethMap.js"
//@ts-ignore
import {allFlockCases} from "../data/all-flocks.js";
//@ts-ignore
import {usSummary} from "../data/us-summary.js";
import InfoTiles from "./Components/InfoTiles/InfoTiles.js";

function App() {
  const flockData = allFlockCases.data;
  const usSummaryData = usSummary.data;
  return (
    <main>
      <header>
        <h1>Flock Watch</h1>
      </header>
      <section className="home-info">
        <InfoTiles title={"Backyard Flocks"} amount={usSummaryData.totalBackyardFlocksNationwide}/>
        <InfoTiles title={"Birds Affected"} amount={usSummaryData.totalBirdsAffectedNationwide}/>
        <InfoTiles title={"Commercial Flocks"} amount={usSummaryData.totalCommercialFlocksNationwide}/>
        <InfoTiles title={"Flocks Affected"} amount={usSummaryData.totalFlocksAffectedNationwide}/>
        <InfoTiles title={"States Affected"} amount={usSummaryData.totalStatesAffected}/>
      </section>
      <section className="map-container">
        <ChoroplethMap data={flockData} />
      </section>
    </main>
  )
}

export default App
