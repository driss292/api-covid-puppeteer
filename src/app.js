const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

require("dotenv").config();

const middlewares = require("./middlewares");
const fetchCovidData = require("./scrapper");

const app = express();

let cacheTime, data;

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/covid", async (req, res) => {
  if (cacheTime && cacheTime > Date.now() - 1000 * 60) {
    return res.json(data);
  }

  data = await fetchCovidData();
  cacheTime = Date.now();
  res.json(data);
});

app.get("/covid/:country", async (req, res) => {
  if (!data) {
    data = await fetchCovidData();
  }
  res.json(
    data.filter(
      (d) => d.country.toLowerCase() === req.params.country.toLowerCase()
    )
  );
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
