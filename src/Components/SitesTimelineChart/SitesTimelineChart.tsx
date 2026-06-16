import * as d3 from "d3";
import { useEffect, useRef, type FC } from "react";
import type { TimelinePeriod } from "../../Hooks/useSitesTimeline";
import { useTheme } from "../../theme/theme";

/** Props for the SitesTimelineChart component. */
interface Props {
    data: TimelinePeriod[];
    granularity: "week" | "month" | "year";
    onGranularityChange: (g: "week" | "month" | "year") => void;
}

const CHART_WIDTH = 1100;
const CHART_HEIGHT = 500;
const MARGIN = { top: 45, right: 130, bottom: 80, left: 80 };
const INNER_WIDTH = CHART_WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

function parsePeriod(period: string): Date | null {
    const formats = ["%Y-%m-%d", "%Y-%m", "%Y", "%Y-W%W", "%Y-W%U", "%Y%m%d"];
    for (const fmt of formats) {
        const d = d3.timeParse(fmt)(period);
        if (d && !isNaN(d.getTime())) return d;
    }
    const d = new Date(period);
    if (!isNaN(d.getTime())) return d;
    return null;
}

/**
 * Dual-axis timeline chart showing new confirmations and birds affected
 * over time, with granularity controls (week / month / year).
 */
