const express = require("express");

// List of imported routes
const discordRouter = require("./routes/discord.js");
const autoAuth = require("./routes/autoAuth.js");
const logout = require("./routes/logout.js");
const game = require("./routes/game.js");

const routeHandler = express.Router();

routeHandler.use("/discord/login", discordRouter);

routeHandler.use("/api/autoauth", autoAuth);

routeHandler.use("/api/logout", logout);

routeHandler.use("/api/game", game);

module.exports = routeHandler;
