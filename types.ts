// {
// 	"billing_period": {
// 		"from_date": "2020-12-15",
// 		"to_date": "2020-12-31"
// 	},
// 	"daily_inventory": [
// 		"2020-12-30": [
// 			{
// 				"product": "BGBL-TSHIRT-BLUS",
// 				"quantity": 32
// 			},
// 			{
// 				"product": "BGBL-TSHIRT-BLUM",
// 				"quantity": 3
// 			},
// 			{
// 				"product": "BGBL-TSHIRT-BLUL",
// 				"quantity": 3
// 			},
// 		],
// 		"2020-12-31": [
// 			{
// 				"product": "BGBL-TSHIRT-BLUS",
// 				"quantity": 3
// 			},
// 			{
// 				"product": "BGBL-TSHIRT-BLUM",
// 				"quantity": 13
// 			},
// 			{
// 				"product": "BGBL-TSHIRT-BLUL",
// 				"quantity": 33
// 			}
// 		]
// 	],
// 	"inbound_shipments": [
// 		{
// 			"id": "BGBLINEU00001",
// 			"lines": [
// 				{
// 					"product": "BGBL-TSHIRT-BLUS",
// 					"quantity": 3
// 				},
// 				{
// 					"product": "BGBL-TSHIRT-BLUL",
// 					"quantity": 30
// 				}
// 			],
// 			"offload_complete_time": "2020-12-01T13:00:00Z"
// 		}
// 	],
// 	"products": [
// 		{
// 			"id": "BGBL-TSHIRT-BLUS",
// 			"size": "S", // overall object size, can be XS,S,M,L
// 			"create_time": "2020-11-01T13:22:33Z"
// 		},
// 		{
// 			"id": "BGBL-TSHIRT-BLUM",
// 			"size": "S",
// 			"create_time": "2020-10-01T13:11:31Z"
// 		}
// 	]
// }

export enum Size {
  XS,
  S,
  M,
  L
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
};

export interface Description {
  billingPeriod: BillingPeriod,
  dailyInventory: Record<string, ProductQuantity>,
  inboundShipments: InboundShipment[],
  products: Product[]
}