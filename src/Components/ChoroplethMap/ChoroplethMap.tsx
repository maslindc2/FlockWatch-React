import * as d3 from "d3";
import * as topojson from "topojson-client";

import { useEffect, useRef, type FC } from "react";
import type {
    Feature,
    FeatureCollection,
    Geometry,
    GeoJsonProperties,
} from "geojson";
import type { Topology } from "topojson-specification";
import { FlockRecord } from "../../Hooks/useFlockCases";
import { useTheme } from "../../theme/theme";

import {
    stateAbbreviationToFips,
    fipsToStateAbbreviation,
} from "../../Utils/state-abbreviation-fips-processing";

/** Props for the ChoroplethMap component. */
interface Props {
    data: FlockRecord[];
    stateTrigger: (abbreviation: string) => void;
    selectedAbbreviation?: string | null;
    activeAbbreviations: Set<string>;
}

/** A US state feature with an optional string id. */
type StateFeature = Feature<Geometry, { [key: string]: unknown }> & {
    id?: string | number;
};

const labelOffsets: Record<string, [number, number]> = {
    "21": [0, 4],
    "15": [-20, 5],
    "34": [35, 15],
    "22": [-9, 3],
    "26": [13, 23],
    "06": [-9, 0],
    "09": [25, 25],
    "10": [80, 20],
    "12": [14, 3],
    "24": [60, 35],
    "25": [60, -5],
    "33": [-15, -60],
    "44": [40, 25],
    "50": [-30, -40],
};

const excludedStates = new Set(["21", "15", "22", "26", "12", "06"]);

let cachedTopo: Topology | null = null;

/**
 * US choropleth map colored by birds affected per state.
 * Clicking a state triggers the `stateTrigger` callback.
 */
