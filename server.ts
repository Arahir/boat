import {
  Description,
  Product,
  ProductQuantity,
  Size,
  InboundShipment,
} from "./types";
import { isBefore, isEqual, compareAsc } from "date-fns";
import { dataToDescription } from "./description";
import { formatDate, getNextDay } from "./date";

type SizeByProduct = Record<string, Size>;

function getInventoryPrice(
  inventory: ProductQuantity[],
  date: Date,
  sizeByProduct: SizeByProduct
) {
  for (let inventoryItem of inventory) {
    console.log(inventoryItem);
    console.log(sizeByProduct[inventoryItem.product]);
    if (!inventoryItem.product) {
      throw new Error("Missing product in inventory");
    }
    if (!inventoryItem.quantity) {
      throw new Error("Missing quantity in inventory");
    }
    if (!sizeByProduct[inventoryItem.product]) {
      throw new Error(`Missing size for product ${inventoryItem.product}`);
    }
  }
}

// {product1: {2020-11-04: 33, 2020-12-01: 22}}
type Stock = Record<string, Record<string, number>>;
function getStock(shipments: InboundShipment[]): Stock {
  const orderedShipments = shipments.sort(
    (shipment1: InboundShipment, shipment2: InboundShipment) => {
      return compareAsc(
        shipment1.offloadCompleteTime,
        shipment2.offloadCompleteTime
      );
    }
  );

  return orderedShipments.reduce((stock: Stock, shipment: InboundShipment) => {
    const dateString = formatDate(shipment.offloadCompleteTime);
    for (let inventoryItem of shipment.lines) {
      if (!inventoryItem.product || !inventoryItem.quantity) {
        throw new Error("Invalid inventory Item");
      }
      const productStock = stock[inventoryItem.product];
      if (productStock) {
        if (productStock[dateString]) {
          productStock[dateString] += inventoryItem.quantity;
        } else {
          productStock[dateString] = inventoryItem.quantity;
        }
      } else {
        stock[inventoryItem.product] = { [dateString]: inventoryItem.quantity };
      }
    }
    return stock;
  }, {});
}

function getSizeByProduct(products: Product[]): SizeByProduct {
  return products.reduce(
    (sizeByProduct: Record<string, Size>, product: Product) => {
      if (
        sizeByProduct[product.id] &&
        sizeByProduct[product.id] !== product.size
      ) {
        throw new Error("a product cannot have different size");
      }
      return {
        ...sizeByProduct,
        [product.id]: product.size,
      };
    },
    {}
  );
}

export function getTotalPrice(data: any) {
  const description: Description = dataToDescription(data);
  const { fromDate, toDate } = description.billingPeriod;
  const sizeByProduct = getSizeByProduct(description.products);
  const stock = getStock(description.inboundShipments);
  console.log(stock);
  let date = fromDate;
  while (isBefore(date, toDate) || isEqual(date, toDate)) {
    const dateString = formatDate(date);
    const inventory: ProductQuantity[] = description.dailyInventory[dateString];
    if (!inventory) {
      throw new Error(`Missing inventory for day ${dateString}`);
    }
    const price = getInventoryPrice(inventory, date, sizeByProduct);
    date = getNextDay(date);
  }
}

const data = {
  billing_period: {
    from_date: "2020-12-30",
    to_date: "2020-12-31",
  },
  daily_inventory: {
    "2020-12-30": [
      {
        product: "BGBL-TSHIRT-BLUS",
        quantity: 32,
      },
      {
        product: "BGBL-TSHIRT-BLUM",
        quantity: 3,
      },
      {
        product: "BGBL-TSHIRT-BLUL",
        quantity: 3,
      },
    ],
    "2020-12-31": [
      {
        product: "BGBL-TSHIRT-BLUS",
        quantity: 3,
      },
      {
        product: "BGBL-TSHIRT-BLUM",
        quantity: 13,
      },
      {
        product: "BGBL-TSHIRT-BLUL",
        quantity: 33,
      },
    ],
  },
  inbound_shipments: [
    {
      id: "BGBLINEU00001",
      lines: [
        {
          product: "BGBL-TSHIRT-BLUS",
          quantity: 3,
        },
        {
          product: "BGBL-TSHIRT-BLUL",
          quantity: 30,
        },
      ],
      offload_complete_time: "2020-12-01T13:00:00Z",
    },
  ],
  products: [
    {
      id: "BGBL-TSHIRT-BLUS",
      size: "S", // overall object size, can be XS,S,M,L
      create_time: "2020-11-01T13:22:33Z",
    },
    {
      id: "BGBL-TSHIRT-BLUM",
      size: "M",
      create_time: "2020-10-01T13:11:31Z",
    },
    {
      id: "BGBL-TSHIRT-BLUL",
      size: "L",
      create_time: "2020-10-01T13:11:31Z",
    },
  ],
};

getTotalPrice(data);
