import { getTotalPrice } from "./storage-billing";
import { makeDescription } from "./fixtures";
import { getNextDay, formatDate } from "./date";

describe("getTotalPrice", () => {
  it("should throw if start period is after end period", () => {
    const description = makeDescription();
    const from = new Date();
    const to = getNextDay(from);
    description.billingPeriod = { fromDate: to, toDate: from };

    expect(() => getTotalPrice(description)).toThrow();
  });
});

const data = {
  billing_period: {
    from_date: "2020-12-30",
    to_date: "2020-12-31",
  },
  daily_inventory: {
    "2020-12-30": [
      {
        product: "BGBL-TSHIRT-BLUS",
        quantity: 9,
      },
      {
        product: "BGBL-TSHIRT-BLUM",
        quantity: 15,
      },
      {
        product: "BGBL-TSHIRT-BLUL",
        quantity: 90,
      },
    ],
    "2020-12-31": [
      {
        product: "BGBL-TSHIRT-BLUS",
        quantity: 9,
      },
      {
        product: "BGBL-TSHIRT-BLUM",
        quantity: 15,
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
          product: "BGBL-TSHIRT-BLUM",
          quantity: 15,
        },
        {
          product: "BGBL-TSHIRT-BLUL",
          quantity: 30,
        },
      ],
      offload_complete_time: "2020-12-01T13:00:00Z",
    },
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
      offload_complete_time: "2020-12-11T13:00:00Z",
    },
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
      offload_complete_time: "2020-12-21T13:00:00Z",
    },
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
      offload_complete_time: "2021-01-21T13:00:00Z",
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
