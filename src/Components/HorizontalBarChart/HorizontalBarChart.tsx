import * as d3 from "d3";
import { useEffect, useRef, useState, type FC } from "react";
import { FlockRecord } from "../../Hooks/useFlockCases";
import { useTheme } from "../../theme/theme";

/** Props for the HorizontalBarChart component. */
interface Props {
    data: FlockRecord[];
    activeStates: Set<string>;
}

const TOP_N = 10;
const CHART_WIDTH = 800;
const CHART_HEIGHT = 460;
const MARGIN = { top: 60, right: 140, bottom: 50, left: 130 };
const BAR_HEIGHT = 30;
const BAR_GAP = 6;

/**
 * Horizontal bar chart showing the top 10 states by birds affected,
 * with color coding for states that still have active sites.
 */
const HorizontalBarChart: FC<Props> = ({ data, activeStates }) => {
    const { theme, chartColors } = useTheme();
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || isVisible) return;
        if (typeof IntersectionObserver === "undefined") {
            setIsVisible(true);
            return;
        }
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
        const sorted = [...data]
            .sort((a, b) => b.birds_affected - a.birds_affected)
            .slice(0, TOP_N);

        const maxAffected = sorted[0]?.birds_affected ?? 1;

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

        const chartGroup = svg
            .append("g")
            .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

        const chartWidth = CHART_WIDTH - MARGIN.left - MARGIN.right;

        sorted.forEach((d, i) => {
            const y = i * (BAR_HEIGHT + BAR_GAP);
            const barWidth = barWidthScale(d.birds_affected);
            const isActive = activeStates.has(d.state);
            const barColor = isActive ? chartColors.barActiveColor : chartColors.barInactiveColor;

            chartGroup
                .append("rect")
                .attr("x", 0)
                .attr("y", y)
                .attr("width", chartWidth)
                .attr("height", BAR_HEIGHT)
                .attr("fill", chartColors.barBg)
                .attr("rx", 3)
                .attr("ry", 3);

            const barRect = chartGroup
                .append("rect")
                .attr("x", 0)
                .attr("y", y)
                .attr("width", isVisible ? 0 : barWidth)
                .attr("height", BAR_HEIGHT)
                .attr("fill", barColor)
                .attr("rx", 3)
                .attr("ry", 3);

            if (isVisible) {
                barRect
                    .transition()
                    .duration(600)
                    .delay(i * 80)
                    .ease(d3.easeCubicOut)
                    .attr("width", barWidth);
            }

            chartGroup
                .append("text")
                .attr("x", -8)
                .attr("y", y + BAR_HEIGHT / 2)
                .attr("text-anchor", "end")
                .attr("alignment-baseline", "central")
                .attr("font-size", "14px")
                .attr("font-weight", "600")
                .attr("fill", chartColors.barTextColor)
                .text(d.state);

            chartGroup
                .append("text")
                .attr("x", chartWidth + 8)
                .attr("y", y + BAR_HEIGHT / 2)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "central")
                .attr("font-size", "14px")
                .attr("fill", chartColors.barTextColor)
                .text(d.birds_affected.toLocaleString());
        });

        svg
            .append("text")
            .attr("x", CHART_WIDTH / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("font-size", "22px")
            .attr("font-weight", "600")
            .attr("fill", chartColors.barTitleColor)
            .text("Top 10 States by Birds Affected");

        const legendGroup = svg
            .append("g")
            .attr("transform", `translate(${MARGIN.left}, ${CHART_HEIGHT - MARGIN.bottom + 20})`);

        const legendItems = [
            { label: "Has active sites", color: chartColors.barActiveColor },
            { label: "No active sites", color: chartColors.barInactiveColor },
        ];

        legendItems.forEach((item, i) => {
            const x = i * 180;
            legendGroup
                .append("rect")
                .attr("x", x)
                .attr("y", -8)
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", item.color)
                .attr("rx", 2)
                .attr("ry", 2);

            legendGroup
                .append("text")
                .attr("x", x + 18)
                .attr("y", 2)
                .attr("text-anchor", "start")
                .attr("font-size", "12px")
                .attr("fill", chartColors.barLegendColor)
                .text(item.label);
        });
    }, [data, activeStates, theme, isVisible]);

    const sorted = [...data]
        .sort((a, b) => b.birds_affected - a.birds_affected)
        .slice(0, TOP_N);
    const chartLabel = `Bar chart showing top 10 states by birds affected. ${sorted.map((d) => `${d.state}: ${d.birds_affected.toLocaleString()} birds${activeStates.has(d.state) ? ", currently active" : ""}`).join(". ")}.`;

    return (
        <div className="bar-chart-container" ref={containerRef}>
            <svg ref={svgRef} role="img" aria-label={chartLabel}></svg>
        </div>
    );
};

export default HorizontalBarChart;
