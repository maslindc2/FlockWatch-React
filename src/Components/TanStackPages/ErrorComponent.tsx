export default function ErrorComponent() {
    return (
        <div className="error-page">
            <div className="error-icon">
                <img src="/flock-error.png" alt="Error page icon"/>
            </div>
            <div className="error-text">
                <h1>So Sorry!</h1>
                <h2>We ran into some problems getting the page you were looking for</h2>
                <h3>Please try again later!</h3>
            </div>
            
        </div>
    )
}