export interface KpiTileProps {
    title: string;
    id: string;
    amount: string;
    bgColor: string;
    icon: string;
    subtext?: string;
}
export default function KpiTiles({
    title,
    id,
    amount,
    bgColor,
    icon,
    subtext,
}: KpiTileProps) {
    const labelId = `${id}-label`;
    const valueId = `${id}-value`;
    const subtextId = subtext ? `${id}-subtext` : undefined;

    return (
        <div
            style={{ border: `2px solid ${bgColor}` }}
            className="tile-container"
            title={title}
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
            <div className="tile-icon">
                <img src={icon} alt={`${title} Icon`} />
            </div>
        </div>
    );
}
