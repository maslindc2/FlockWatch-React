import ChoroplethMap from "./Components/ChoroplethMap/ChoroplethMap.js"
//@ts-ignore
import {allFlockCases} from "../data/all-flocks.js";

function App() {
  const flockData = allFlockCases.data;
  return (
    <>
      <ChoroplethMap data={flockData}/>
    </>
  )
}

export default App