const SitesTimelineChart: FC<Props> = ({
    data,
    granularity,
    onGranularityChange,
}) => {
    const { theme, chartColors } = useTheme();
    const svgRef = useRef<SVGSVGElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!data.length) return;

        const parsed = data
            .map((d) => ({ ...d, date: parsePeriod(d.period) }))
            .filter((d): d is typeof d & { date: Date } => d.date !== null)
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        if (!parsed.length) return;

        const xScale = d3
            .scaleTime()
            .domain(d3.extent(parsed, (d) => d.date) as [Date, Date])
            .range([0, INNER_WIDTH]);

        const maxConfirmations =
            d3.max(parsed, (d) => d.new_confirmations) ?? 1;
        const maxBirds = d3.max(parsed, (d) => d.birds_affected) ?? 1;

        const yLeftScale = d3
            .scaleLinear()
            .domain([0, maxConfirmations * 1.1])
            .range([INNER_HEIGHT, 0]);

        const yRightScale = d3
            .scaleLinear()
            .domain([0, maxBirds * 1.1])
            .range([INNER_HEIGHT, 0]);

        const svg = d3
            .select(svgRef.current)
            .attr("viewBox", `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%");

        svg.selectAll("*").remove();

        svg.append("text")
            .attr("x", CHART_WIDTH / 2)
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .attr("font-size", "22px")
            .attr("font-weight", "600")
            .attr("fill", chartColors.timelineTitleColor)
            .text("Avian Influenza Outbreak Timeline");

        const chartGroup = svg
            .append("g")
            .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

        chartGroup
            .append("g")
            .attr("class", "grid")
            .call(
                d3
                    .axisLeft(yLeftScale)
                    .tickSize(-INNER_WIDTH)
                    .tickFormat(() => "")
            )
            .selectAll("line")
            .attr("stroke", chartColors.timelineGridColor)
            .attr("stroke-dasharray", "4");

        const xAxis = d3.axisBottom(xScale);
        const tickCount =
            granularity === "week" ? 12 : granularity === "month" ? 10 : 8;
        xAxis.ticks(tickCount);
        if (granularity === "year") {
            const fmt = d3.timeFormat("%Y");
            xAxis.tickFormat((d: Date | d3.NumberValue) => fmt(d as Date));
        } else if (granularity === "month") {
            const fmt = d3.timeFormat("%b %y");
            xAxis.tickFormat((d: Date | d3.NumberValue) => fmt(d as Date));
        } else {
            const fmt = d3.timeFormat("%b %d");
            xAxis.tickFormat((d: Date | d3.NumberValue) => fmt(d as Date));
        }

        chartGroup
            .append("g")
            .attr("transform", `translate(0, ${INNER_HEIGHT})`)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .attr("text-anchor", "end")
            .attr("fill", chartColors.timelineAxisLabelColor)
            .style("font-size", "13px");

        chartGroup
            .append("g")
            .call(
                d3
                    .axisLeft(yLeftScale)
                    .ticks(6)
                    .tickFormat((d) => d.toLocaleString())
            )
            .selectAll("text")
            .attr("fill", chartColors.timelineAxisLabelColor)
            .style("font-size", "13px");

        chartGroup
            .append("g")
            .attr("transform", `translate(${INNER_WIDTH}, 0)`)
            .call(
                d3
                    .axisRight(yRightScale)
                    .ticks(6)
                    .tickFormat(
                        (d) => `${(Number(d) / 1_000_000).toFixed(1)} M`
                    )
            )
            .selectAll("text")
            .attr("fill", chartColors.timelineAxisLabelColor)
            .style("font-size", "13px");

        svg.append("text")
            .attr("x", -(MARGIN.top + INNER_HEIGHT / 2))
            .attr("y", 16)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", chartColors.timelineAxisLabelColor)
            .text("New Confirmations");

        svg.append("text")
            .attr("x", -(MARGIN.top + INNER_HEIGHT / 2))
            .attr("y", CHART_WIDTH - MARGIN.right + 69)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", chartColors.timelineAxisLabelColor)
            .text("Birds Affected");

        const areaConfirmations = d3
            .area<(typeof parsed)[0]>()
            .x((d) => xScale(d.date))
            .y0(yLeftScale(0))
            .y1((d) => yLeftScale(d.new_confirmations))
            .curve(d3.curveMonotoneX);

        chartGroup
            .append("path")
            .datum(parsed)
            .attr("fill", chartColors.timelineConfirmationsColor)
            .attr("fill-opacity", 0.08)
            .attr("d", areaConfirmations);

        const areaBirds = d3
            .area<(typeof parsed)[0]>()
            .x((d) => xScale(d.date))
            .y0(yRightScale(0))
            .y1((d) => yRightScale(d.birds_affected))
            .curve(d3.curveMonotoneX);

        chartGroup
            .append("path")
            .datum(parsed)
            .attr("fill", chartColors.timelineBirdsColor)
            .attr("fill-opacity", 0.08)
            .attr("d", areaBirds);

        const lineConfirmations = d3
            .line<(typeof parsed)[0]>()
            .x((d) => xScale(d.date))
            .y((d) => yLeftScale(d.new_confirmations))
            .curve(d3.curveMonotoneX);

        chartGroup
            .append("path")
            .datum(parsed)
            .attr("fill", "none")
            .attr("stroke", chartColors.timelineConfirmationsColor)
            .attr("stroke-width", 2)
            .attr("d", lineConfirmations);

        const lineBirds = d3
            .line<(typeof parsed)[0]>()
            .x((d) => xScale(d.date))
            .y((d) => yRightScale(d.birds_affected))
            .curve(d3.curveMonotoneX);

        chartGroup
            .append("path")
            .datum(parsed)
            .attr("fill", "none")
            .attr("stroke", chartColors.timelineBirdsColor)
            .attr("stroke-width", 2)
            .attr("d", lineBirds);

        const legendGroup = chartGroup
            .append("g")
            .attr("transform", `translate(0, ${INNER_HEIGHT + 60})`);

        [
            {
                label: "New Confirmations",
                color: chartColors.timelineConfirmationsColor,
                x: 0,
            },
            {
                label: "Birds Affected",
                color: chartColors.timelineBirdsColor,
                x: 180,
            },
        ].forEach((entry) => {
            legendGroup
                .append("rect")
                .attr("x", entry.x)
                .attr("y", -8)
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", entry.color)
                .attr("rx", 2);
            legendGroup
                .append("text")
                .attr("x", entry.x + 18)
                .attr("y", 2)
                .attr("font-size", "14px")
                .attr("fill", chartColors.timelineLegendColor)
                .text(entry.label);
        });

        const bisect = d3.bisector<(typeof parsed)[0], Date>(
            (d) => d.date
        ).left;
        const tooltip = d3.select(tooltipRef.current);

        const verticalLine = chartGroup
            .append("line")
            .attr("stroke", chartColors.timelineCrosshairColor)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4")
            .attr("y1", 0)
            .attr("y2", INNER_HEIGHT)
            .style("opacity", 0);

        const confirmCircle = chartGroup
            .append("circle")
            .attr("r", 5)
            .attr("fill", chartColors.timelineConfirmationsColor)
            .style("opacity", 0);

        const birdsCircle = chartGroup
            .append("circle")
            .attr("r", 5)
            .attr("fill", chartColors.timelineBirdsColor)
            .style("opacity", 0);

        chartGroup
            .append("rect")
            .attr("width", INNER_WIDTH)
            .attr("height", INNER_HEIGHT)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .style("cursor", "crosshair")
            .on(
                "mousemove",
                function (this: SVGRectElement, event: MouseEvent) {
                    const [mx] = d3.pointer(event, this);
                    const x0 = xScale.invert(mx);
                    const i = bisect(parsed, x0, 1);
                    const d0 = parsed[i - 1];
                    const d1 = parsed[i];
                    if (!d0 || !d1) return;
                    const d =
                        x0.getTime() - d0.date.getTime() >
                        d1.date.getTime() - x0.getTime()
                            ? d1
                            : d0;

                    const xPos = xScale(d.date);

                    verticalLine
                        .attr("x1", xPos)
                        .attr("x2", xPos)
                        .style("opacity", 1);

                    confirmCircle
                        .attr("cx", xPos)
                        .attr("cy", yLeftScale(d.new_confirmations))
                        .style("opacity", 1);

                    birdsCircle
                        .attr("cx", xPos)
                        .attr("cy", yRightScale(d.birds_affected))
                        .style("opacity", 1);

                    const svgEl = svgRef.current;
                    const containerEl = containerRef.current;
                    if (!svgEl || !containerEl) return;

                    const svgRect = svgEl.getBoundingClientRect();
                    const containerRect = containerEl.getBoundingClientRect();

                    const userX = MARGIN.left + xPos;
                    const userY = MARGIN.top + 5;
                    const scaleX = svgRect.width / CHART_WIDTH;
                    const scaleY = svgRect.height / CHART_HEIGHT;

                    const screenX = svgRect.left + userX * scaleX;
                    const screenY = svgRect.top + userY * scaleY;

                    const relX = screenX - containerRect.left;
                    const relY = screenY - containerRect.top;

                    tooltip
                        .style("opacity", 1)
                        .style("left", `${relX + 12}px`)
                        .style("top", `${relY}px`)
                        .html(
                            `<strong>${d.period}</strong><br/>` +
                                `New Conf.: ${d.new_confirmations.toLocaleString()}<br/>` +
                                `Birds Aff.: ${d.birds_affected.toLocaleString()}<br/>` +
                                `Cumulative: ${d.cumulative_birds_affected.toLocaleString()}`
                        );
                }
            )
            .on("mouseleave", function () {
                verticalLine.style("opacity", 0);
                confirmCircle.style("opacity", 0);
                birdsCircle.style("opacity", 0);
                tooltip.style("opacity", 0);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, granularity, theme]);

    const chartLabel =
        data.length > 0
            ? `Timeline chart showing avian influenza outbreak from ${data[0].period} to ${data[data.length - 1].period} at ${granularity} granularity with ${data.length} data points.`
            : "Timeline chart showing avian influenza outbreak over time.";

    return (
        <div
            ref={containerRef}
            className="timeline-chart-container"
            style={{ position: "relative" }}
        >
            <div className="timeline-controls">
                {(["week", "month", "year"] as const).map((g) => (
                    <button
                        key={g}
                        className={`timeline-btn ${granularity === g ? "active" : ""}`}
                        onClick={() => onGranularityChange(g)}
                    >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                ))}
            </div>
            <svg ref={svgRef} role="img" aria-label={chartLabel}></svg>
            <details style={{ marginTop: "12px", cursor: "pointer" }}>
                <summary
                    style={{ fontSize: "13px", color: "var(--text-secondary)" }}
                >
                    View timeline data as a table
                </summary>
                <div style={{ overflowX: "auto" }}>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "12px",
                            marginTop: "8px",
                        }}
                    >
                        <thead>
                            <tr>
                                <th
                                    style={{
                                        textAlign: "left",
                                        padding: "4px 8px",
                                        borderBottom:
                                            "2px solid var(--border-color)",
                                    }}
                                >
                                    Period
                                </th>
                                <th
                                    style={{
                                        textAlign: "right",
                                        padding: "4px 8px",
                                        borderBottom:
                                            "2px solid var(--border-color)",
                                    }}
                                >
                                    New Confirmations
                                </th>
                                <th
                                    style={{
                                        textAlign: "right",
                                        padding: "4px 8px",
                                        borderBottom:
                                            "2px solid var(--border-color)",
                                    }}
                                >
                                    Birds Affected
                                </th>
                                <th
                                    style={{
                                        textAlign: "right",
                                        padding: "4px 8px",
                                        borderBottom:
                                            "2px solid var(--border-color)",
                                    }}
                                >
                                    Cumulative
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((d) => (
                                <tr key={d.period}>
                                    <td
                                        style={{
                                            padding: "2px 8px",
                                            borderBottom:
                                                "1px solid var(--border-light)",
                                        }}
                                    >
                                        {d.period}
                                    </td>
                                    <td
                                        style={{
                                            textAlign: "right",
                                            padding: "2px 8px",
                                            borderBottom:
                                                "1px solid var(--border-light)",
                                        }}
                                    >
                                        {d.new_confirmations.toLocaleString()}
                                    </td>
                                    <td
                                        style={{
                                            textAlign: "right",
                                            padding: "2px 8px",
                                            borderBottom:
                                                "1px solid var(--border-light)",
                                        }}
                                    >
                                        {d.birds_affected.toLocaleString()}
                                    </td>
                                    <td
                                        style={{
                                            textAlign: "right",
                                            padding: "2px 8px",
                                            borderBottom:
                                                "1px solid var(--border-light)",
                                        }}
                                    >
                                        {d.cumulative_birds_affected.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>
            <div
                ref={tooltipRef}
                className="timeline-tooltip"
                style={{
                    position: "absolute",
                    opacity: 0,
                    pointerEvents: "none",
                    background: chartColors.timelineTooltipBg,
                    border: `1px solid ${chartColors.timelineTooltipBorder}`,
                    borderRadius: "4px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    lineHeight: "1.6",
                    boxShadow: `0 2px 6px ${chartColors.timelineTooltipShadow}`,
                    zIndex: 10,
                }}
            ></div>
        </div>
    );
};

export default SitesTimelineChart;
