export default function InfoTiles({title, amount}) {
    console.log(title, amount);
    return (
        <div>
            <p>{title}</p>
            <h3>{amount}</h3>
        </div>
    )
}