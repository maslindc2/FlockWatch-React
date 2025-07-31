import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import statesData from '../../../public/states-10m.json'

interface Props {
  fipsCode: string; // Example: '53' for Washington
}

const SelectedStateMap: React.FC<Props> = ({ fipsCode }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const width = 400;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', '450px');

    svg.selectAll('*').remove();

    // Get the states GeoJSON from TopoJSON
    const states = topojson.feature(
      statesData as any,
      (statesData as any).objects.states
    ).features;

    // Filter the selected state
    const selected = states.find(d => d.id === fipsCode);

    if (!selected) return;

    // Create projection and path for that single state
    const projection = d3.geoMercator().fitSize([width, height], selected);
    const path = d3.geoPath().projection(projection);

    // Draw the state shape
    svg.append('path')
      .datum(selected)
      .attr('d', path as any)
      .attr('fill', '#4caf50')
      .attr('stroke', '#333')
      .attr('stroke-width', 1.5);
    
    //svg.append('text')
    //  .attr('x', width / 2)
    //  .attr('y', height / 2)
    //  .attr('text-anchor', 'middle')
    //  .attr('alignment-baseline', 'middle')
    //  .attr('font-size', '24px')
    //  .attr('fill', '#333')
    //  .text('Your Label Here');
  }, [fipsCode]);

  return <svg ref={svgRef}></svg>;
};

export default SelectedStateMap;
