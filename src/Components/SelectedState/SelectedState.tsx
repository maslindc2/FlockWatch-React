import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { stateAbbreviationToFips } from "../ChoroplethMap/utils/state-abbreviation-fips-processing";

interface Props {
    stateAbbreviation: string;
    stateName: string;
    stateColor: string;
}

const SelectedStateMap: React.FC<Props> = ({
    stateAbbreviation,
    stateName,
    stateColor,
}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const fipsCode = stateAbbreviationToFips[stateAbbreviation];

    useEffect(() => {
        const width = 400;
        const height = 400;

        const svg = d3
            .select(svgRef.current)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("width", "100%")
            .style("height", "450px");

        svg.selectAll("*").remove();

        // Get the states GeoJSON from TopoJSON
        d3.json("/states-10m.json").then((usData) => {
            const us = usData as any;

            const states = (topojson.feature(us, us.objects.states) as any).features;


            // Filter the selected state
            const selected = states.find(
                (d: { id: string }) => d.id === fipsCode
            );

            if (!selected) return;

            // Create projection and path for that single state
            const projection = d3
                .geoMercator()
                .fitSize([width, height], selected);
            const path = d3.geoPath().projection(projection);

            // Draw the state shape
            svg.append("path")
                .datum(selected)
                .attr("d", path as any)
                .attr("fill", stateColor)
                .attr("stroke", "#333")
                .attr("stroke-width", 1.5);
        });
    }, [fipsCode]);

    return (
        <svg ref={svgRef}>
            <title>Selected State Map</title>
            <desc>Map outline of {stateName}</desc>
        </svg>
    );
};

export default SelectedStateMap;
