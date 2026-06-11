import * as d3 from "d3";
import { useEffect, useRef, type FC } from "react";
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

const StateProductionPieChart: FC<Props> = ({ data, stateName }) => {
    const { theme, chartColors } = useTheme();
    const svgRef = useRef<SVGSVGElement | null>(null);

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

        pieGroup
            .selectAll("path")
            .data(pieData)
            .join("path")
            .attr("d", arc)
            .attr("fill", (d) => colorScale(d.data.label))
            .attr("stroke", chartColors.pieStroke)
            .attr("stroke-width", 2);

        svg
            .append("text")
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

            svg
                .append("rect")
                .attr("x", labelX)
                .attr("y", y - 7)
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", colorScale(d.label))
                .attr("rx", 3)
                .attr("ry", 3);

            svg
                .append("text")
                .attr("x", labelX + 18)
                .attr("y", y + 1)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "central")
                .attr("font-size", "12px")
                .attr("fill", chartColors.pieTextColor)
                .text(`${d.label} - ${d.count} (${pct}%)`);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, theme]);

    const total = data.reduce((sum, d) => sum + d.count, 0);
    const chartLabel =
        data.length > 0
            ? `Donut chart showing active sites by production type in ${stateName}. ${data.map((d) => `${d.label}: ${d.count} sites (${((d.count / total) * 100).toFixed(1)}%)`).join(". ")}. Total: ${total} active sites.`
            : `Donut chart showing active sites by production type in ${stateName}. No data available.`;

    return (
        <div className="state-production-pie-wrapper">
            <svg ref={svgRef} role="img" aria-label={chartLabel}></svg>
        </div>
    );
};

export default StateProductionPieChart;
