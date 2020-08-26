import { v4 as uuidv4 } from "uuid";
import {
  Description,
  BillingPeriod,
  Product,
  Size,
  InboundShipment,
} from "./types";
import { parseISO } from "./date";

export const descriptionData = {
  billing_period: {
    from_date: "2020-12-30",
    to_date: "2020-12-31",
  },
  daily_inventory: {
    "2020-12-30": [
      { product: "BGBL-TSHIRT-BLUS", quantity: 9 },
      { product: "BGBL-TSHIRT-BLUM", quantity: 15 },
      { product: "BGBL-TSHIRT-BLUL", quantity: 90 },
    ],
    "2020-12-31": [
      { product: "BGBL-TSHIRT-BLUS", quantity: 9 },
      { product: "BGBL-TSHIRT-BLUM", quantity: 15 },
      { product: "BGBL-TSHIRT-BLUL", quantity: 33 },
    ],
  },
  inbound_shipments: [
    {
      id: "BGBLINEU00001",
      lines: [
        { product: "BGBL-TSHIRT-BLUS", quantity: 3 },
        { product: "BGBL-TSHIRT-BLUM", quantity: 15 },
        { product: "BGBL-TSHIRT-BLUL", quantity: 30 },
      ],
      offload_complete_time: "2020-12-01T13:00:00Z",
    },
    {
      id: "BGBLINEU00001",
      lines: [
        { product: "BGBL-TSHIRT-BLUS", quantity: 3 },
        { product: "BGBL-TSHIRT-BLUL", quantity: 30 },
      ],
      offload_complete_time: "2020-12-11T13:00:00Z",
    },
    {
      id: "BGBLINEU00001",
      lines: [
        { product: "BGBL-TSHIRT-BLUS", quantity: 3 },
        { product: "BGBL-TSHIRT-BLUL", quantity: 30 },
      ],
      offload_complete_time: "2020-12-21T13:00:00Z",
    },
    {
      id: "BGBLINEU00001",
      lines: [
        { product: "BGBL-TSHIRT-BLUS", quantity: 3 },
        { product: "BGBL-TSHIRT-BLUL", quantity: 30 },
      ],
      offload_complete_time: "2021-01-21T13:00:00Z",
    },
  ],
  products: [
    { id: "BGBL-TSHIRT-BLUS", size: "S", create_time: "2020-11-01T13:22:33Z" },
    { id: "BGBL-TSHIRT-BLUM", size: "M", create_time: "2020-10-01T13:11:31Z" },
    { id: "BGBL-TSHIRT-BLUL", size: "L", create_time: "2020-10-01T13:11:31Z" },
  ],
};
const productList: Product[] = [
  makeProduct("BGBL-TSHIRT-BLUS", "S"),
  makeProduct("BGBL-TSHIRT-BLUM", "M"),
  makeProduct("BGBL-TSHIRT-BLUL", "L"),
];

const period = makeBillingPeriod("2020-12-30", "2020-12-31");
export function makeDescription({
  inboundShipments = [],
  billingPeriod = period,
  dailyInventory = {},
  products = productList,
}: Partial<Description>): Description {
  const period = billingPeriod;

  return {
    billingPeriod: period,
    dailyInventory,
    inboundShipments,
    products,
  };
}

export function makeBillingPeriod(from: string, to: string): BillingPeriod {
  return {
    fromDate: parseISO(from),
    toDate: parseISO(to),
  };
}

export function makeShipment(
  product: string,
  quantity: number,
  date: string
): InboundShipment {
  return {
    id: uuidv4(),
    lines: [{ product, quantity }],
    offloadCompleteTime: parseISO(date),
  };
}

export function makeProduct(name: string, size: Size): Product {
  return {
    id: name,
    size,
    createTime: parseISO("2020-01-01"),
  };
}
