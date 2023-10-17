// Module requirements
const express = require("express");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

// Custom Modulues
const pgPool = require("./libs/db");
const routeHandler = require("./router/routeHandler");

// Start of program
const app = express();
const port = process.env.PORT;

// Middleware setups
app.set("trust proxy", 1); // trust first proxy
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(cors());

app.use(
  session({
    store: new PgSession({
      pool: pgPool, // Use the PostgreSQL pool created earlier
      tableName: "session", // Name of the sessions table in your database
    }),
    secret: "cat-scratch-disco-fever", // Replace with your own secret key
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7, path: "/" },
  })
);

app.use("/", routeHandler);

app.listen(port, () => {
  console.log(`Dev app listening on port ${port}`);
});
