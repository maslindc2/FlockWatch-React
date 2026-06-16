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
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape" && selectedState) {
                closeStateInfo();
            }
        }
        window.addEventListener("keydown", handleKey);
        return () => {
            document.body.classList.remove("state-window-open");
            window.removeEventListener("keydown", handleKey);
        };
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="none" viewBox="0 0 80 80">
                                <path fill="currentColor" d="M57.164 4.978c-1.586.386-3.893 1.105-5.85 2.125-1.437.75-2.699 1.652-3.425 2.53-.727.878-.946 1.556-.69 2.435l.555 1.915-1.99-.119c-.476-.028-.772-.018-1.15-.04a4.192 4.192 0 0 1-1.293-.293c-.603-.245-1.419-.726-2.513-1.392a23.267 23.267 0 0 0-.063 2.5c.059 2.019.315 4.367.753 6.434.207.98.47 1.896.75 2.676.468-.735.98-1.438 1.538-2.088 2.66-3.097 6.323-6.498 10.917-6.828 2.253-.162 4.583.832 6.649 1.939.624-1.193 1.602-2.182 2.596-3.074 1-.898 2.054-1.721 2.961-2.495-1.493-1.05-2.627-1.574-3.597-1.696-1.24-.156-2.504.227-4.505 1.38l-2.377 1.368.734-7.277Zm-1.999 12.655a2.648 2.648 0 0 0-.261.005c-3.253.233-6.519 2.984-8.985 5.855-2.162 2.518-3.65 6.426-4.476 9.618 1.073.176 2.22.345 3.37.38 1.71.051 3.196-.25 3.958-.911l1.1-.956.915 1.133c.775.958 1.688 2.201 2.238 3.668a6.41 6.41 0 0 1 .422 2.439c1.95-.413 3.739-1.12 4.513-2.01l.821-.944 1.033.706c1.564 1.069 3.098 2.279 4.162 3.944.161-.587.302-1.198.378-1.836.234-1.99-.029-4.052-1.037-5.546-1.6-1.76-3.456-3.446-3.896-5.786-.166-.887.108-1.566.435-2.233s.777-1.323 1.304-1.968a15.484 15.484 0 0 1 2.023-2.039 35.437 35.437 0 0 0-2.168-1.354c-1.995-1.133-4.468-2.123-5.849-2.165ZM7.581 20.098c-.992-.006-1.559.073-1.559.246.441 2.009 1.25 4.145 2.412 6.169a84.419 84.419 0 0 1 12.602-.858c4.18 1.353 8.543 2.503 12.63 3.96a75.494 75.494 0 0 0-13.646-1.153 82.568 82.568 0 0 0-12.96 1.12c.748 5.076 3.14 12.354 7.875 18.825 5.149 7.037 12.962 13.129 24.528 14.759 9.091 1.282 16.792-.77 20.698-4.898 1.953-2.064 3.03-4.617 3.005-7.776-.025-2.962-1.075-6.489-3.489-10.485a20.15 20.15 0 0 0-.55-.415c-2.057 1.62-4.948 2.149-7.483 2.394l-2.874.278 1.553-2.434c.465-.728.431-1.448.068-2.418-.233-.62-.628-1.258-1.055-1.874-1.427.69-3.068.81-4.609.764-2.027-.062-3.991-.455-5.26-.666l-1.447-.24.302-1.437c.453-2.148 1.209-4.791 2.374-7.328-7.279-3.632-27.361-6.5-33.115-6.534Zm47.463.014c1.383 0 2.53 1.153 2.53 2.533s-1.147 2.533-2.53 2.533c-1.383 0-2.53-1.154-2.53-2.533 0-1.38 1.147-2.533 2.53-2.533Zm11.548 2.104-.267.146c-.93.512-2.141 1.576-2.99 2.611-.424.519-.763 1.034-.954 1.424-.138.282-.161.492-.177.523.203.906 1.639 2.643 3.276 4.457l.06.066.052.074c.285.412.533.848.743 1.304 1.792.088 3.744-.118 6.039-.583l-6.461-4.834s5.85.117 7.988-.255c.734-.128-3.983-3.473-7.309-4.933Zm-41.51 13.89 2.736.648c-.254 1.073-.99 1.775-1.774 2.345-.785.57-1.7 1.032-2.656 1.462-.84.376-1.707.718-2.53 1.046 2.694 1.119 6.208 1.956 9.053 1.212l1.271-.332.418 1.246c.328.98.124 2.019-.308 2.828-.433.808-1.065 1.474-1.79 2.084a16.244 16.244 0 0 1-2.287 1.58c.237.063.43.122.69.185 2.524.613 6.127 1.249 9.72 1.512 3.594.264 7.201.13 9.617-.633 1.207-.381 2.085-.906 2.594-1.493.51-.586.75-1.22.65-2.287l2.8-.262c.16 1.701-.343 3.261-1.326 4.394-.983 1.132-2.346 1.849-3.872 2.33-3.053.963-6.886 1.034-10.669.756-3.783-.278-7.493-.932-10.178-1.584-1.342-.326-2.413-.642-3.185-.954-.386-.156-.668-.247-1.065-.594-.198-.174-.6-.5-.561-1.263.019-.382.22-.758.421-.964.2-.206.381-.296.527-.359 1.524-.655 3.212-1.589 4.312-2.515a6.49 6.49 0 0 0 .617-.598c-4.488.316-8.923-1.588-11.527-3.196l-2.132-1.316 2.235-1.134c1.536-.78 3.616-1.477 5.353-2.256.869-.39 1.642-.798 2.154-1.17.512-.372.683-.685.69-.719h.001ZM20.683 58.33c-1.553 1.59-3.853 3.141-6.278 4.383a32.138 32.138 0 0 0-3.195-3.476l-1.915 2.06c.857.797 1.68 1.684 2.463 2.627-.895.361-1.776.668-2.612.905l.768 2.706a33.602 33.602 0 0 0 3.22-1.1c-.001 2.64-.28 5.585-1.021 7.628l2.644.96c.57-1.571.899-3.353 1.066-5.141a45.922 45.922 0 0 1 1.97 3.896l2.57-1.145a48.389 48.389 0 0 0-4.216-7.566c2.623-1.349 5.09-3.067 6.87-5.076a38.135 38.135 0 0 1-2.334-1.661Zm47.1 5.488c-2.37.03-5.026 1.228-7.69 2.89a30.767 30.767 0 0 0-3.196 2.29c-1.049-.805-2.145-1.67-3.26-2.535-.408-.318-.819-.634-1.23-.947a29.639 29.639 0 0 1-3.86.66 89.45 89.45 0 0 1 3.366 2.508c.966.75 1.926 1.511 2.87 2.243a19.764 19.764 0 0 0-2.07 2.458l2.303 1.616c.548-.78 1.247-1.582 2.043-2.362a34.551 34.551 0 0 0 2.316 1.557l1.455-2.406c-.246-.15-.489-.304-.729-.463 3.033-.364 6.102-.054 8.227.419L68.94 69a28.546 28.546 0 0 0-6.002-.668h-.03c2.127-1.127 4.157-1.753 5.189-1.696l.156-2.808a6.878 6.878 0 0 0-.47-.01Z"/>
                            </svg>
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
            confirmationsTrend = `${arrow} ${Math.abs(pct)}% vs previous ${timelineGranularity}`;
        } else if (current > 0) {
            confirmationsTrend = `+${current.toLocaleString()} vs previous ${timelineGranularity}`;
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
        const colors = chartColors.selectedStateColorRange;
        const t = Math.log(Math.max(1, birdsAffectedInState)) / Math.log(maxNumBirdsAffected);
        const pos = Math.min(t * (colors.length - 1), colors.length - 1);
        const i = Math.floor(pos);
        const frac = pos - i;
        if (i >= colors.length - 1) return colors[colors.length - 1];
        return d3.interpolateRgb(colors[i], colors[i + 1])(frac);
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
            <main id="main-content" tabIndex={-1}>
            <header>
                <div className="logo-banner">
                    <h1>Flock Watch</h1>
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="none" viewBox="0 0 80 80">
                                <path fill="currentColor" d="M57.164 4.978c-1.586.386-3.893 1.105-5.85 2.125-1.437.75-2.699 1.652-3.425 2.53-.727.878-.946 1.556-.69 2.435l.555 1.915-1.99-.119c-.476-.028-.772-.018-1.15-.04a4.192 4.192 0 0 1-1.293-.293c-.603-.245-1.419-.726-2.513-1.392a23.267 23.267 0 0 0-.063 2.5c.059 2.019.315 4.367.753 6.434.207.98.47 1.896.75 2.676.468-.735.98-1.438 1.538-2.088 2.66-3.097 6.323-6.498 10.917-6.828 2.253-.162 4.583.832 6.649 1.939.624-1.193 1.602-2.182 2.596-3.074 1-.898 2.054-1.721 2.961-2.495-1.493-1.05-2.627-1.574-3.597-1.696-1.24-.156-2.504.227-4.505 1.38l-2.377 1.368.734-7.277Zm-1.999 12.655a2.648 2.648 0 0 0-.261.005c-3.253.233-6.519 2.984-8.985 5.855-2.162 2.518-3.65 6.426-4.476 9.618 1.073.176 2.22.345 3.37.38 1.71.051 3.196-.25 3.958-.911l1.1-.956.915 1.133c.775.958 1.688 2.201 2.238 3.668a6.41 6.41 0 0 1 .422 2.439c1.95-.413 3.739-1.12 4.513-2.01l.821-.944 1.033.706c1.564 1.069 3.098 2.279 4.162 3.944.161-.587.302-1.198.378-1.836.234-1.99-.029-4.052-1.037-5.546-1.6-1.76-3.456-3.446-3.896-5.786-.166-.887.108-1.566.435-2.233s.777-1.323 1.304-1.968a15.484 15.484 0 0 1 2.023-2.039 35.437 35.437 0 0 0-2.168-1.354c-1.995-1.133-4.468-2.123-5.849-2.165ZM7.581 20.098c-.992-.006-1.559.073-1.559.246.441 2.009 1.25 4.145 2.412 6.169a84.419 84.419 0 0 1 12.602-.858c4.18 1.353 8.543 2.503 12.63 3.96a75.494 75.494 0 0 0-13.646-1.153 82.568 82.568 0 0 0-12.96 1.12c.748 5.076 3.14 12.354 7.875 18.825 5.149 7.037 12.962 13.129 24.528 14.759 9.091 1.282 16.792-.77 20.698-4.898 1.953-2.064 3.03-4.617 3.005-7.776-.025-2.962-1.075-6.489-3.489-10.485a20.15 20.15 0 0 0-.55-.415c-2.057 1.62-4.948 2.149-7.483 2.394l-2.874.278 1.553-2.434c.465-.728.431-1.448.068-2.418-.233-.62-.628-1.258-1.055-1.874-1.427.69-3.068.81-4.609.764-2.027-.062-3.991-.455-5.26-.666l-1.447-.24.302-1.437c.453-2.148 1.209-4.791 2.374-7.328-7.279-3.632-27.361-6.5-33.115-6.534Zm47.463.014c1.383 0 2.53 1.153 2.53 2.533s-1.147 2.533-2.53 2.533c-1.383 0-2.53-1.154-2.53-2.533 0-1.38 1.147-2.533 2.53-2.533Zm11.548 2.104-.267.146c-.93.512-2.141 1.576-2.99 2.611-.424.519-.763 1.034-.954 1.424-.138.282-.161.492-.177.523.203.906 1.639 2.643 3.276 4.457l.06.066.052.074c.285.412.533.848.743 1.304 1.792.088 3.744-.118 6.039-.583l-6.461-4.834s5.85.117 7.988-.255c.734-.128-3.983-3.473-7.309-4.933Zm-41.51 13.89 2.736.648c-.254 1.073-.99 1.775-1.774 2.345-.785.57-1.7 1.032-2.656 1.462-.84.376-1.707.718-2.53 1.046 2.694 1.119 6.208 1.956 9.053 1.212l1.271-.332.418 1.246c.328.98.124 2.019-.308 2.828-.433.808-1.065 1.474-1.79 2.084a16.244 16.244 0 0 1-2.287 1.58c.237.063.43.122.69.185 2.524.613 6.127 1.249 9.72 1.512 3.594.264 7.201.13 9.617-.633 1.207-.381 2.085-.906 2.594-1.493.51-.586.75-1.22.65-2.287l2.8-.262c.16 1.701-.343 3.261-1.326 4.394-.983 1.132-2.346 1.849-3.872 2.33-3.053.963-6.886 1.034-10.669.756-3.783-.278-7.493-.932-10.178-1.584-1.342-.326-2.413-.642-3.185-.954-.386-.156-.668-.247-1.065-.594-.198-.174-.6-.5-.561-1.263.019-.382.22-.758.421-.964.2-.206.381-.296.527-.359 1.524-.655 3.212-1.589 4.312-2.515a6.49 6.49 0 0 0 .617-.598c-4.488.316-8.923-1.588-11.527-3.196l-2.132-1.316 2.235-1.134c1.536-.78 3.616-1.477 5.353-2.256.869-.39 1.642-.798 2.154-1.17.512-.372.683-.685.69-.719h.001ZM20.683 58.33c-1.553 1.59-3.853 3.141-6.278 4.383a32.138 32.138 0 0 0-3.195-3.476l-1.915 2.06c.857.797 1.68 1.684 2.463 2.627-.895.361-1.776.668-2.612.905l.768 2.706a33.602 33.602 0 0 0 3.22-1.1c-.001 2.64-.28 5.585-1.021 7.628l2.644.96c.57-1.571.899-3.353 1.066-5.141a45.922 45.922 0 0 1 1.97 3.896l2.57-1.145a48.389 48.389 0 0 0-4.216-7.566c2.623-1.349 5.09-3.067 6.87-5.076a38.135 38.135 0 0 1-2.334-1.661Zm47.1 5.488c-2.37.03-5.026 1.228-7.69 2.89a30.767 30.767 0 0 0-3.196 2.29c-1.049-.805-2.145-1.67-3.26-2.535-.408-.318-.819-.634-1.23-.947a29.639 29.639 0 0 1-3.86.66 89.45 89.45 0 0 1 3.366 2.508c.966.75 1.926 1.511 2.87 2.243a19.764 19.764 0 0 0-2.07 2.458l2.303 1.616c.548-.78 1.247-1.582 2.043-2.362a34.551 34.551 0 0 0 2.316 1.557l1.455-2.406c-.246-.15-.489-.304-.729-.463 3.033-.364 6.102-.054 8.227.419L68.94 69a28.546 28.546 0 0 0-6.002-.668h-.03c2.127-1.127 4.157-1.753 5.189-1.696l.156-2.808a6.878 6.878 0 0 0-.47-.01Z"/>
                            </svg>
                        </div>
                        <p>Last updated on {lastUpdatedDateFormatted}</p>
            </header>

            <section className="stats-sections">
                <section className="info-tile-group">
                    <h2 className="info-tile-title">Overview</h2>
                    <section className="info-tiles">
                        <KpiTiles
                            id="birds-at-risk"
                            title="Birds at risk (active)"
                            amount={birdsAtRisk.toLocaleString()}
                            subtext={`${activeSitesCount.toLocaleString()} active sites`}
                            bgColor="rgba(200, 45, 45, 1)"
                        />
                        <KpiTiles
                            id="new-confirmations"
                            title="New Confirmations (30d)"
                            amount={newConfirmations30d.toLocaleString()}
                            subtext={confirmationsTrend ?? undefined}
                            bgColor="hsla(210, 70%, 45%, 1.00)"
                        />
                        <KpiTiles
                            id="sites-released"
                            title="Sites Released (30d)"
                            amount={sitesReleased30d.toLocaleString()}
                            subtext="depopulation complete"
                            bgColor="rgba(0, 140, 100, 1)"
                        />
                        {usInfoTiles}
                    </section>
                </section>
            </section>
            <section className="choropleth-map">
                <div className="choropleth-container">
                    <StateDropdown onSelect={findSetSelectedState} />
                    <ChoroplethMap
                        data={flockData}
                        stateTrigger={findSetSelectedState}
                        selectedAbbreviation={selectedState?.state_abbreviation ?? null}
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
        </main>
        {selectedState && (
            <div className="state-overlay">
                <div
                    className="state-overlay-backdrop"
                    onClick={closeStateInfo}
                    aria-hidden="true"
                />
                <div
                    className="state-slide-panel"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${selectedState.state} outbreak information`}
                >
                    <button
                        onClick={closeStateInfo}
                        className="state-panel-close"
                        aria-label="Close state information"
                    >
                        &times;
                    </button>
                    <StateInfo
                        stateInfo={selectedState}
                        stateActiveSitesCount={stateActiveSitesCount}
                        stateBirdsAtRisk={stateBirdsAtRisk}
                        stateProductionTypes={stateProductionTypes}
                        stateCountyData={stateCountyData}
                    />
                </div>
            </div>
        )}
    </>
);
}

export default App;
