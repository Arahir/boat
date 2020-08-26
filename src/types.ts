export type Size = "XS" | "S" | "M" | "L";
export const SizeList: Record<string, boolean> = {
  XS: true,
  S: true,
  M: true,
  L: true,
};

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

// {perDate: {2020-12-11: 40}, inboundShipments: [new Date('2020-12-11')]}
export interface ProductStock {
  perDate: Record<string, number>;
  inboundShipments?: Date[];
}
export type Stock = Record<string, ProductStock>;

// {"BGBL-TSHIRT-BLUS": "S"}
export type SizeByProduct = Record<string, Size>;
