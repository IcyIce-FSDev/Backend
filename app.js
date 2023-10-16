// Module requirements
const express = require("express");
const session = require("express-session");
const pg = require("pg");
const PgSession = require("connect-pg-simple")(session);
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

// Routes imports
const discord = require("./routes/discord");

// Start of program
const app = express();
const port = process.env.PORT;

// Initialize DB pool
const pgPool = new pg.Pool({
  // Add your PostgreSQL database configuration here
  user: "postgres",
  host: "localhost",
  database: "gamersgrouping",
  password: "ckz28myk",
  port: 5432, // Change the port as needed
});

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

app.use("/discord", discord);

app.listen(port, () => {
  console.log(`Dev app listening on port ${port}`);
});
