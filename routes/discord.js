const express = require("express");
const { request } = require("undici");
const axios = require("axios");
const router = express.Router();
const pgPool = require("../libs/db");

// middleware to get access token
router.use(async (req, res, next) => {
  try {
    // Users authorization code, used to get access token
    const { authCode } = req.body;

    // Bots info
    const clientID = process.env.discord_client_id;
    const clientSecret = process.env.discord_client_secret;
    const REDIRECT_URI = "http://localhost:3000/discord";

    const tokenResponseData = await request(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: clientID,
          client_secret: clientSecret,
          code: authCode,
          grant_type: "authorization_code",
          redirect_uri: REDIRECT_URI,
          scope: "identify email",
        }).toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const oauthData = await tokenResponseData.body.json();

    if (oauthData.error) {
      throw error;
    } else {
      req.oauthData = oauthData; // Store the OAuth data in the request object
      next(); // Call the next middleware or route handler
    }
  } catch (error) {
    // Handle errors
    res.send("Error getting token");
  }
});

// middleware if access token granted, gets user info
router.use(async (req, res, next) => {
  // Access the OAuth data from req.oauthData
  const oauthData = req.oauthData;

  if (oauthData && oauthData.access_token) {
    const accessToken = oauthData.access_token;
    const scopes = oauthData.scope;

    try {
      // Make a GET request to the /users/@me endpoint
      const response = await axios.get("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        scope: scopes,
      });

      // The user object should be in the response data
      const user = response.data;

      req.user = user;

      next();
    } catch (error) {
      console.error("Error fetching user info:", error);
      res.send("Error getting token");
    }
  }

  next();
});

// Once user is fetched, will compile and upload into DB
router.use(async (req, res, next) => {
  // gets objects from req
  const { oauthData, user } = req;
  // breaks down further
  const { id, username, global_name, email, verified, discriminator } = user;
  const { token_type, access_token, refresh_token } = oauthData;
  const login = new Date();

  const sttm = `INSERT INTO users (id, username, global, email, verified, discriminator, type, token, refresh, login)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`;

  const values = [
    id,
    username,
    global_name,
    email,
    verified,
    discriminator,
    token_type,
    access_token,
    refresh_token,
    login,
  ];

  try {
    await pgPool.query(sttm, values);

    next();
  } catch (error) {
    console.log(error);
    res.send("Error getting token");
  }
});

// define the home page route
router.post("/", async (req, res) => {
  req.session.user = {
    username: req.user.username,
  };

  // Access the session ID from req.sessionID
  const sessionID = req.sessionID;

  try {
    // Set the session ID as a cookie with the key 'connect.sid'
    res.cookie("connect.sid", sessionID, { httpOnly: false });
    console.log("Cookie set and being sent");
  } catch (error) {
    console.log(error);
  }

  res.send({ success: true, username: req.user.username });
});

module.exports = router;
