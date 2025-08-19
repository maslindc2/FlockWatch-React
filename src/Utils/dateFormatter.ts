export default function formatDateForUser(date: string): string {
    const dateConverted: Date = new Date(date)
    const userLocale = navigator.language || "en-us";
    return new Intl.DateTimeFormat(userLocale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(dateConverted);
}