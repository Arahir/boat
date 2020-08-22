import { Description } from "./types";
import { isAfter } from "date-fns";
import { dataToDescription } from "./description";

export function getTotalPrice(data: any) {
  const description = dataToDescription(data)
  const {fromDate, toDate} = description.billingPeriod;
}