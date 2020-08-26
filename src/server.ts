import bodyParser from "body-parser";
import express from "express";
import { getTotalPrice } from "./storage-billing";
import { Description } from "./types";
import { dataToDescription } from "./description";

const app = express();
const port = 8080;
app.use(bodyParser.json());
app.post("/storage-billing", (req, res) => {
  try {
    const description: Description = dataToDescription(req.body);
    const storageBilling = getTotalPrice(description);
    res.send(storageBilling);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error.message });
  }
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