const ChoroplethMap: FC<Props> = ({
    data,
    stateTrigger,
    selectedAbbreviation,
    activeAbbreviations,
}) => {
    const { chartColors } = useTheme();
    const svgRef = useRef<SVGSVGElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Runs on every render to display the Choropleth Map
    useEffect(() => {
        const width = 980;
        const height = 780;
        const svg = d3
            .select(svgRef.current)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%");

        svg.selectAll("*").remove();

        const loadMap = async () => {
            if (!cachedTopo) {
                cachedTopo = (await d3.json(
                    "/states-10m.json"
                )) as unknown as Topology;
            }
            const us = cachedTopo;

            const statesCollection = topojson.feature(
                us,
                us.objects.states
            ) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
            const states: Feature<Geometry, GeoJsonProperties>[] =
                statesCollection.features;

            const birdsAffectedMap = new Map<string, number>();
            const stateDataMap = new Map<string, FlockRecord>();
            data.forEach((d) => {
                const fips = stateAbbreviationToFips[d.state_abbreviation];
                if (fips) {
                    birdsAffectedMap.set(fips, d.birds_affected);
                    stateDataMap.set(d.state_abbreviation, d);
                }
            });

            const projection = d3
                .geoAlbersUsa()
                .scale(1300)
                .translate([width / 2, height / 2]);

            const path = d3.geoPath().projection(projection);

            const maxAffected = d3.max(data, (d) => d.birds_affected) ?? 1;

            const color = (value: number) => {
                if (value <= 0) return chartColors.choroplethColorRange[0];
                const t = Math.log(value) / Math.log(maxAffected);
                const colors = chartColors.choroplethColorRange;
                const pos = Math.min(
                    t * (colors.length - 1),
                    colors.length - 1
                );
                const i = Math.floor(pos);
                const frac = pos - i;
                if (i >= colors.length - 1) return colors[colors.length - 1];
                return d3.interpolateRgb(colors[i], colors[i + 1])(frac);
            };

            const legendWidth = 250;
            const legendHeight = 10;
            const legendMargin = { top: 40, right: 40, bottom: 0, left: 40 };

            const defs = svg.append("defs");
            const linearGradient = defs
                .append("linearGradient")
                .attr("id", "legend-gradient");

            linearGradient
                .selectAll("stop")
                .data(
                    chartColors.choroplethLegendRange.map((c, i, arr) => ({
                        offset: `${(i / (arr.length - 1)) * 100}%`,
                        color: c,
                    }))
                )
                .join("stop")
                .attr("offset", (d) => d.offset)
                .attr("stop-color", (d) => d.color);

            const legendSvg = svg
                .append("g")
                .attr(
                    "transform",
                    `translate(${legendMargin.left}, ${height - legendMargin.top})`
                );

            legendSvg
                .append("rect")
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("fill", "url(#legend-gradient)")
                .attr("stroke", chartColors.choroplethLegendStroke)
                .attr("stroke-width", 0.5);

            const legendScale = d3
                .scaleLog()
                .domain([1, maxAffected])
                .range([0, legendWidth]);

            const legendAxis = d3
                .axisBottom(legendScale)
                .ticks(5)
                .tickFormat(d3.format(".2s"));

            legendSvg
                .append("g")
                .attr("transform", `translate(0, ${legendHeight})`)
                .call(legendAxis)
                .selectAll("text")
                .style("font-size", "15px")
                .style("fill", chartColors.choroplethLabelColor)
                .select(".domain")
                .remove();

            legendSvg
                .append("text")
                .attr("x", legendWidth / 2)
                .attr("y", -8)
                .attr("text-anchor", "middle")
                .attr("font-size", "15px")
                .attr("fill", chartColors.choroplethLabelColor)
                .text("Birds Affected");

            const tooltip = d3.select(tooltipRef.current);

            function positionTooltip(event: MouseEvent) {
                const container = containerRef.current;
                if (!container) return;
                const rect = container.getBoundingClientRect();
                tooltip
                    .style("left", `${event.clientX - rect.left + 12}px`)
                    .style("top", `${event.clientY - rect.top - 10}px`);
            }

            svg.append("g")
                .selectAll("path")
                .data(states as unknown as StateFeature[])
                .join("path")
                .style("cursor", "pointer")
                .attr("tabindex", "0")
                .attr("role", "button")
                .attr("aria-label", (d: StateFeature) => {
                    const fips = d.id?.toString();
                    const abbreviation = fips
                        ? fipsToStateAbbreviation[fips]
                        : null;
                    const stateData = abbreviation
                        ? stateDataMap.get(abbreviation)
                        : null;
                    const active = abbreviation
                        ? activeAbbreviations.has(abbreviation)
                        : false;
                    return stateData
                        ? `${stateData.state}: ${stateData.birds_affected.toLocaleString()} birds affected.${active ? " Active outbreak ongoing." : ""} Click to view details.`
                        : `${abbreviation || "Unknown state"}: No data available.`;
                })
                .on("mouseover", function (event, d) {
                    d3.select(this).attr(
                        "data-original-fill",
                        d3.select(this).attr("fill")
                    );
                    d3.select(this).attr("fill", chartColors.choroplethHover);

                    const fips = d.id?.toString();
                    const abbreviation = fips
                        ? fipsToStateAbbreviation[fips]
                        : null;
                    const stateData = abbreviation
                        ? stateDataMap.get(abbreviation)
                        : null;

                    tooltip
                        .style("display", "block")
                        .html(
                            stateData
                                ? `<strong>${stateData.state}</strong><br/>${stateData.birds_affected.toLocaleString()} birds affected`
                                : `<strong>${abbreviation || "Unknown"}</strong><br/>No data`
                        );
                    positionTooltip(event);
                })
                .on("mousemove", (event) => {
                    positionTooltip(event);
                })
                .on("mouseout", function () {
                    const originalFill = d3
                        .select(this)
                        .attr("data-original-fill");
                    d3.select(this).attr("fill", originalFill);
                    tooltip.style("display", "none");
                })
                .attr("d", (d) => path(d)!)
                .attr("fill", (d: StateFeature) => {
                    const fips = d.id?.toString();
                    const value = fips ? birdsAffectedMap.get(fips) : undefined;
                    return value !== undefined
                        ? color(value)
                        : chartColors.choroplethNoData;
                })
                .on("click", (event, d: StateFeature) => {
                    const fips = d.id;
                    const abbreviation = fipsToStateAbbreviation[fips!];
                    if (abbreviation) {
                        stateTrigger(abbreviation);
                    }
                })
                .attr("stroke", (d: StateFeature) => {
                    const fips = d.id?.toString();
                    const abbreviation = fips
                        ? fipsToStateAbbreviation[fips]
                        : null;
                    if (abbreviation && activeAbbreviations.has(abbreviation))
                        return "#dc322f";
                    return abbreviation && abbreviation === selectedAbbreviation
                        ? "#ff6b35"
                        : chartColors.choroplethStroke;
                })
                .attr("stroke-width", (d: StateFeature) => {
                    const fips = d.id?.toString();
                    const abbreviation = fips
                        ? fipsToStateAbbreviation[fips]
                        : null;
                    if (abbreviation && activeAbbreviations.has(abbreviation))
                        return 3;
                    return abbreviation && abbreviation === selectedAbbreviation
                        ? 3
                        : 1;
                })
                .on("keydown", (event, d: StateFeature) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        const fips = d.id;
                        const abbreviation = fipsToStateAbbreviation[fips!];
                        if (abbreviation) {
                            stateTrigger(abbreviation);
                        }
                    }
                })
                .on("focus", function () {
                    d3.select(this)
                        .attr("stroke", "#0066cc")
                        .attr("stroke-width", 3);
                })
                .on("blur", function () {
                    const datum = d3.select(this).datum() as StateFeature;
                    const fips = datum.id?.toString();
                    const abbreviation = fips
                        ? fipsToStateAbbreviation[fips]
                        : null;
                    const isActive =
                        abbreviation && activeAbbreviations.has(abbreviation);
                    const isSelected = abbreviation === selectedAbbreviation;
                    d3.select(this)
                        .attr(
                            "stroke",
                            isActive
                                ? "#dc322f"
                                : isSelected
                                  ? "#ff6b35"
                                  : chartColors.choroplethStroke
                        )
                        .attr("stroke-width", isActive || isSelected ? 3 : 1);
                });

            svg.append("g")
                .selectAll("text")
                .data(
                    states.filter((d) => {
                        const centroid = path.centroid(d);
                        return !isNaN(centroid[0]) && !isNaN(centroid[1]);
                    })
                )
                .join("text")
                .attr("transform", (d) => {
                    const centroid = path.centroid(d);
                    const offset = d.id ? labelOffsets[d.id] : undefined;
                    return offset
                        ? `translate(${centroid[0] + offset[0]}, ${centroid[1] + offset[1]})`
                        : `translate(${centroid[0]}, ${centroid[1]})`;
                })
                .text((d) =>
                    d.id ? (fipsToStateAbbreviation[d.id] ?? "") : ""
                )
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "central")
                .attr("font-size", "20px")
                .attr("fill", chartColors.choroplethLabelColor)
                .attr("stroke", chartColors.choroplethLabelOutline)
                .attr("stroke-width", "2px")
                .attr("stroke-linejoin", "round")
                .attr("paint-order", "stroke")
                .attr("pointer-events", "none");

            svg.append("g")
                .selectAll("line")
                .data(
                    states.filter((d) => {
                        const id = d.id?.toString();
                        return (
                            id && labelOffsets[id] && !excludedStates.has(id)
                        );
                    })
                )
                .join("line")
                .attr("x1", (d) => path.centroid(d)[0])
                .attr("y1", (d) => path.centroid(d)[1])
                .attr("x2", (d) => {
                    const id = d.id!.toString();
                    return path.centroid(d)[0] + labelOffsets[id]![0];
                })
                .attr("y2", (d) => {
                    const id = d.id!.toString();
                    return path.centroid(d)[1] + labelOffsets[id]![1];
                })
                .attr("stroke", chartColors.choroplethPointerLine);

            const activeStatesGeo = states.filter((d) => {
                const abbr = d.id
                    ? fipsToStateAbbreviation[d.id.toString()]
                    : null;
                return abbr && activeAbbreviations.has(abbr);
            });

            const maxDotRadius = 7;
            svg.append("g")
                .selectAll("circle")
                .data(activeStatesGeo)
                .join("circle")
                .attr("cx", (d) => {
                    const centroid = path.centroid(d);
                    const abbr = d.id
                        ? fipsToStateAbbreviation[d.id.toString()]
                        : "";
                    const offset = abbr ? labelOffsets[abbr] : undefined;
                    return offset ? centroid[0] + offset[0] : centroid[0];
                })
                .attr("cy", (d) => {
                    const centroid = path.centroid(d);
                    const abbr = d.id
                        ? fipsToStateAbbreviation[d.id.toString()]
                        : "";
                    const offset = abbr ? labelOffsets[abbr] : undefined;
                    return offset
                        ? centroid[1] + offset[1] - 22
                        : centroid[1] - 22;
                })
                .attr("r", maxDotRadius)
                .attr("fill", "#dc322f")
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 2)
                .attr("opacity", 0.9)
                .append("title")
                .text((d) => {
                    const abbr = d.id
                        ? fipsToStateAbbreviation[d.id.toString()]
                        : "";
                    const stateData = abbr ? stateDataMap.get(abbr) : null;
                    return stateData
                        ? `${stateData.state} — active outbreak ongoing`
                        : "Active outbreak ongoing";
                });
        };

        loadMap().catch(() => {
            /* TopoJSON load error handled silently */
        });
    }, [
        data,
        stateTrigger,
        chartColors,
        selectedAbbreviation,
        activeAbbreviations,
    ]);

    const chartLabel =
        data.length > 0
            ? `Map of the United States showing total birds affected by avian influenza by state. Top affected states: ${[
                  ...data,
              ]
                  .sort((a, b) => b.birds_affected - a.birds_affected)
                  .slice(0, 3)
                  .map(
                      (d) =>
                          `${d.state}: ${d.birds_affected.toLocaleString()} birds`
                  )
                  .join(", ")}.`
            : "Map of the United States showing avian influenza data.";

    return (
        <div
            className="choropleth-container"
            ref={containerRef}
            style={{ position: "relative" }}
        >
            <div
                ref={tooltipRef}
                className="choropleth-tooltip"
                style={{
                    display: "none",
                    position: "absolute",
                    pointerEvents: "none",
                    zIndex: 10,
                }}
                role="tooltip"
            />
                        {/* eslint-disable-next-line a11y/aria-validation */}
            <svg ref={svgRef} role="group" aria-label={chartLabel} />
        </div>
    );
};

export default ChoroplethMap;
