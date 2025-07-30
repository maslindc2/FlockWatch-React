import "./App.css";
import ChoroplethMap from "./Components/ChoroplethMap/ChoroplethMap.js"
//@ts-ignore
import {allFlockCases} from "../data/all-flocks.js";
//@ts-ignore
import {usSummary} from "../data/us-summary.js";
import InfoTiles from "./Components/InfoTiles/InfoTiles.js";

interface IUSTileData {
  "totalBackyardFlocksNationwide": Number,
  "totalBirdsAffectedNationwide": Number,
  "totalCommercialFlocksNationwide": Number,
  "totalFlocksAffectedNationwide": Number,
  "totalStatesAffected": Number
}

function formatNumberToLocale(value:Number) {
  return value.toLocaleString();
}

function createHomeInfoTiles(tileData:IUSTileData) {
  const titleMap: Record<keyof IUSTileData, string[]> = {
    totalBackyardFlocksNationwide: ["Backyard Flocks Affected", "/backyard-flocks2.png", "rgba(2, 163, 56, 1)"],
    totalBirdsAffectedNationwide: ["Birds Affected", "/birds-affected.png", "#ef8700ff"],
    totalCommercialFlocksNationwide: ["Commercial Flocks Affected", "/commercial-flocks.png", "rgba(131, 0, 239, 1)"],
    totalFlocksAffectedNationwide: ["Total Flocks Affected", "/flocks-affected.webp", "rgba(255, 97, 131, 1)"],
    totalStatesAffected: ["States Affected", "/us-states.png", "hsla(192, 98%, 37%, 1.00)"],
  };

  const infoTilesArr = Object.entries(tileData).map(([key, value], index) => {
    const title = titleMap[key as keyof IUSTileData];
    if(!title) {
      console.error(`Unexpected key in tileData: ${key}`);
      return null;
    }
    return <InfoTiles key={index} title={title[0]} amount={formatNumberToLocale(value)} icon={title[1]} bgColor={title[2]}/>
  }).filter(Boolean);
  
  return infoTilesArr
}

function App() {
  const flockData = allFlockCases.data;
  const lastUpdated = allFlockCases.metadata.lastScrapedDate;
  const usSummaryData = usSummary.data;
  const usInfoTiles = createHomeInfoTiles(usSummaryData);

  return (
    <main>
      <header>
        <h1>Flock Watch</h1>
        <p>Last updated on {lastUpdated}</p>
      </header>
      <section className="home-info">
        {usInfoTiles}
      </section>
      <section className="map-container">
        <ChoroplethMap data={flockData} />
      </section>
    </main>
  )
}

export default App
