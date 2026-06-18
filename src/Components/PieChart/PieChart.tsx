import * as d3 from "d3";
import { useEffect, useRef, useState, type FC } from "react";
import { useTheme } from "../../theme/theme";

/** Props for the PieChart component. */
interface Props {
    backyardFlocks: number;
    commercialFlocks: number;
    title: string;
}

const CHART_WIDTH = 392;
const CHART_HEIGHT = 216;
const PIE_RADIUS = 74;
const INNER_RADIUS = 33;

/**
 * Donut chart comparing backyard vs commercial flocks affected.
 */
const PieChart: FC<Props> = ({ backyardFlocks, commercialFlocks, title }) => {
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

        const centerX = 85;
        const centerY = CHART_HEIGHT / 2;

        const pieGroup = svg
            .append("g")
            .attr("transform", `translate(${centerX}, ${centerY})`);

        const pathSelection = pieGroup
            .selectAll("path")
            .data(data)
            .join("path")
            .attr("fill", (d) =>
                d.data.label === "Backyard"
                    ? chartColors.pieBackyard
                    : chartColors.pieCommercial
            )
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
            .attr("y", centerY - 4)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .attr("font-size", "20px")
            .attr("font-weight", "700")
            .attr("fill", chartColors.pieTextColor)
            .text(total.toLocaleString());

        svg.append("text")
            .attr("x", centerX)
            .attr("y", centerY + 16)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .attr("font-size", "11px")
            .attr("fill", chartColors.pieSubtextColor)
            .text("flocks");

        const labelX = centerX + PIE_RADIUS + 18;
        const labelStartY = centerY - 30;
        const labelGap = 38;

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

            svg.append("rect")
                .attr("x", labelX)
                .attr("y", y - 10)
                .attr("width", 18)
                .attr("height", 18)
                .attr("fill", item.color)
                .attr("rx", 4)
                .attr("ry", 4);

            svg.append("text")
                .attr("x", labelX + 26)
                .attr("y", y + 1)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "central")
                .attr("font-size", "15px")
                .attr("fill", chartColors.pieTextColor)
                .text(
                    `${item.label} - ${item.count.toLocaleString()} (${item.percent}%)`
                );
        });

        svg.append("text")
            .attr("x", CHART_WIDTH / 2)
            .attr("y", 18)
            .attr("text-anchor", "middle")
            .attr("font-size", "15px")
            .attr("font-weight", "600")
            .attr("fill", chartColors.pieTextColor)
            .text(title);
    }, [backyardFlocks, commercialFlocks, chartColors, title, isVisible]);

    const total = backyardFlocks + commercialFlocks;
    const chartLabel =
        total > 0
            ? `Donut chart showing ${title}. Backyard: ${backyardFlocks.toLocaleString()} (${((backyardFlocks / total) * 100).toFixed(1)}%), Commercial: ${commercialFlocks.toLocaleString()} (${((commercialFlocks / total) * 100).toFixed(1)}%). Total: ${total.toLocaleString()} flocks.`
            : "Donut chart showing flocks affected. No data available.";

    return (
        <div className="pie-chart-wrapper" ref={containerRef}>
            <svg ref={svgRef} role="img" aria-label={chartLabel}></svg>
        </div>
    );
};

export default PieChart;
