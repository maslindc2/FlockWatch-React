import * as d3 from "d3";
import { useEffect, useRef, type FC } from "react";
import { ProductionTypeSummary } from "../../Hooks/useProductionTypeSummary";
import { useTheme } from "../../theme/theme";

/** Props for the ProductionTypeBarChart component. */
interface Props {
    data: ProductionTypeSummary[];
}

const TOP_N = 10;
const CHART_WIDTH = 800;
const CHART_HEIGHT = 460;
const MARGIN = { top: 60, right: 140, bottom: 50, left: 320 };
const BAR_HEIGHT = 30;
const BAR_GAP = 6;

/**
 * Horizontal bar chart showing the top 10 production types by birds affected.
 */
const ProductionTypeBarChart: FC<Props> = ({ data }) => {
    const { theme, chartColors } = useTheme();
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        const sorted = [...data]
            .sort(
                (a, b) =>
                    b.total_birds_affected - a.total_birds_affected
            )
            .slice(0, TOP_N);

        const maxAffected = sorted[0]?.total_birds_affected ?? 1;

        const svg = d3
            .select(svgRef.current)
            .attr("viewBox", `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%");

        svg.selectAll("*").remove();

        const barWidthScale = d3
            .scaleLinear()
            .domain([0, maxAffected])
            .range([0, CHART_WIDTH - MARGIN.left - MARGIN.right]);

        const colorScale = d3
            .scaleLinear<string>()
            .domain([0, maxAffected])
            .range(chartColors.prodBarColorRange);

        const chartGroup = svg
            .append("g")
            .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

        const chartWidth = CHART_WIDTH - MARGIN.left - MARGIN.right;

        sorted.forEach((d, i) => {
            const y = i * (BAR_HEIGHT + BAR_GAP);
            const barWidth = barWidthScale(d.total_birds_affected);

            chartGroup
                .append("rect")
                .attr("x", 0)
                .attr("y", y)
                .attr("width", chartWidth)
                .attr("height", BAR_HEIGHT)
                .attr("fill", chartColors.prodBarBg)
                .attr("rx", 3)
                .attr("ry", 3);

            chartGroup
                .append("rect")
                .attr("x", 0)
                .attr("y", y)
                .attr("width", barWidth)
                .attr("height", BAR_HEIGHT)
                .attr("fill", colorScale(d.total_birds_affected))
                .attr("rx", 3)
                .attr("ry", 3);

            chartGroup
                .append("text")
                .attr("x", -8)
                .attr("y", y + BAR_HEIGHT / 2)
                .attr("text-anchor", "end")
                .attr("alignment-baseline", "central")
                .attr("font-size", "12px")
                .attr("font-weight", "600")
                .attr("fill", chartColors.prodBarTextColor)
                .text(d.production_type);

            chartGroup
                .append("text")
                .attr("x", chartWidth + 8)
                .attr("y", y + BAR_HEIGHT / 2)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "central")
                .attr("font-size", "13px")
                .attr("fill", chartColors.prodBarTextColor)
                .text(d.total_birds_affected.toLocaleString());
        });

        svg
            .append("text")
            .attr("x", CHART_WIDTH / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .attr("font-weight", "600")
            .attr("fill", chartColors.prodBarTitleColor)
            .text("Birds Affected by Production Type");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, theme]);

    const sorted = [...data]
        .sort((a, b) => b.total_birds_affected - a.total_birds_affected)
        .slice(0, TOP_N);
    const chartLabel = `Bar chart showing top 10 production types by birds affected. ${sorted.map((d) => `${d.production_type}: ${d.total_birds_affected.toLocaleString()} birds`).join(". ")}.`;

    return (
        <div className="bar-chart-container">
            <svg ref={svgRef} role="img" aria-label={chartLabel}></svg>
        </div>
    );
};

export default ProductionTypeBarChart;
