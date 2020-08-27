import {
  descriptionData,
  makeBillingPeriod,
  makeShipment,
  makeProduct,
  makeDescription,
} from "./fixtures";
import {
  BillingPeriod,
  Description,
  Product,
  InboundShipment,
  ProductQuantity,
} from "./types";
import { dataToDescription } from "./description";
import { getTotalPrice } from "./storage-billing";
import { parseISO, addDays, addYears } from "date-fns";
import { formatDate } from "./date";

describe("getTotalPrice", () => {
  let data: any;
  let description: Description;
  beforeEach(() => {
    data = { ...descriptionData };
    description = dataToDescription(data);
  });
  describe("errors", () => {
    test("should fail if inventory is missing for day", () => {
      description.dailyInventory = {};
      expect(() => getTotalPrice(description)).toThrow();
    });

    test("should fail if product is missing", () => {
      description.products = description.products.filter(
        (product: Product) => product.id !== "BGBL-TSHIRT-BLUS"
      );

      expect(() => getTotalPrice(description)).toThrow();
    });

    test("should fail if inventory as more item than stock", () => {
      const productName = "BGBL-TSHIRT-BLUM";
      const productQuantity = 1;
      const shipmentDateString = "2020-12-15";
      const shipment: InboundShipment = makeShipment(
        productName,
        productQuantity,
        shipmentDateString
      );

      const shipmentDate = parseISO(shipmentDateString);
      const after = addYears(shipmentDate, 366);
      const period: BillingPeriod = {
        fromDate: after,
        toDate: after,
      };
      const dailyInventory: Record<string, ProductQuantity[]> = {
        [formatDate(after)]: [
          { product: productName, quantity: productQuantity + 2 },
        ],
      };
      const products: Product[] = [makeProduct(productName, "M")];
      const description = makeDescription({
        inboundShipments: [shipment],
        dailyInventory,
        products,
        billingPeriod: period,
      });

      expect(() => getTotalPrice(description)).toThrow();
    });
  });

  test("it should be free for 2 weeks", () => {
    const productName = "BGBL-TSHIRT-BLUM";
    const productQuantity = 1;
    const shipment: InboundShipment = makeShipment(
      productName,
      productQuantity,
      "2020-12-15"
    );
    const period = makeBillingPeriod("2020-12-16", "2020-12-16");
    const dailyInventory: Record<string, ProductQuantity[]> = {
      "2020-12-16": [{ product: productName, quantity: productQuantity }],
    };
    const products: Product[] = [makeProduct(productName, "M")];
    const description = makeDescription({
      inboundShipments: [shipment],
      dailyInventory,
      products,
      billingPeriod: period,
    });

    expect(getTotalPrice(description)).toEqual({ "2020-12-16": 0 });
  });
  test("it should start paying after 2 weeks", () => {
    const productName = "BGBL-TSHIRT-BLUM";
    const productQuantity = 1;
    const shipmentDateString = "2020-12-15";
    const shipment: InboundShipment = makeShipment(
      productName,
      productQuantity,
      shipmentDateString
    );

    const shipmentDate = parseISO(shipmentDateString);
    const after = addDays(shipmentDate, 16);
    const period: BillingPeriod = {
      fromDate: after,
      toDate: after,
    };
    const dailyInventory: Record<string, ProductQuantity[]> = {
      [formatDate(after)]: [
        { product: productName, quantity: productQuantity },
      ],
    };
    const products: Product[] = [makeProduct(productName, "M")];
    const description = makeDescription({
      inboundShipments: [shipment],
      dailyInventory,
      products,
      billingPeriod: period,
    });

    expect(getTotalPrice(description)).toEqual({
      [formatDate(after)]: 0.17,
    });
  });
  test("it should pay more after 183 days", () => {
    const productName = "BGBL-TSHIRT-BLUM";
    const productQuantity = 1;
    const shipmentDateString = "2020-12-15";
    const shipment: InboundShipment = makeShipment(
      productName,
      productQuantity,
      shipmentDateString
    );

    const shipmentDate = parseISO(shipmentDateString);
    const after = addDays(shipmentDate, 183);
    const period: BillingPeriod = {
      fromDate: after,
      toDate: after,
    };
    const dailyInventory: Record<string, ProductQuantity[]> = {
      [formatDate(after)]: [
        { product: productName, quantity: productQuantity },
      ],
    };
    const products: Product[] = [makeProduct(productName, "M")];
    const description = makeDescription({
      inboundShipments: [shipment],
      dailyInventory,
      products,
      billingPeriod: period,
    });

    expect(getTotalPrice(description)).toEqual({
      [formatDate(after)]: 0.19,
    });
  });
  test("it should pay the max after a year", () => {
    const productName = "BGBL-TSHIRT-BLUM";
    const productQuantity = 1;
    const shipmentDateString = "2020-12-15";
    const shipment: InboundShipment = makeShipment(
      productName,
      productQuantity,
      shipmentDateString
    );

    const shipmentDate = parseISO(shipmentDateString);
    const after = addYears(shipmentDate, 366);
    const period: BillingPeriod = {
      fromDate: after,
      toDate: after,
    };
    const dailyInventory: Record<string, ProductQuantity[]> = {
      [formatDate(after)]: [
        { product: productName, quantity: productQuantity },
      ],
    };
    const products: Product[] = [makeProduct(productName, "M")];
    const description = makeDescription({
      inboundShipments: [shipment],
      dailyInventory,
      products,
      billingPeriod: period,
    });

    expect(getTotalPrice(description)).toEqual({
      [formatDate(after)]: 0.23,
    });
  });

  test("it should start paying after 2 weeks", () => {
    const productName = "BGBL-TSHIRT-BLUM";
    const productQuantity = 2;
    const shipmentDateString = "2020-12-15";
    const shipment: InboundShipment = makeShipment(
      productName,
      productQuantity,
      shipmentDateString
    );

    const shipmentDate = parseISO(shipmentDateString);
    const after = addDays(shipmentDate, 16);
    const period: BillingPeriod = {
      fromDate: after,
      toDate: after,
    };
    const dailyInventory: Record<string, ProductQuantity[]> = {
      [formatDate(after)]: [
        { product: productName, quantity: productQuantity },
      ],
    };
    const products: Product[] = [makeProduct(productName, "M")];
    const description = makeDescription({
      inboundShipments: [shipment],
      dailyInventory,
      products,
      billingPeriod: period,
    });

    expect(getTotalPrice(description)).toEqual({
      [formatDate(after)]: 0.17 * productQuantity,
    });
  });
  test("it should use multiple shipments if necessary", () => {
    const productName = "BGBL-TSHIRT-BLUM";
    const productQuantity = 4;
    const shipment1DateString = "2020-12-15";
    const shipment1: InboundShipment = makeShipment(
      productName,
      productQuantity / 2,
      shipment1DateString
    );
    const shipment2DateString = "2020-12-14";
    const shipment2: InboundShipment = makeShipment(
      productName,
      productQuantity / 2,
      shipment2DateString
    );

    const shipmentDate = parseISO(shipment1DateString);
    const after = addDays(shipmentDate, 16);
    const period: BillingPeriod = {
      fromDate: after,
      toDate: after,
    };
    const dailyInventory: Record<string, ProductQuantity[]> = {
      [formatDate(after)]: [
        { product: productName, quantity: productQuantity },
      ],
    };
    const products: Product[] = [makeProduct(productName, "M")];
    const description = makeDescription({
      inboundShipments: [shipment1, shipment2],
      dailyInventory,
      products,
      billingPeriod: period,
    });

    expect(getTotalPrice(description)).toEqual({
      [formatDate(after)]: 0.17 * 2 + 0.17 * 2,
    });
  });
});
