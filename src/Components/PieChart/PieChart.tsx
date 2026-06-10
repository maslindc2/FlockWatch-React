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

const CHART_WIDTH = 320;
const CHART_HEIGHT = 270;
const PIE_RADIUS = 68;
const INNER_RADIUS = 30;

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

        const centerX = 90;
        const centerY = CHART_HEIGHT / 2 + 10;

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
            .attr("font-size", "16px")
            .attr("font-weight", "700")
            .attr("fill", chartColors.pieTextColor)
            .text(total.toLocaleString());

        svg
            .append("text")
            .attr("x", centerX)
            .attr("y", centerY + 14)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .attr("font-size", "10px")
            .attr("fill", chartColors.pieSubtextColor)
            .text("flocks");

        const labelX = centerX + PIE_RADIUS + 20;
        const labelStartY = centerY - 20;
        const labelGap = 28;

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
                .attr("y", y - 7)
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", item.color)
                .attr("rx", 2)
                .attr("ry", 2);

            svg
                .append("text")
                .attr("x", labelX + 18)
                .attr("y", y + 1)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "central")
                .attr("font-size", "12px")
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
            .attr("font-size", "14px")
            .attr("font-weight", "600")
            .attr("fill", chartColors.pieTextColor)
            .text("Flocks Affected");

        const toggleOptions: Array<{ label: string; value: "allTime" | "last30Days" }> = [
            { label: "All Time", value: "allTime" },
            { label: "Last 30 Days", value: "last30Days" },
        ];

        const btnWidth = 85;
        const btnHeight = 24;
        const btnGap = 6;
        const totalWidth = toggleOptions.length * btnWidth + (toggleOptions.length - 1) * btnGap;
        const startX = (CHART_WIDTH - totalWidth) / 2;
        const btnY = 32;

        toggleOptions.forEach((opt, i) => {
            const x = startX + i * (btnWidth + btnGap);
            const isSelected = timeRange === opt.value;

            svg
                .append("rect")
                .attr("x", x)
                .attr("y", btnY)
                .attr("width", btnWidth)
                .attr("height", btnHeight)
                .attr("fill", isSelected ? chartColors.pieToggleSelectedBg : chartColors.pieToggleUnselectedBg)
                .attr("stroke", chartColors.pieToggleStroke)
                .attr("stroke-width", 1)
                .attr("rx", 4)
                .attr("ry", 4)
                .style("cursor", "pointer")
                .on("click", () => onToggle(opt.value));

            svg
                .append("text")
                .attr("x", x + btnWidth / 2)
                .attr("y", btnY + btnHeight / 2)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "central")
                .attr("font-size", "11px")
                .attr("font-weight", isSelected ? "600" : "400")
                .attr("fill", isSelected ? chartColors.pieToggleSelectedText : chartColors.pieToggleUnselectedText)
                .attr("pointer-events", "none")
                .text(opt.label);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [backyardFlocks, commercialFlocks, timeRange, onToggle, theme]);

    return <svg ref={svgRef}></svg>;
};

export default PieChart;
