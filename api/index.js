#!/usr/bin/env node
require("dotenv-flow").config();

const cors = require("cors");

// Import expressinde
const express = require("express");
// Import Body parser
const bodyParser = require("body-parser");
// Import Mongoose
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
// Initialise the app
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

// Setup environment variables
const port = process.env.PORT || 3000;
const dbUser = process.env.DBUSER || "web3idpre";
const dbPass = process.env.DBPASS || "password";
const dbHost = process.env.DBHOST || "localhost";
const dbName = process.env.DBNAME || "web3idpre";
const dbPort = process.env.DBPOPT || "27017";
const avatar = process.env.AVATAR_DIRECTORY || 'avatar';

BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Import routes
const apiRoutes = require("./api-routes");
// Configure bodyparser to handle post requests
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
// Connect to Mongoose and set connection variable

// Display avatar from URL
app.use('/' + avatar, express.static(avatar));

mongoose
  .connect(
    "mongodb://" +
      dbUser +
      ":" +
      dbPass +
      "@" +
      dbHost +
      ":" +
      dbPort +
      "/" +
      dbName +
      "?authSource=admin",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .catch(function (err) {
    console.log("DB connection failed: " + err.message);
    process.exit(1);
  });

// Send message for default URL
app.get("/", (req, res) => res.status(404).end());

// Use Api routes in the App
app.use("/", apiRoutes);
// Launch app to listen to specified port
app.listen(port, function () {
  console.log("Running web3 Id API on port " + port);
});
