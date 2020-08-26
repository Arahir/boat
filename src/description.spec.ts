import { dataToDescription } from "./description";
import { descriptionData } from "./fixtures";
import { getNextDay, formatDate, parseISO } from "./date";
import { ProductQuantity, InboundShipment, Size } from "./types";

describe("Description Parsing", () => {
  let data: any;

  beforeEach(() => {
    data = { ...descriptionData };
  });

  describe("billing period", () => {
    beforeEach(() => {
      data.billing_period = { ...data.billing_period };
    });
    test("billing_period should be defined", () => {
      delete data.billing_period;
      expect(() => dataToDescription(data)).toThrow();
    });
    test("fromDate should be defined", () => {
      delete data.billing_period.from_date;
      expect(() => dataToDescription(data)).toThrow();
    });
    test("fromDate should not be empty", () => {
      data.billing_period.from_date = "";
      expect(() => dataToDescription(data)).toThrow();
    });
    test("toDate should be defined", () => {
      delete data.billing_period.to_date;
      expect(() => dataToDescription(data)).toThrow();
    });
    test("toDate should not be empty", () => {
      data.billing_period.to_date = "";
      expect(() => dataToDescription(data)).toThrow();
    });
    test("toDate should be after fromDate", () => {
      const toDate = new Date();
      const fromDate = getNextDay(toDate);

      data.billing_period.to_date = formatDate(toDate);
      data.billing_period.from_date = formatDate(fromDate);

      expect(() => dataToDescription(data)).toThrow();
    });

    test("toDate can be equal to fromDate", () => {
      const date = new Date();

      data.billing_period.to_date = formatDate(date);
      data.billing_period.from_date = formatDate(date);

      expect(() => dataToDescription(data)).not.toThrow();
    });

    test("should parse billing_period", () => {
      const actual = dataToDescription(data).billingPeriod;
      const expected = {
        fromDate: parseISO("2020-12-30"),
        toDate: parseISO("2020-12-31"),
      };

      expect(actual).toEqual(expected);
    });
  });

  describe("inbound shipments", () => {
    let shipment: {
      id?: string;
      offload_complete_time?: string;
      lines?: ProductQuantity[];
    };

    beforeEach(() => {
      shipment = {
        id: "BGBLINEU00001",
        lines: [
          { product: "BGBL-TSHIRT-BLUS", quantity: 3 },
          { product: "BGBL-TSHIRT-BLUM", quantity: 15 },
          { product: "BGBL-TSHIRT-BLUL", quantity: 30 },
        ],
        offload_complete_time: "2020-12-01T13:00:00Z",
      };
    });

    test("inbound shipments should be define", () => {
      delete data.inbound_shipments;

      expect(() => dataToDescription(data)).toThrow();
    });

    test("shipment should have an id", () => {
      delete shipment.id;
      data.inbound_shipments = { shipment };

      expect(() => dataToDescription(data)).toThrow();
    });

    test("shipment should have lines", () => {
      delete shipment.lines;
      data.inbound_shipments = { shipment };

      expect(() => dataToDescription(data)).toThrow();
    });

    test("shipment should have a valid offload complete time", () => {
      shipment.offload_complete_time = "2020-12-32T13:00:00Z";
      data.inbound_shipments = { shipment };

      expect(() => dataToDescription(data)).toThrow();
    });

    test("should parse shipment", () => {
      data.inbound_shipments = [shipment];
      const actual = dataToDescription(data).inboundShipments;
      const expected: InboundShipment[] = [
        {
          id: shipment.id!,
          lines: shipment.lines!,
          offloadCompleteTime: parseISO(shipment.offload_complete_time!),
        },
      ];

      expect(actual).toEqual(expected);
    });
  });

  describe("dailyInventory", () => {
    test("dailyInventory should be an object", () => {
      delete data.daily_inventory;
      expect(() => dataToDescription(data)).toThrow();
      data.dailyInventory = [];
      expect(() => dataToDescription(data)).toThrow();
      data.daily_inventory = {};
      expect(() => dataToDescription(data)).not.toThrow();
    });
  });

  describe("products", () => {
    let product: { id?: string; size?: string; create_time?: string };
    beforeEach(() => {
      product = {
        id: "BGBL-TSHIRT-BLUS",
        size: "S",
        create_time: "2020-11-01T13:22:33Z",
      };
    });
    test("products should be defined", () => {
      delete data.products;
      expect(() => dataToDescription(data)).toThrow();
    });

    test("id should be defined", () => {
      delete product.id;
      data.products = [product];
      expect(() => dataToDescription(data)).toThrow();
    });
    test("size should be defined", () => {
      delete product.size;
      data.products = [product];
      expect(() => dataToDescription(data)).toThrow();
    });
    test("size should be valid", () => {
      product.size = "B";
      data.products = [product];
      expect(() => dataToDescription(data)).toThrow();
    });
    test("create_time should be defined", () => {
      delete product.create_time;
      data.products = [product];
      expect(() => dataToDescription(data)).toThrow();
    });
    test("parse product", () => {
      data.products = [product];
      const actual = dataToDescription(data).products;
      const expected = [
        {
          id: product.id!,
          size: product.size!,
          createTime: parseISO(product.create_time!),
        },
      ];

      expect(actual).toEqual(expected);
    });
  });
});
