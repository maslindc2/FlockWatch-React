/** Props for a single KPI tile. */
export interface KpiTileProps {
    title: string;
    id: string;
    amount: string;
    bgColor: string;
    subtext?: string;
}
/** A single KPI tile displaying a label, amount, and optional subtext. */
export default function KpiTiles({
    title,
    id,
    amount,
    bgColor,
    subtext,
}: KpiTileProps) {
    const labelId = `${id}-label`;
    const valueId = `${id}-value`;
    const subtextId = subtext ? `${id}-subtext` : undefined;

    return (
        <div
            className="tile-container"
            style={{ "--tile-accent": bgColor } as React.CSSProperties}
        >
            <div className="tile-inner">
                <p id={labelId}>{title}</p>
                <h3 aria-labelledby={`${labelId} ${valueId}`}>
                    <span id={valueId}>{amount}</span>
                </h3>
                {subtext && (
                    <p id={subtextId} className="tile-subtext">
                        {subtext}
                    </p>
                )}
            </div>
        </div>
    );
}
