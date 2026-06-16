/** Banner shown when rendered data may be stale due to fetch failure. */
export default function StaleDataBanner({
  lastUpdated,
}: {
  lastUpdated: string | null;
}) {
  if (!lastUpdated) return null;

  return (
    <div className="stale-data-banner" role="alert">
      <span>
        Unable to refresh data — showing cached version from{" "}
        <strong>{lastUpdated}</strong>
      </span>
    </div>
  );
}
