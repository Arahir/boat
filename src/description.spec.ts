import { dataToDescription } from "./description";
import { descriptionData } from "./fixtures";
import { getNextDay, formatDate } from "./date";

describe("Description Parsing", () => {
  let data: any;
  beforeEach(() => {
    data = { ...descriptionData };
  });
  describe("billing period", () => {
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
  });
});
