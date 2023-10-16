const pg = require("pg");

// Initialize DB pool
const pgPool = new pg.Pool({
  // Add your PostgreSQL database configuration here
  user: "postgres",
  host: "localhost",
  database: "gamersgrouping",
  password: "ckz28myk",
  port: 5432, // Change the port as needed
});

module.exports = pgPool;
