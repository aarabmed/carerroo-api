require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = require("./app");

const port = process.env.PORT || 3030;

const databaseUrl = process.env.DATABASE_URL;

const server = express();

server.use(app);

mongoose
  .connect(databaseUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => {
    server.listen(port, () => {
      console.log(
        `connection successed, Server running at http://localhost:${port}/api/`,
      );
    });
  })
  .catch((err) => {
    console.log("Error while connecting to database:", err);
    //process.exit(1);
  });
