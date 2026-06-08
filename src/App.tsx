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

interface StateInformation extends FlockRecord {
    color: string;
}

const flockWatchServerURL =
    import.meta.env.VITE_FLOCKWATCH_SERVER || "http://localhost:8080/data";

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
        return "...Loading";
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
    const last30Days = createInfoTiles(usPeriodSummaries.last_30_days);
    const newConfirmations30d =
        statusSummaryDataFromAPI.data.sites_confirmed_last_30_days;
    const sitesReleased30d =
        statusSummaryDataFromAPI.data.sites_released_last_30_days;
    const lastUpdatedDateFormatted = formatDateForUser(lastUpdated);
    const productionTypeData = productionTypeSummaryDataFromAPI.data;

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
        <main>
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
                    ></img>
                </div>
                <p>Last updated on {lastUpdatedDateFormatted}</p>
            </header>

            {!selectedState ? (
                <>
                    <section className="stats-section">
                        <section className="info-tile-group">
                            <h2 className="info-tile-title">All Time Totals</h2>
                            <section className="info-tiles">
                                {usInfoTiles}
                                <KpiTiles
                                    id="birds-at-risk"
                                    title="Birds at risk (active)"
                                    amount={birdsAtRisk.toLocaleString()}
                                    subtext={`${activeSitesCount.toLocaleString()} active sites`}
                                    icon="/rooster.png"
                                    bgColor="rgba(220, 50, 50, 1)"
                                />
                            </section>
                        </section>
                        <section className="info-tile-group">
                            <h2 className="info-tile-title">Last 30 Days</h2>
                            <section className="info-tiles">
                                {last30Days}
                                <KpiTiles
                                    id="new-confirmations"
                                    title="New Confirmations (30d)"
                                    amount={newConfirmations30d.toLocaleString()}
                                    icon="/rooster.png"
                                    bgColor="rgba(0, 119, 255, 1)"
                                />
                                <KpiTiles
                                    id="sites-released"
                                    title="Sites Released (30d)"
                                    amount={sitesReleased30d.toLocaleString()}
                                    subtext="depopulation complete"
                                    icon="/rooster.png"
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
                    ></button>
                    <StateInfo stateInfo={selectedState} />
                </div>
            )}
        </main>
    );
}

export default App;
