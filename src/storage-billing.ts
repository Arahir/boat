import {
  Description,
  Product,
  ProductQuantity,
  Size,
  InboundShipment,
  Stock,
  SizeByProduct,
} from "./types";
import {
  isBefore,
  isEqual,
  compareDesc,
  differenceInCalendarDays,
} from "date-fns";
import { formatDate, getNextDay, parseISO } from "./date";

const priceTable: Record<number, Record<string, number>> = {
  1: {
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
  },
  2: {
    XS: 0.2,
    S: 0.7,
    M: 0.17,
    L: 0.29,
  },
  3: {
    XS: 0.3,
    S: 0.11,
    M: 0.19,
    L: 0.31,
  },
  4: {
    XS: 0.5,
    S: 0.13,
    M: 0.23,
    L: 0.37,
  },
};

function getDurationGroup(duration: number): number {
  if (duration < 16) {
    return 1;
  } else if (duration < 183) {
    return 2;
  } else if (duration < 366) {
    return 3;
  }

  return 4;
}

function calculatePrice(
  currentDate: Date,
  startStockDate: Date,
  productSize: Size,
  quantity: number
) {
  const duration = differenceInCalendarDays(currentDate, startStockDate);
  const durationGroup = getDurationGroup(duration);
  const priceForDurationAndSize = priceTable[durationGroup][productSize];

  return priceForDurationAndSize * quantity;
}

function getInventoryPrice(
  inventory: ProductQuantity[],
  inventoryDate: Date,
  sizeByProduct: SizeByProduct,
  stock: Stock
) {
  let totalPrice = 0;
  for (let inventoryItem of inventory) {
    if (!inventoryItem.product) {
      throw new Error("Missing product in inventory");
    }
    if (inventoryItem.quantity == null || inventoryItem.quantity < 0) {
      throw new Error("Missing quantity in inventory");
    }
    if (!sizeByProduct[inventoryItem.product]) {
      throw new Error(`Missing size for product ${inventoryItem.product}`);
    }

    if (inventoryItem.quantity === 0) {
      continue;
    }
    const productSize = sizeByProduct[inventoryItem.product];
    const productStock = stock[inventoryItem.product];
    if (!productStock || !productStock.inboundShipments) {
      throw new Error("no inbound shipments for product");
    }
    const deliveriesBeforeDate = productStock.inboundShipments.filter(
      (shipmentDate) => isBefore(shipmentDate, inventoryDate)
    );

    if (deliveriesBeforeDate.length === 0) {
      throw new Error("too much product before inbound shipment");
    }

    let quantityForDay = inventoryItem.quantity;
    const priceForProduct = deliveriesBeforeDate.reduce(
      (price: number, deliveryDate: Date) => {
        if (quantityForDay === 0) {
          return price;
        }
        const deliveryDateString = formatDate(deliveryDate);
        const quantityForShipment = productStock.perDate[deliveryDateString];
        if (quantityForShipment >= quantityForDay) {
          const tmpPrice = calculatePrice(
            inventoryDate,
            deliveryDate,
            productSize,
            quantityForDay
          );
          price += tmpPrice;
          quantityForDay = 0;
        } else {
          const tmpPrice = calculatePrice(
            inventoryDate,
            deliveryDate,
            productSize,
            quantityForShipment
          );
          price += tmpPrice;
          quantityForDay -= quantityForShipment;
        }
        return price;
      },
      0
    );

    if (quantityForDay !== 0) {
      throw new Error("Too much product in daily inventory");
    }

    totalPrice += priceForProduct;
  }

  return totalPrice;
}

function getStock(shipments: InboundShipment[], toDate: Date): Stock {
  const stockByProduct = shipments.reduce(
    (stock: Stock, shipment: InboundShipment) => {
      const dateString = formatDate(shipment.offloadCompleteTime);
      for (let inventoryItem of shipment.lines) {
        if (!inventoryItem.product || inventoryItem.quantity == null) {
          throw new Error("Invalid inventory Item");
        }
        const productStock = stock[inventoryItem.product];
        if (productStock) {
          if (productStock.perDate[dateString]) {
            productStock.perDate[dateString] += inventoryItem.quantity;
          } else {
            productStock.perDate[dateString] = inventoryItem.quantity;
          }
        } else {
          stock[inventoryItem.product] = {
            perDate: {
              [dateString]: inventoryItem.quantity,
            },
          };
        }
      }
      return stock;
    },
    {}
  );

  const productNames = Object.keys(stockByProduct);

  for (let productName of productNames) {
    const deliveryDateString = Object.keys(stockByProduct[productName].perDate);
    const deliveryDates = deliveryDateString
      .map((dateString) => parseISO(dateString))
      .filter((date) => isBefore(date, toDate))
      .sort(compareDesc);
    stockByProduct[productName].inboundShipments = deliveryDates;
  }

  // ajouté pour chaque produit la liste des dates de shipment
  // dois je checker les inconvsistences du genre le nombre de produit augmente dans le daily inventory alors qu'il n'y a pas eu d'inbound shipment?
  //

  return stockByProduct;
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

export function getTotalPrice(description: Description) {
  // transform data into Description
  const { fromDate, toDate } = description.billingPeriod;

  const sizeByProduct = getSizeByProduct(description.products);
  const stock = getStock(description.inboundShipments, toDate);

  let date = fromDate;

  const pricePerDay: Record<string, number> = {};

  while (isBefore(date, toDate) || isEqual(date, toDate)) {
    const dateString = formatDate(date);
    const inventory: ProductQuantity[] = description.dailyInventory[dateString];
    if (!inventory) {
      console.log("missing inventory");
      throw new Error(`Missing inventory for day ${dateString}`);
    }
    const price: number = getInventoryPrice(
      inventory,
      date,
      sizeByProduct,
      stock
    );
    pricePerDay[dateString] = price;
    date = getNextDay(date);
  }

  return pricePerDay;
}
