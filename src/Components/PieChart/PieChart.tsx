import * as d3 from "d3";
import { useEffect, useRef, type FC } from "react";
import { useTheme } from "../../theme/theme";

/** Props for the PieChart component. */
interface Props {
    backyardFlocks: number;
    commercialFlocks: number;
    timeRange: "allTime" | "last30Days";
    onToggle: (range: "allTime" | "last30Days") => void;
}

const CHART_WIDTH = 400;
const CHART_HEIGHT = 300;
const PIE_RADIUS = 85;
const INNER_RADIUS = 38;

/**
 * Donut chart comparing backyard vs commercial flocks affected,
 * with a toggle between "All Time" and "Last 30 Days".
 */
const PieChart: FC<Props> = ({
    backyardFlocks,
    commercialFlocks,
    timeRange,
    onToggle,
}) => {
    const { theme, chartColors } = useTheme();
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        const total = backyardFlocks + commercialFlocks;
        if (total === 0) return;

        const backyardPercent = ((backyardFlocks / total) * 100).toFixed(1);
        const commercialPercent = ((commercialFlocks / total) * 100).toFixed(1);

        const svg = d3
            .select(svgRef.current)
            .attr("viewBox", `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%");

        svg.selectAll("*").remove();

        const pie = d3
            .pie<{ label: string; value: number }>()
            .value((d) => d.value)
            .sort(null);

        const data = pie([
            { label: "Backyard", value: backyardFlocks },
            { label: "Commercial", value: commercialFlocks },
        ]);

        const arc = d3
            .arc<d3.PieArcDatum<{ label: string; value: number }>>()
            .innerRadius(INNER_RADIUS)
            .outerRadius(PIE_RADIUS);

        const centerX = 110;
        const centerY = CHART_HEIGHT / 2 + 6;

        const pieGroup = svg
            .append("g")
            .attr("transform", `translate(${centerX}, ${centerY})`);

        pieGroup
            .selectAll("path")
            .data(data)
            .join("path")
            .attr("d", arc)
            .attr("fill", (d) =>
                d.data.label === "Backyard"
                    ? chartColors.pieBackyard
                    : chartColors.pieCommercial
            )
            .attr("stroke", chartColors.pieStroke)
            .attr("stroke-width", 2);

        svg
            .append("text")
            .attr("x", centerX)
            .attr("y", centerY - 5)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .attr("font-size", "20px")
            .attr("font-weight", "700")
            .attr("fill", chartColors.pieTextColor)
            .text(total.toLocaleString());

        svg
            .append("text")
            .attr("x", centerX)
            .attr("y", centerY + 18)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .attr("font-size", "11px")
            .attr("fill", chartColors.pieSubtextColor)
            .text("flocks");

        const labelX = centerX + PIE_RADIUS + 28;
        const labelStartY = centerY - 22;
        const labelGap = 32;

        const legendItems = [
            {
                label: "Backyard",
                count: backyardFlocks,
                percent: backyardPercent,
                color: chartColors.pieBackyard,
            },
            {
                label: "Commercial",
                count: commercialFlocks,
                percent: commercialPercent,
                color: chartColors.pieCommercial,
            },
        ];

        legendItems.forEach((item, i) => {
            const y = labelStartY + i * labelGap;

            svg
                .append("rect")
                .attr("x", labelX)
                .attr("y", y - 8)
                .attr("width", 14)
                .attr("height", 14)
                .attr("fill", item.color)
                .attr("rx", 3)
                .attr("ry", 3);

            svg
                .append("text")
                .attr("x", labelX + 22)
                .attr("y", y + 1)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "central")
                .attr("font-size", "13px")
                .attr("fill", chartColors.pieTextColor)
                .text(
                    `${item.label} - ${item.count.toLocaleString()} (${item.percent}%)`
                );
        });

        svg
            .append("text")
            .attr("x", CHART_WIDTH / 2)
            .attr("y", 18)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "600")
            .attr("fill", chartColors.pieTextColor)
            .text("Flocks Affected");

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [backyardFlocks, commercialFlocks, theme]);

    const total = backyardFlocks + commercialFlocks;
    const chartLabel =
        total > 0
            ? `Donut chart showing flocks affected, ${timeRange === "allTime" ? "all time" : "last 30 days"}. Backyard: ${backyardFlocks.toLocaleString()} (${((backyardFlocks / total) * 100).toFixed(1)}%), Commercial: ${commercialFlocks.toLocaleString()} (${((commercialFlocks / total) * 100).toFixed(1)}%). Total: ${total.toLocaleString()} flocks.`
            : "Donut chart showing flocks affected. No data available.";

    const toggleBtnStyle = (selected: boolean): React.CSSProperties => ({
        padding: "6px 14px",
        border: `1px solid ${chartColors.pieToggleStroke}`,
        borderRadius: "4px",
        background: selected ? chartColors.pieToggleSelectedBg : chartColors.pieToggleUnselectedBg,
        color: selected ? chartColors.pieToggleSelectedText : chartColors.pieToggleUnselectedText,
        fontWeight: selected ? 600 : 400,
        fontSize: "11px",
        cursor: "pointer",
        fontFamily: "inherit",
        lineHeight: 1,
        transition: "all 0.15s ease",
    });

    return (
        <div className="pie-chart-wrapper" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                <button
                    style={toggleBtnStyle(timeRange === "allTime")}
                    onClick={() => onToggle("allTime")}
                    aria-pressed={timeRange === "allTime"}
                >
                    All Time
                </button>
                <button
                    style={toggleBtnStyle(timeRange === "last30Days")}
                    onClick={() => onToggle("last30Days")}
                    aria-pressed={timeRange === "last30Days"}
                >
                    Last 30 Days
                </button>
            </div>
            <svg ref={svgRef} role="img" aria-label={chartLabel}></svg>
        </div>
    );
};

export default PieChart;
