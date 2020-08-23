import {
  Description,
  BillingPeriod,
  InboundShipment,
  ProductQuantity,
  Product,
  Size,
} from "./types";
import { parseISO, isAfter, isValid } from "date-fns";

export function parseBillingPeriod(billingPeriod?: {
  from_date?: string;
  to_date?: string;
}): BillingPeriod {
  if (!billingPeriod || !billingPeriod.from_date || !billingPeriod.to_date) {
    throw new Error("ERROR_DESCRIPTION");
  }
  const fromDate = parseISO(billingPeriod.from_date);
  const toDate = parseISO(billingPeriod.to_date);

  if (!isValid(fromDate) || !isValid(toDate) || isAfter(fromDate, toDate)) {
    throw new Error("ERROR_DESCRIPTION");
  }

  return {
    fromDate,
    toDate,
  };
}

interface ShipmentData {
  id?: string;
  lines?: ProductQuantity[];
  offload_complete_time?: string;
}

function parseInboundShipment(shipment: ShipmentData): InboundShipment {
  if (
    !shipment.id ||
    !Array.isArray(shipment.lines) ||
    !shipment.offload_complete_time
  ) {
    throw new Error("ERROR_DESCRIPTION");
  }

  const offloadCompleteTime = parseISO(shipment.offload_complete_time);

  if (!isValid(offloadCompleteTime)) {
    throw new Error("ERROR_DESCRIPTION");
  }

  return {
    id: shipment.id,
    lines: shipment.lines,
    offloadCompleteTime,
  };
}

function parseInboundShipments(shipments?: Array<ShipmentData>) {
  if (!Array.isArray(shipments)) {
    throw new Error("ERROR_DESCRIPTION");
  }

  return shipments.map(parseInboundShipment);
}

function parseDailyInventory(inventory: Record<string, ProductQuantity[]>) {
  if (
    !inventory ||
    Array.isArray(inventory) ||
    !(typeof inventory === "object")
  ) {
    throw new Error("ERROR_DESCRIPTION");
  }

  return inventory;
}

interface DataProduct {
  id?: string;
  size?: string;
  create_time?: string;
}

function parseProduct(product: DataProduct): Product {
  if (
    !product.id ||
    !product.size ||
    !(product.size in Size) ||
    !product.create_time
  ) {
    throw new Error("DESCRIPTION_ERROR");
  }
  const createTime = parseISO(product.create_time);

  return {
    id: product.id,
    size: (product.size as unknown) as Size,
    createTime,
  };
}

function parseProducts(products?: DataProduct[]) {
  if (!Array.isArray(products)) {
    throw new Error("ERROR_DESCRIPTION");
  }

  return products.map(parseProduct);
}

export function dataToDescription(data: any): Description {
  const billingPeriod: BillingPeriod = parseBillingPeriod(data.billing_period);
  const inboundShipments: InboundShipment[] = parseInboundShipments(
    data.inbound_shipments
  );
  const dailyInventory = parseDailyInventory(data.daily_inventory);
  const products: Product[] = parseProducts(data.products);

  return {
    billingPeriod,
    inboundShipments,
    dailyInventory,
    products,
  };
}
