const express = require("express");
const { request } = require("undici");
const axios = require("axios");

const pgPool = require("../../libs/db");

const router = express.Router();

router.post("/", async (req, res) => {
  if (req.session.user) {
    // If a user is found in the session, delete the session to log the user out.
    req.session.destroy((err) => {
      if (err) {
        // Handle any errors that may occur during session destruction
        console.error("Error destroying session:", err);
        res.status(500).json(false); // Send false to indicate logout failure
      } else {
        // Session destroyed successfully; the user is logged out
        res.clearCookie("connect.sid");
        res.status(200).json(true); // Send true to indicate successful logout
      }
    });
  } else {
    // If no user is found in the session, consider the user already logged out
    res.status(200).json(true); // Send true to indicate the user is already logged out
  }
});

module.exports = router;
