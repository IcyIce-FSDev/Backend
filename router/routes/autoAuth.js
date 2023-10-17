const express = require("express");
const { request } = require("undici");
const axios = require("axios");

const pgPool = require("../../libs/db");

const router = express.Router();

router.get("/", async (req, res) => {
  const user = req.session.user;

  if (user) {
    // If user is found in the session, send it in the response
    res.json(user); // You can also use res.send(user) if user is not an object
  } else {
    // If user is not authenticated, send a message or an appropriate status code
    res.json({ isAuth: false });
  }
});

module.exports = router;
