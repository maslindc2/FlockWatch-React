import "./App.css";
import { useEffect, useState } from "react";
import StateInfo from "./Components/StateInfo/StateInfo";
import ChoroplethMap from "./Components/ChoroplethMap/ChoroplethMap";
import createInfoTiles from "./Components/KpiTiles/CreateKpiTiles";
import KpiTiles from "./Components/KpiTiles/KpiTiles";
import { FlockRecord, useFlockCases } from "./Hooks/useFlockCases.js";
import { useUsSummaryData } from "./Hooks/useUsSummaryData.js";
import { useStatusSummary } from "./Hooks/useStatusSummary.js";
import { useSitesData } from "./Hooks/useSitesData.js";
import { useActiveSites } from "./Hooks/useActiveSites.js";
import { useHistoricalSummary } from "./Hooks/useHistoricalSummary.js";
import { useProductionTypeSummary } from "./Hooks/useProductionTypeSummary.js";
import formatDateForUser from "./Utils/dateFormatter";
import ErrorComponent from "./Components/TanStackPages/ErrorComponent";
import * as d3 from "d3";
import StateDropdown from "./Components/StateDropdown/StateDropdown";
import HorizontalBarChart from "./Components/HorizontalBarChart/HorizontalBarChart";
import PieChart from "./Components/PieChart/PieChart";
import SiteStatusPieChart from "./Components/SiteStatusPieChart/SiteStatusPieChart";
import { useBackToClose } from "./Hooks/useBackToClose";
import { useSitesTimeline } from "./Hooks/useSitesTimeline";
import ProductionTypeBarChart from "./Components/ProductionTypeBarChart/ProductionTypeBarChart";
import RecentConfirmations from "./Components/RecentConfirmations/RecentConfirmations";
import SitesTimelineChart from "./Components/SitesTimelineChart/SitesTimelineChart";
import { useTheme } from "./theme/theme";

/** Combined state data with map color. */
interface StateInformation extends FlockRecord {
    color: string;
}

const flockWatchServerURL =
    import.meta.env.VITE_FLOCKWATCH_SERVER || "http://localhost:8080/data";

