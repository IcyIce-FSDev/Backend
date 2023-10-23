const express = require("express");
const pgPool = require("../../libs/db");
const axios = require("axios");

// Random JS functions needed below
function needUpdate(data) {
  // Assuming data is the object you provided
  const lastUpdateTimestamp = new Date(data.last_update);
  const currentTimestamp = new Date();

  // Calculate the time difference in milliseconds
  const timeDifference = currentTimestamp - lastUpdateTimestamp;

  // Convert 6 hours to milliseconds
  const sixHoursInMilliseconds = 6 * 60 * 60 * 1000;

  // Check if it has been at least 6 hours
  return timeDifference >= sixHoursInMilliseconds;
}

// Start of url is /api/ow2
const router = express.Router();

router.get("/", async (req, res) => {
  const { session } = req;

  // Will check if data was previously retrieved in last 6 hours, if so will return already cached data
  try {
    const sttm = `
  SELECT *
  FROM overwatchgamedata
  WHERE user_id = $1
  ORDER BY id DESC
  LIMIT 1;
  `;

    const values = [session.user.id];

    const lastData = await pgPool.query(sttm, values);

    if (lastData.rowCount > 0) {
      const data = lastData.rows[0];

      const update = needUpdate(data.last_update);

      if (!update) {
        res.json({ playerData: data.data, last_update: data.last_update });
        return;
      }
    }
  } catch (error) {
    console.error("Error getting user game data:", error);
    res.status(500).json({ status: false, error: "Internal server error" });
  }

  // Getting player data, save to DB and return data
  try {
    const sttm = `
      SELECT options
      FROM usergamesettings
      WHERE user_id = $1 AND game_id = 1
      `;

    const values = [session.user.id];

    const playerOptions = await pgPool.query(sttm, values);

    if (playerOptions.rows[0].options.data) {
      const battleTag = playerOptions.rows[0].options.data;
      // Got battletag, now to get data
      const formatTag = battleTag.replace(/#/g, "-");

      const webData = await axios.get(
        `https://overfast-api.tekrop.fr/players/${formatTag}`
      );

      const sttm1 = `
      INSERT INTO overwatchgamedata(user_id, data, last_update)
      VALUES ($1, $2, $3)
      RETURNING *;
      `;

      const values1 = [
        session.user.id,
        JSON.stringify(webData.data),
        new Date().toISOString(),
      ];

      try {
        const dbSave = await pgPool.query(sttm1, values1);

        const jsonResp = {
          playerData: dbSave.rows[0].data,
          last_update: dbSave.rows[0].last_update,
        };

        res.json(jsonResp);
      } catch (error) {
        console.error("Error saving user game options:", error);
        res.status(500).json({ status: false, error: "Internal server error" });
      }
    } else {
      console.error("Error getting user game options:", error);
      res.status(500).json({ status: false, error: "Internal server error" });
    }
  } catch (error) {
    console.error("Error getting user game options:", error);
    res.status(500).json({ status: false, error: "Internal server error" });
  }
});

module.exports = router;
