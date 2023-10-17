const express = require("express");

// List of imported routes
const discordRouter = require("./routes/discord.js");
const autoAuth = require("./routes/autoAuth.js");

const routeHandler = express.Router();

routeHandler.use("/discord/login", discordRouter);

routeHandler.use("/api/autoauth", autoAuth);

module.exports = routeHandler;
