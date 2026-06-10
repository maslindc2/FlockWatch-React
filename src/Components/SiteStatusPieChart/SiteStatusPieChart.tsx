import * as d3 from "d3";
import { useEffect, useRef, type FC } from "react";
import { useTheme } from "../../theme/theme";

/** Props for the SiteStatusPieChart component. */
interface Props {
    activeSites: number;
    releasedSites: number;
    naSites: number;
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 220;
const PIE_RADIUS = 75;
const INNER_RADIUS = 32;

/**
 * Donut chart showing all-time site status breakdown
 * (active vs released vs N/A).
 */
const SiteStatusPieChart: FC<Props> = ({ activeSites, releasedSites, naSites }) => {
    const { theme, chartColors } = useTheme();
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        const total = activeSites + releasedSites + naSites;
        if (total === 0) return;

        const activePercent = ((activeSites / total) * 100).toFixed(1);
        const releasedPercent = ((releasedSites / total) * 100).toFixed(1);
        const naPercent = ((naSites / total) * 100).toFixed(1);

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
            { label: "Active", value: activeSites },
            { label: "Released", value: releasedSites },
            { label: "N/A", value: naSites },
        ]);

        const arc = d3
            .arc<d3.PieArcDatum<{ label: string; value: number }>>()
            .innerRadius(INNER_RADIUS)
            .outerRadius(PIE_RADIUS);

        const centerX = 90;
        const centerY = CHART_HEIGHT / 2;

        const pieGroup = svg
            .append("g")
            .attr("transform", `translate(${centerX}, ${centerY})`);

        pieGroup
            .selectAll("path")
            .data(data)
            .join("path")
            .attr("d", arc)
            .attr("fill", (d) => {
                switch (d.data.label) {
                    case "Active":
                        return chartColors.siteStatusActive;
                    case "Released":
                        return chartColors.siteStatusReleased;
                    default:
                        return chartColors.siteStatusNa;
                }
            })
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
        const labelStartY = centerY - 28;
        const labelGap = 28;

        const legendItems = [
            {
                label: "Active",
                count: activeSites,
                percent: activePercent,
                color: chartColors.siteStatusActive,
            },
            {
                label: "Released",
                count: releasedSites,
                percent: releasedPercent,
                color: chartColors.siteStatusReleased,
            },
            {
                label: "N/A",
                count: naSites,
                percent: naPercent,
                color: chartColors.siteStatusNa,
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
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "600")
            .attr("fill", chartColors.pieTextColor)
            .text("Site Status (All Time)");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSites, releasedSites, naSites, theme]);

    const total = activeSites + releasedSites + naSites;
    const chartLabel =
        total > 0
            ? `Donut chart showing site status breakdown all time. Active: ${activeSites.toLocaleString()} (${((activeSites / total) * 100).toFixed(1)}%), Released: ${releasedSites.toLocaleString()} (${((releasedSites / total) * 100).toFixed(1)}%), N/A: ${naSites.toLocaleString()} (${((naSites / total) * 100).toFixed(1)}%). Total: ${total.toLocaleString()} sites.`
            : "Donut chart showing site status breakdown. No data available.";

    return <svg ref={svgRef} role="img" aria-label={chartLabel}></svg>;
};

export default SiteStatusPieChart;
