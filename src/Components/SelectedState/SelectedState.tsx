import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection } from "geojson";
import { stateAbbreviationToFips } from "../../Utils/state-abbreviation-fips-processing";

export interface SelectedStateMapProps {
    stateAbbreviation: string;
    stateName: string;
    stateColor: string;
}

interface USATopology extends Topology {
    objects: {
        states: GeometryCollection;
    };
}

const SelectedStateMap: React.FC<SelectedStateMapProps> = ({
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
            .style("width", "100%");

        svg.selectAll("*").remove();

        d3.json<USATopology>("/states-10m.json").then((us) => {
            if (!us?.objects?.states) return;

            const states = topojson.feature(
                us,
                us.objects.states as GeometryCollection
            ) as FeatureCollection;

            // Filter for the selected state
            const selected = states.features.find((d) => d.id === fipsCode);
            if (!selected) return;

            const projection = d3
                .geoMercator()
                .fitSize([width, height], selected);
            const path = d3.geoPath().projection(projection);

            svg.append("path")
                .datum(selected)
                .attr("d", path!)
                .attr("fill", stateColor)
                .attr("stroke", "#333")
                .attr("stroke-width", 1.5);
        });
    }, [fipsCode, stateColor, stateName]);

    return (
        <svg ref={svgRef}>
            <title>Selected State Map</title>
            <desc>Map outline of {stateName}</desc>
        </svg>
    );
};

export default SelectedStateMap;
