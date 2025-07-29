export default function InfoTiles({title, amount, icon}) {
    return (
        <div>
            <p>{title}</p>
            <h3>{amount}</h3>
            <img src={icon}/>
        </div>
    )
}