interface InfoTileProps {
    title: string;
    amount: string;
    bgColor: string;
    icon: string;
}
export default function InfoTiles({title, amount, bgColor, icon}: InfoTileProps) {
    return (
        <div style={{backgroundColor: bgColor}} className="tile-container" title={title}>
            <div className="tile-inner">
                <p>{title}</p>
                <h3><span>{amount}</span></h3>
            </div>
            <div className="tile-icon">
                <img src={icon} alt={`${title} icon`}/>
            </div>
        </div>
    );
}