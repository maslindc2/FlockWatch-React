import { type FC } from "react";
import { SiteRecord } from "../../Hooks/useSitesData";

/** Props for the RecentConfirmations component. */
interface Props {
    sites: SiteRecord[];
}

/** A county-level group of HPAI sites. */
interface CountyGroup {
    county: string;
    state: string;
    hasActive: boolean;
    productionTypes: string[];
    totalBirds: number;
    siteCount: number;
    mostRecentDate: string;
}

function formatDate(iso: string): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(iso));
}

function groupByCounty(sites: SiteRecord[]): CountyGroup[] {
    const groups = new Map<string, CountyGroup>();

    for (const site of sites) {
        const key = `${site.county}|${site.state}`;
        const existing = groups.get(key);

        if (existing) {
            existing.hasActive =
                existing.hasActive || site.status === "active";
            if (
                !existing.productionTypes.includes(site.production_type)
            ) {
                existing.productionTypes.push(site.production_type);
            }
            existing.totalBirds += site.birds_affected;
            existing.siteCount += 1;
            if (
                new Date(site.confirmed_diagnosis_date) >
                new Date(existing.mostRecentDate)
            ) {
                existing.mostRecentDate =
                    site.confirmed_diagnosis_date;
            }
        } else {
            groups.set(key, {
                county: site.county,
                state: site.state,
                hasActive: site.status === "active",
                productionTypes: [site.production_type],
                totalBirds: site.birds_affected,
                siteCount: 1,
                mostRecentDate: site.confirmed_diagnosis_date,
            });
        }
    }

    return [...groups.values()];
}

/** Recent HPAI confirmations grouped by county, sorted by most recent. */
const RecentConfirmations: FC<Props> = ({ sites }) => {
    const grouped = groupByCounty(sites)
        .sort(
            (a, b) =>
                new Date(b.mostRecentDate).getTime() -
                new Date(a.mostRecentDate).getTime()
        )
        .slice(0, 5);

    return (
        <div className="recent-confirmations">
            <h3 className="recent-confirmations-title">
                Recent Confirmations
            </h3>
            {grouped.map((g) => (
                <div
                    className="recent-confirmation-entry"
                    key={`${g.county}|${g.state}`}
                >
                    <span
                        className={`status-dot ${g.hasActive ? "dot-active" : "dot-older"}`}
                    />
                    <div className="entry-content">
                        <div className="entry-main">
                            <strong>
                                {g.county}, {g.state}
                            </strong>
                        </div>
                        <div className="entry-sub">
                            {g.productionTypes.join(", ")} &middot;{" "}
                            {g.totalBirds.toLocaleString()} birds
                            {g.siteCount > 1 &&
                                ` (${g.siteCount} sites)`}
                        </div>
                        <div className="entry-date">
                            {formatDate(g.mostRecentDate)}
                        </div>
                    </div>
                </div>
            ))}
            <div className="recent-confirmations-legend">
                <span className="legend-item">
                    <span className="status-dot dot-active" /> Red = active
                </span>
                <span className="legend-item">
                    <span className="status-dot dot-older" /> Amber = older
                    active
                </span>
            </div>
        </div>
    );
};

export default RecentConfirmations;
