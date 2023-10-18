const express = require("express");
const axios = require("axios");
const pgPool = require("../../libs/db");

// Custom middleware functions
async function checkAndCreateRow(req, res, next) {
  const { id, isAuth } = req.session.user;

  if (id && isAuth) {
    const sttm = `
    SELECT *
    FROM game_settings
    WHERE id = $1
    `;

    const values = [id];

    try {
      const result = await pgPool.query(sttm, values);

      if (result.rowCount == 0) {
        const sttm1 = `
        INSERT INTO game_settings(id, overwatch, osrs, fortnite)
        VALUES ($1, false, false, false)
        RETURNING *;        
        `;

        const newSettings = await pgPool.query(sttm1, values);

        req.foundUser = newSettings.rows[0];
        req.foundUser.id = "hidden";
      } else {
        req.foundUser = result.rows[0];
        req.foundUser.id = "hidden";
      }

      next();
    } catch (error) {
      console.log(error);
      res.status(500);
    }
  }
}

// Start of url is /api/game
const router = express.Router();

router.get("/settings", checkAndCreateRow, async (req, res) => {
  res.json(req.foundUser);
});

module.exports = router;
