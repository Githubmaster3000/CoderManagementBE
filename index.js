const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const api = require("./api");
const app = express();

app.use(express.json());

const port = 3000; // You can use any available port

const uri = process.env.MONGODB_URI;

app.use("/api", api);

mongoose
  .connect(uri)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  });
