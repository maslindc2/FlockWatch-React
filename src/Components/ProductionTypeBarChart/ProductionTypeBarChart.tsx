import * as d3 from "d3";
import { useEffect, useRef, useState, type FC } from "react";
import { ProductionTypeSummary } from "../../Hooks/useProductionTypeSummary";
import { useTheme } from "../../theme/theme";

/** Props for the ProductionTypeBarChart component. */
interface Props {
    data: ProductionTypeSummary[];
}

const TOP_N = 5;
const CHART_WIDTH = 800;
const CHART_HEIGHT = 350;
const MARGIN = { top: 50, right: 120, bottom: 40, left: 200 };
const BAR_HEIGHT = 38;
const BAR_GAP = 10;

/**
 * Horizontal bar chart showing the top 5 production types by birds affected.
 */
const MOBILE_BREAKPOINT = 480;

const ProductionTypeBarChart: FC<Props> = ({ data }) => {
    const { theme, chartColors } = useTheme();
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkWidth = () => {
            if (containerRef.current) {
                setIsMobile(containerRef.current.getBoundingClientRect().width < MOBILE_BREAKPOINT);
            }
        };
        checkWidth();
        window.addEventListener("resize", checkWidth);
        return () => window.removeEventListener("resize", checkWidth);
    }, []);

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

            const barRect = chartGroup
                .append("rect")
                .attr("x", 0)
                .attr("y", y)
                .attr("width", isVisible ? 0 : barWidth)
                .attr("height", BAR_HEIGHT)
                .attr("fill", colorScale(d.total_birds_affected))
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
                .attr("font-size", "13px")
                .attr("font-weight", "600")
                .attr("fill", chartColors.prodBarTextColor)
                .text(d.production_type);

            chartGroup
                .append("text")
                .attr("x", chartWidth + 8)
                .attr("y", y + BAR_HEIGHT / 2)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "central")
                .attr("font-size", "14px")
                .attr("fill", chartColors.prodBarTextColor)
                .text(d.total_birds_affected.toLocaleString());
        });

        svg
            .append("text")
            .attr("x", CHART_WIDTH / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("font-size", "22px")
            .attr("font-weight", "600")
            .attr("fill", chartColors.prodBarTitleColor)
            .text("Birds Affected by Production Type");
    }, [data, theme, isVisible, isMobile]);

    const sorted = [...data]
        .sort((a, b) => b.total_birds_affected - a.total_birds_affected)
        .slice(0, TOP_N);
    const chartLabel = `Bar chart showing top 5 production types by birds affected. ${sorted.map((d) => `${d.production_type}: ${d.total_birds_affected.toLocaleString()} birds`).join(". ")}.`;

    if (isMobile) {
        return (
            <div className="bar-chart-container" ref={containerRef}>
                <h3 className="prod-bar-mobile-title">
                    Birds Affected by Production Type
                </h3>
                <ol
                    className="prod-bar-mobile-list"
                    role="list"
                    aria-label={chartLabel}
                >
                    {sorted.map((d) => (
                        <li key={d.production_type} className="prod-bar-mobile-item">
                            <span className="prod-bar-mobile-label">
                                {d.production_type}
                            </span>
                            <span className="prod-bar-mobile-value">
                                {d.total_birds_affected.toLocaleString()}
                            </span>
                        </li>
                    ))}
                </ol>
            </div>
        );
    }

    return (
        <div className="bar-chart-container" ref={containerRef}>
            <svg ref={svgRef} role="img" aria-label={chartLabel}></svg>
        </div>
    );
};

export default ProductionTypeBarChart;
