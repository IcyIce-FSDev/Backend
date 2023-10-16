const express = require("express");
const { request } = require("undici");
const axios = require("axios");
const router = express.Router();

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

// middleware if access token granted, creates user in database for website
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

// define the home page route
https: router.post("/login", async (req, res) => {
  const { oauthData, user } = req;

  console.log(oauthData);
  console.log(user);

  res.send("Request seen to create user from discord login");

  // // Access the session ID from req.sessionID
  // const sessionID = req.sessionID;

  // try {
  //   // Set the session ID as a cookie with the key 'connect.sid'
  //   res.cookie("connect.sid", sessionID);
  //   console.log("Cookie set and being sent");
  // } catch (error) {
  //   console.log(error);
  // }
});

module.exports = router;
