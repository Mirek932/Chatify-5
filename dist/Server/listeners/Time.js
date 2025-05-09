import date from "date-and-time";
export function currentTime() {
    const now = new Date();
    return date.format(now, 'YYYY/MM/DD HH:mm');
}
