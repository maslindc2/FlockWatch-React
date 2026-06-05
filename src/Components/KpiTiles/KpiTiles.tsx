export interface KpiTileProps {
    title: string;
    id: string;
    amount: string;
    bgColor: string;
    icon: string;
}
export default function KpiTiles({
    title,
    id,
    amount,
    bgColor,
    icon,
}: KpiTileProps) {
    const labelId = `${id}-label`;
    const valueId = `${id}-value`;

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
            </div>
            <div className="tile-icon">
                <img src={icon} alt={`${title} Icon`} />
            </div>
        </div>
    );
}
