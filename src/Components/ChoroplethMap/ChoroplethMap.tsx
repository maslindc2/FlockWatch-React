import * as d3 from 'd3';
import * as topojson from 'topojson-client';

import { useEffect, useRef, type FC } from 'react';
import type { Feature, Geometry } from 'geojson';
import type { IAllFlockCases } from './interfaces/IAllFlockCases';
import { stateAbbreviationToFips, fipsToAbbreviation } from './utils/state-abbreviation-fips-processing';


// Specifying we are expecting a prop containing a structure IAllFlockCases
interface Props {
  data: IAllFlockCases[];
}

// Defining the data type state feature which should use the d3 feature and a key that's of type string
type StateFeature = Feature<Geometry, { [key: string]: any }>;

const labelOffsets= {
  "09": [25, 25],   // CT
  "10": [80, 20],   // DE
  "24": [60, 20],   // MD
  "25": [60, -5],   // MA
  "33": [-15, -60], // NH
  "44": [40, 25],   // RI
  "50": [-30, -40], // VT
}

const ChoroplethMap: FC<Props> = ({data}) => {
  // Create a ref that will allow us to insert d3 states into to create our US Map
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Runs on every render to display the Choropleth Map
  useEffect(() => {
    // Specify the width and height of our view window
    const width = 960;
    const height = 600;
    // Create an SVG that will display our Choropleth Map
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "500px");
    
    // Clear previous content so it redraws cleanly if the data changes
    svg.selectAll("*").remove();
    
    // Load the TopoJSON map and convert it to GeoJSON with topojson.feature(...)
    // TODO: Download this file and store it so we don't have to make this request everytime
    d3.json("/states-10m.json").then(usData => {
      const us = usData as any;
      //@ts-ignore
      // TODO: Define the datatype here so we don't need ts-ignore
      const states = topojson.feature(us, us.objects.states).features;

      // Map the birdsAffected to the associated FIPS id's for each state
      const birdsAffectedMap = new Map<string, number>();
      data.forEach((d) => {
        const fips = stateAbbreviationToFips[d.stateAbbreviation];
        if(fips) birdsAffectedMap.set(fips, d.birdsAffected);
      });

      // Set up projection and path using geoAlbersUsa 
      const projection = d3.geoAlbersUsa().scale(1300).translate([width / 2, height / 2]);
      // Converts GeoJSON shapes into SVG d strings
      const path = d3.geoPath().projection(projection);

      // Set up color scale
      const maxAffected = d3.max(data, d => d.birdsAffected) ?? 1;
      // Here we can specify the color to use for the data 0=white, max is the darkest color we are interpolating
      // Adjusting how much to modify the scale as some states were hit harder than others and it's impossible to see that in the map
      const color = d3.scaleLinear<string>().domain([0, maxAffected / 8, maxAffected]).range(["#ffffffff", "#94d190ff", "#006400"])
      
      // Draw the state shapes and color them
      svg.append('g')
        .selectAll('path')
        .data(states as StateFeature[])
        .join('path')
        .on('mouseover', (event) => {
          // Here we are handling if the mouse hovers over a state
          // Get what state we are hovering over
          const element = d3.select(event.currentTarget);
          // Get the original color
          const originalFill = element.attr('fill');
          // Set the original fill color
          element.attr('data-original-fill', originalFill);
          // Shade the current state to our hover color
          element.attr('fill', 'hsla(0, 0%, 17%, 0.55)');
        })
        .on('mouseout', (event) => {
          // When we move our mouse off the state this will reset the current state back to it's original color
          const element = d3.select(event.currentTarget);
          // Get the original fill color
          const originalFill = element.attr('data-original-fill');
          // Reset it back to it's original color
          element.attr('fill', originalFill);
        })
        .attr('d', (d) => path(d)!)
        .attr('fill', (d: StateFeature) => {
          // Here we are filling the color of the current state based off the interpolated color from above
          // This will be white for nothing to the darkest color
          //TODO: Figure what type it's wanting here so we don't use ts-ignore
          //@ts-ignore
          const value = birdsAffectedMap.get(d.id);
          // If the value is undefined then set it to white
          return value !== undefined ? color(value) : "#eee";
        })
        .on("click", (event, d: StateFeature) => {
          // When a state is clicked we find what state was clicked and then use this to display that state's particular stats
          const fips = d.id;
          const abbreviation = fipsToAbbreviation[fips!];
          // If there was an abbreviation found then we trigger our state to display the state info component
          if(abbreviation){
            //TODO: Set this to state setter function when we build our state information 
            console.log(abbreviation);
          }
        })
        .attr('stroke', 'hsla(0, 0%, 21%, 1.00)') // This is the border line between states
        .attr('stroke-width', 1); // This is how wide the border line should be between states
      
      // We can't have a blank map so let's put some labels (Also who even remembers all 50 states)
      svg.append('g')
        .selectAll('text')
        .data(states.filter((d: d3.GeoPermissibleObjects) => {
          const centroid = path.centroid(d);
          return !isNaN(centroid[0]) && !isNaN(centroid[1])
        }))
        .data(states as StateFeature[])
        .join('text')
        .attr('transform', d => {
          const centroid = path.centroid(d);
          const offset = labelOffsets[d.id];

          if(isNaN(centroid[0]) || isNaN(centroid[1])){
            return null;
          }
          
          return offset ? `translate(${centroid[0] + offset[0]}, ${centroid[1] + offset[1]})` : `translate(${centroid[0]}, ${centroid[1]})`;
        })
        .text(d => fipsToAbbreviation[d.id as string] || '')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'central')
        .attr('font-size', '20px')
        .attr('fill', '#000')
        .attr('pointer-events', 'none');
      
      svg.append("g")
        .selectAll("line")
        .data(states.filter((d: { id: string | number; }) => labelOffsets[d.id]))
        .join("line")
        .attr("x1", d => path.centroid(d)[0])
        .attr("y1", d => path.centroid(d)[1])
        .attr("x2", d => path.centroid(d)[0] + labelOffsets[d.id][0])
        .attr("y2", d => path.centroid(d)[1] + labelOffsets[d.id][1])
        .attr("stroke", "#333");

    });
  });
  return (
    <div className='map-container'>
      <svg ref={svgRef}></svg>
    </div>
  )
}

export default ChoroplethMap;