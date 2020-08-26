import { dataToDescription } from "./description";
import { descriptionData } from "./fixtures";
import { getNextDay, formatDate, parseISO } from "./date";
import { ProductQuantity, InboundShipment } from "./types";

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
});
