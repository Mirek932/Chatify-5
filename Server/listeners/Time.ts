import date from "date-and-time";

export function currentTime():string
{
    const now = new Date();
    return date.format(now, 'YYYY/MM/DD HH:mm');
}