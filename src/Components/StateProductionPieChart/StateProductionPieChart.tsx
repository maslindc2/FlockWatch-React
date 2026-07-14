import * as d3 from "d3";
import { useEffect, useRef, useState, type FC } from "react";
import { useTheme } from "../../theme/theme";

interface ProductionTypeEntry {
    label: string;
    count: number;
}

interface Props {
    data: ProductionTypeEntry[];
    stateName: string;
}

const CHART_WIDTH = 360;
const CHART_HEIGHT = 260;
const PIE_RADIUS = 75;
const INNER_RADIUS = 35;

/** Donut chart showing active sites by production type for a selected state. */
const StateProductionPieChart: FC<Props> = ({ data, stateName }) => {
    const { chartColors } = useTheme();
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(
        typeof IntersectionObserver === "undefined"
    );

    useEffect(() => {
        const el = containerRef.current;
        if (!el || isVisible) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [isVisible]);

    useEffect(() => {
        if (data.length === 0) return;

        const total = data.reduce((sum, d) => sum + d.count, 0);

        const svg = d3
            .select(svgRef.current)
            .attr("viewBox", `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%");

        svg.selectAll("*").remove();

        const colorScale = d3
            .scaleOrdinal<string>()
            .domain(data.map((d) => d.label))
            .range(d3.schemeCategory10);

        const pie = d3
            .pie<ProductionTypeEntry>()
            .value((d) => d.count)
            .sort(null);

        const pieData = pie(data);

        const arc = d3
            .arc<d3.PieArcDatum<ProductionTypeEntry>>()
            .innerRadius(INNER_RADIUS)
            .outerRadius(PIE_RADIUS);

        const centerX = 105;
        const centerY = CHART_HEIGHT / 2;

        const pieGroup = svg
            .append("g")
            .attr("transform", `translate(${centerX}, ${centerY})`);

        const pathSelection = pieGroup
            .selectAll("path")
            .data(pieData)
            .join("path")
            .attr("fill", (d) => colorScale(d.data.label))
            .attr("stroke", chartColors.pieStroke)
            .attr("stroke-width", 2);

        if (isVisible) {
            pathSelection
                .attr("d", (d) => {
                    const collapsed = { ...d, endAngle: d.startAngle };
                    return arc(collapsed) || "";
                })
                .transition()
                .duration(600)
                .delay((_, i) => i * 80)
                .ease(d3.easeCubicOut)
                .attrTween("d", (d) => {
                    const interpolate = d3.interpolate(
                        { ...d, endAngle: d.startAngle },
                        d
                    );
                    return (t: number) => arc(interpolate(t)) || "";
                });
        } else {
            pathSelection.attr("d", arc);
        }

        svg.append("text")
            .attr("x", centerX)
            .attr("y", centerY)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .attr("font-size", "18px")
            .attr("font-weight", "700")
            .attr("fill", chartColors.pieTextColor)
            .text(total.toLocaleString());

        const labelX = centerX + PIE_RADIUS + 20;
        const labelStartY = centerY - (data.length - 1) * 12;
        const labelGap = 24;

        data.forEach((d, i) => {
            const y = labelStartY + i * labelGap;
            const pct = ((d.count / total) * 100).toFixed(1);

            svg.append("rect")
                .attr("x", labelX)
                .attr("y", y - 7)
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", colorScale(d.label))
                .attr("rx", 3)
                .attr("ry", 3);

            svg.append("text")
                .attr("x", labelX + 18)
                .attr("y", y + 1)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "central")
                .attr("font-size", "12px")
                .attr("fill", chartColors.pieTextColor)
                .text(`${d.label} - ${d.count} (${pct}%)`);
        });
    }, [data, chartColors, isVisible]);

    const total = data.reduce((sum, d) => sum + d.count, 0);
    const chartLabel =
        data.length > 0
            ? `Donut chart showing active sites by production type in ${stateName}. ${data.map((d) => `${d.label}: ${d.count} sites (${((d.count / total) * 100).toFixed(1)}%)`).join(". ")}. Total: ${total} active sites.`
            : `Donut chart showing active sites by production type in ${stateName}. No data available.`;

    return (
        <div className="state-production-pie-wrapper" ref={containerRef}>
                        {/* eslint-disable-next-line a11y/aria-validation */}
            <svg ref={svgRef} role="img" aria-label={chartLabel}></svg>
        </div>
    );
};

export default StateProductionPieChart;
