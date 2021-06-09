const dotenv = require("dotenv");
dotenv.config();

const express = require("express");

const app = express();

app.get("/", function (req, res) {
  return res.send("Hello World");
});

const port = process.env.PORT || 5000;
const server = app.listen(7000, () => {
  console.log(`Server is running ${port}`);
});

module.exports = server;
