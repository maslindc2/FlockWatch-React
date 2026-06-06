import * as d3 from "d3";
import { useEffect, useRef, type FC } from "react";

interface Props {
    backyardFlocks: number;
    commercialFlocks: number;
    timeRange: "allTime" | "last30Days";
    onToggle: (range: "allTime" | "last30Days") => void;
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 270;
const PIE_RADIUS = 68;
const COLORS = {
    backyard: "#1a5276",
    commercial: "#85c1e9",
};

const PieChart: FC<Props> = ({
    backyardFlocks,
    commercialFlocks,
    timeRange,
    onToggle,
}) => {
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
            .innerRadius(0)
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
                    ? COLORS.backyard
                    : COLORS.commercial
            )
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);

        const labelX = centerX + PIE_RADIUS + 20;
        const labelStartY = centerY - 20;
        const labelGap = 28;

        const legendItems = [
            {
                label: "Backyard",
                count: backyardFlocks,
                percent: backyardPercent,
                color: COLORS.backyard,
            },
            {
                label: "Commercial",
                count: commercialFlocks,
                percent: commercialPercent,
                color: COLORS.commercial,
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
                .attr("fill", "#333")
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
            .attr("fill", "#333")
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
                .attr("fill", isSelected ? "#333" : "#e8e8e8")
                .attr("stroke", "#ccc")
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
                .attr("fill", isSelected ? "#fff" : "#333")
                .attr("pointer-events", "none")
                .text(opt.label);
        });
    }, [backyardFlocks, commercialFlocks, timeRange, onToggle]);

    return <svg ref={svgRef}></svg>;
};

export default PieChart;
