import { addDays, format } from "date-fns";

const DATE_FORMAT = 'yyyy-MM-dd'
export function getNextDay(day: Date): Date {
  return addDays(day, 1)
}

export function formatDate(date: Date): string {
  return format(date, DATE_FORMAT)
}