/** Root application component. Fetches all data and renders the dashboard. */
function App() {
    const { theme, chartColors, toggleTheme } = useTheme();

    const [selectedState, setSelectedState] = useState<StateInformation | null>(
        null
    );

    const [flocksTimeRange, setFlocksTimeRange] = useState<
        "allTime" | "last30Days"
    >("allTime");

    const [timelineGranularity, setTimelineGranularity] = useState<
        "week" | "month" | "year"
    >("month");

    useBackToClose(Boolean(selectedState), closeStateInfo);

    useEffect(() => {
        if (selectedState) {
            document.body.classList.add("state-window-open");
        } else {
            document.body.classList.remove("state-window-open");
        }
        return () => document.body.classList.remove("state-window-open");
    }, [selectedState]);

    const {
        isPending: isUsSummaryPending,
        error: usSummaryError,
        data: usSummaryDataFromAPI,
    } = useUsSummaryData(flockWatchServerURL);

    const {
        isPending: isFlockCasesPending,
        error: flockCasesError,
        data: flockDataFromAPI,
    } = useFlockCases(flockWatchServerURL);

    const {
        isPending: isStatusSummaryPending,
        error: statusSummaryError,
        data: statusSummaryDataFromAPI,
    } = useStatusSummary(flockWatchServerURL);

    const {
        isPending: isSitesPending,
        error: sitesError,
        data: sitesDataFromAPI,
    } = useSitesData(flockWatchServerURL);

    const {
        isPending: isActiveSitesPending,
        error: activeSitesError,
        data: activeSitesDataFromAPI,
    } = useActiveSites(flockWatchServerURL);

    const {
        isPending: isHistoricalSummaryPending,
        error: historicalSummaryError,
        data: historicalSummaryDataFromAPI,
    } = useHistoricalSummary(flockWatchServerURL);

    const {
        isPending: isProductionTypeSummaryPending,
        error: productionTypeSummaryError,
        data: productionTypeSummaryDataFromAPI,
    } = useProductionTypeSummary(flockWatchServerURL);

    const {
        error: timelineError,
        data: timelineDataFromAPI,
    } = useSitesTimeline(flockWatchServerURL, timelineGranularity);

    if (
        isUsSummaryPending ||
        isFlockCasesPending ||
        isStatusSummaryPending ||
        isSitesPending ||
        isActiveSitesPending ||
        isHistoricalSummaryPending ||
        isProductionTypeSummaryPending
    )
        return (
            <>
                <a href="#main-content" className="skip-link">
                    Skip to main content
                </a>
                <div className="loading-screen">
                    <header>
                        <div className="logo-banner">
                            <h1>Flock Watch</h1>
                            <button
                                className="theme-toggle"
                                onClick={toggleTheme}
                                aria-label={
                                    theme === "light"
                                        ? "Switch to dark mode"
                                        : "Switch to light mode"
                                }
                            >
                                {theme === "light" ? "\u263E" : "\u2600"}
                            </button>
                            <img
                                src="/game-icons_chicken.svg"
                                alt="Flock Watch Logo"
                                width="80"
                                height="80"
                            />
                        </div>
                    </header>
                    <div className="loading-spinner" role="status" aria-live="polite">
                        <div className="spinner" />
                        <span className="visually-hidden">
                            Loading avian influenza data…
                        </span>
                    </div>
                </div>
            </>
        );
    if (
        usSummaryError ||
        flockCasesError ||
        statusSummaryError ||
        sitesError ||
        activeSitesError ||
        historicalSummaryError ||
        productionTypeSummaryError
    ) {
        console.log(usSummaryError);
        console.log(flockCasesError);
        console.log(statusSummaryError);
        console.log(sitesError);
        console.log(activeSitesError);
        console.log(historicalSummaryError);
        console.log(productionTypeSummaryError);
        return <ErrorComponent />;
    }

    const usSummaryAllTimeTotals = usSummaryDataFromAPI.data.all_time_totals;
    const usPeriodSummaries = usSummaryDataFromAPI.data.period_summaries;
    const lastUpdated = flockDataFromAPI.metadata.last_scraped_date;
    const flockData = flockDataFromAPI.data;
    const sitesTotal = sitesDataFromAPI.total;
    const birdsAtRisk = activeSitesDataFromAPI.data.reduce(
        (sum: number, site: { birds_affected: number }) =>
            sum + site.birds_affected,
        0
    );
    const activeSitesCount = activeSitesDataFromAPI.total;
    const activeStates = new Set(
        activeSitesDataFromAPI.data.map(
            (site: { state: string }) => site.state
        )
    );
    const usInfoTiles = createInfoTiles(usSummaryAllTimeTotals, {
        total_flocks_affected: `${sitesTotal.toLocaleString()} total sites`,
    });
    const newConfirmations30d =
        statusSummaryDataFromAPI.data.sites_confirmed_last_30_days;
    const sitesReleased30d =
        statusSummaryDataFromAPI.data.sites_released_last_30_days;
    const lastUpdatedDateFormatted = formatDateForUser(lastUpdated);
    const productionTypeData = productionTypeSummaryDataFromAPI.data;

    const timelinePeriods = timelineDataFromAPI?.data?.periods;
    let confirmationsTrend: string | null = null;
    if (timelinePeriods && timelinePeriods.length >= 2) {
        const sorted = [...timelinePeriods].sort((a, b) =>
            b.period.localeCompare(a.period)
        );
        const current = sorted[0].new_confirmations;
        const previous = sorted[1].new_confirmations;
        if (previous > 0) {
            const diff = current - previous;
            const pct = Math.round((diff / previous) * 100);
            const arrow = diff >= 0 ? "\u2191" : "\u2193";
            confirmationsTrend = `${arrow} ${Math.abs(pct)}% vs previous month`;
        } else if (current > 0) {
            confirmationsTrend = `+${current.toLocaleString()} vs previous month`;
        }
    }

    const stateActiveSites = selectedState
        ? activeSitesDataFromAPI.data.filter(
            (site: { state: string }) => site.state === selectedState.state
        )
        : [];
    const stateActiveSitesCount = stateActiveSites.length;
    const stateBirdsAtRisk = stateActiveSites.reduce(
        (sum: number, site: { birds_affected: number }) => sum + site.birds_affected,
        0
    );
    const productionTypeCounts: Record<string, number> = {};
    stateActiveSites.forEach((site: { production_type: string }) => {
        productionTypeCounts[site.production_type] = (productionTypeCounts[site.production_type] || 0) + 1;
    });
    const stateProductionTypes = Object.entries(productionTypeCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

    const countyCounts: Record<string, { count: number; birds: number; types: Set<string> }> = {};
    stateActiveSites.forEach((site: { county: string; birds_affected: number; production_type: string }) => {
        const key = site.county;
        if (!countyCounts[key]) {
            countyCounts[key] = { count: 0, birds: 0, types: new Set() };
        }
        countyCounts[key].count += 1;
        countyCounts[key].birds += site.birds_affected;
        countyCounts[key].types.add(site.production_type);
    });
    const stateCountyData = Object.entries(countyCounts)
        .map(([county, info]) => ({
            county,
            count: info.count,
            birds: info.birds,
            types: Array.from(info.types).sort().join(", "),
        }))
        .sort((a, b) => b.count - a.count);

    function findSelectedStateColor(birdsAffectedInState: number): string {
        const maxNumBirdsAffected =
            d3.max(flockData, (state) => state.birds_affected) ?? 1;
        const color = d3
            .scaleLinear<string>()
            .domain([0, maxNumBirdsAffected / 8, maxNumBirdsAffected])
            .range(chartColors.selectedStateColorRange);
        return color(birdsAffectedInState);
    }

    function findSetSelectedState(stateSelected: string): void {
        const result = flockData.find(
            (state: { state_abbreviation: string }) =>
                state.state_abbreviation === stateSelected
        );
        if (!result) return;
        const interpolatedColor = findSelectedStateColor(result.birds_affected);
        setSelectedState({ ...result, color: interpolatedColor });
    }

    function closeStateInfo(): void {
        setSelectedState(null);
    }

    return (
        <>
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>
            <main id="main-content" tabIndex={-1}>
            <header>
                <div className="logo-banner">
                    <h1>Flock Watch</h1>
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label={
                            theme === "light"
                                ? "Switch to dark mode"
                                : "Switch to light mode"
                        }
                    >
                        {theme === "light" ? "\u263E" : "\u2600"}
                    </button>
                    <img
                        src="/game-icons_chicken.svg"
                        alt="Flock Watch Logo"
                        width="80"
                        height="80"
                    />
                </div>
                <p>Last updated on {lastUpdatedDateFormatted}</p>
            </header>

            {!selectedState ? (
                <>
                    <section className="stats-section">
                        <section className="info-tile-group">
                            <h2 className="info-tile-title">Overview</h2>
                            <section className="info-tiles">
                                {usInfoTiles}
                                <KpiTiles
                                    id="birds-at-risk"
                                    title="Birds at risk (active)"
                                    amount={birdsAtRisk.toLocaleString()}
                                    subtext={`${activeSitesCount.toLocaleString()} active sites`}
                                    bgColor="rgba(220, 50, 50, 1)"
                                />
                                <KpiTiles
                                    id="new-confirmations"
                                    title="New Confirmations (30d)"
                                    amount={newConfirmations30d.toLocaleString()}
                                    subtext={confirmationsTrend ?? undefined}
                                    bgColor="rgba(0, 119, 255, 1)"
                                />
                                <KpiTiles
                                    id="sites-released"
                                    title="Sites Released (30d)"
                                    amount={sitesReleased30d.toLocaleString()}
                                    subtext="depopulation complete"
                                    bgColor="rgba(0, 150, 100, 1)"
                                />
                            </section>
                        </section>
                    </section>
                    <section className="choropleth-map">
                        <div className="choropleth-container">
                            <StateDropdown onSelect={findSetSelectedState} />
                            <ChoroplethMap
                                data={flockData}
                                stateTrigger={findSetSelectedState}
                            />
                        </div>
                    </section>
                    <section className="chart-row">
                        <div className="bar-chart-wrapper">
                            <HorizontalBarChart
                                data={flockData}
                                activeStates={activeStates}
                            />
                        </div>
                        <div className="pie-charts-column">
                            <div className="pie-charts-group">
                                <PieChart
                                    backyardFlocks={
                                        flocksTimeRange === "allTime"
                                            ? usSummaryAllTimeTotals
                                                  .total_backyard_flocks_affected
                                            : usPeriodSummaries.last_30_days
                                                  .total_backyard_flocks_affected
                                    }
                                    commercialFlocks={
                                        flocksTimeRange === "allTime"
                                            ? usSummaryAllTimeTotals
                                                  .total_commercial_flocks_affected
                                            : usPeriodSummaries.last_30_days
                                                  .total_commercial_flocks_affected
                                    }
                                    timeRange={flocksTimeRange}
                                    onToggle={setFlocksTimeRange}
                                />
                                <SiteStatusPieChart
                                    activeSites={
                                        historicalSummaryDataFromAPI.data
                                            .total_active_sites
                                    }
                                    releasedSites={
                                        historicalSummaryDataFromAPI.data
                                            .total_released_sites
                                    }
                                    naSites={
                                        historicalSummaryDataFromAPI.data
                                            .total_na_sites
                                    }
                                />
                            </div>
                        </div>
                    </section>
                    <section className="chart-row">
                        <div className="bar-chart-wrapper">
                            <ProductionTypeBarChart
                                data={productionTypeData}
                            />
                        </div>
                        <div className="pie-charts-column">
                            <RecentConfirmations
                                sites={sitesDataFromAPI.data}
                            />
                        </div>
                    </section>
                    <section className="chart-row">
                        <div className="timeline-wrapper">
                            {timelineError ? (
                                <p className="timeline-error">
                                    Failed to load timeline data
                                </p>
                            ) : (
                                <SitesTimelineChart
                                    data={timelineDataFromAPI?.data?.periods ?? []}
                                    granularity={timelineGranularity}
                                    onGranularityChange={setTimelineGranularity}
                                />
                            )}
                        </div>
                    </section>
                </>
            ) : (
                <div className="state-window">
                    <button
                        onClick={closeStateInfo}
                        className="close-button"
                        aria-label="Close state information"
                    ></button>
                    <StateInfo
                        stateInfo={selectedState}
                        stateActiveSitesCount={stateActiveSitesCount}
                        stateBirdsAtRisk={stateBirdsAtRisk}
                        stateProductionTypes={stateProductionTypes}
                        stateCountyData={stateCountyData}
                    />
                </div>
            )}
        </main>
    </>
);
}

export default App;
