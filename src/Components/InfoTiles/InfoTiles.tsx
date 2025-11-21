export interface InfoTileProps {
    title: string;
    id: string;
    amount: string;
    bgColor: string;
    icon: string;
}
export default function InfoTiles({
    title,
    id,
    amount,
    bgColor,
    icon,
}: InfoTileProps) {
    const labelId = `${id}-label`;
    const valueId = `${id}-value`;

    return (
        <div
            style={{ backgroundColor: bgColor }}
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
