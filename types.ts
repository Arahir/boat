export enum Size {
  XS,
  S,
  M,
  L,
}

export interface Product {
  id: string;
  size: Size;
  createTime: Date;
}

export interface ProductQuantity {
  product: string;
  quantity: number;
}

export interface InboundShipment {
  id: string;
  lines: ProductQuantity[];
  offloadCompleteTime: Date;
}

export interface BillingPeriod {
  fromDate: Date;
  toDate: Date;
}

export interface Description {
  billingPeriod: BillingPeriod;
  dailyInventory: Record<string, ProductQuantity[]>;
  inboundShipments: InboundShipment[];
  products: Product[];
}
