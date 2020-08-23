import { format } from "date-fns";
import { Description } from "./types";
import { getNextDay } from "./date";

export function makeDescription(): Description {
  const from = new Date();
  const to = getNextDay(from);
  return {
    products: [],
    inboundShipments: [],
    billingPeriod: { fromDate: from, toDate: to },
    dailyInventory: {},
  };
}
