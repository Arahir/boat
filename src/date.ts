import { addDays, format, parseISO as fnsParseISO } from "date-fns";

const DATE_FORMAT = "yyyy-MM-dd";
export function getNextDay(day: Date): Date {
  return addDays(day, 1);
}

export function formatDate(date: Date): string {
  return format(date, DATE_FORMAT);
}

// This is a hack to resolve parseISO(2020-12-30) = 2020-12-29
// a better option would be to validate dates another way
// moment might be better than date-fns at handling timezone
export function parseISO(date: string) {
  if (date && date.lastIndexOf("Z") === date.length - 1) {
    return fnsParseISO(date);
  }

  return fnsParseISO(`${date}Z`);
}
