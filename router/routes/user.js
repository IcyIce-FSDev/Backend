const express = require("express");

const pgPool = require("../../libs/db");

// /api/user
const router = express.Router();

router.put("/gamesettings/ow2", async (req, res) => {
  try {
    const { body, session } = req;
    const { battleTag, status, game } = body;
    const { user } = session;

    const options = {
      data: battleTag,
      timestamp: new Date().toISOString(), // Current UTC time
    };

    const sttm = `
  INSERT INTO usergamesettings (user_id, game_id, options, is_active)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (user_id, game_id) DO UPDATE
  SET options = $3, is_active = $4;  
  `;

    const values = [user.id, game, JSON.stringify(options), status];

    // Execute the SQL query
    await pgPool.query(sttm, values);

    res.json({
      status: true,
      message: "User game settings updated/inserted successfully",
    });
  } catch (error) {
    console.error("Error updating/inserting user game settings:", error);
    res.status(500).json({ status: false, error: "Internal server error" });
  }
});

router.get("/gamesettings/ow2", async (req, res) => {
  try {
    const { session, query } = req;
    const { user } = session;

    const sttm = `
    SELECT options, is_active
    FROM usergamesettings
    WHERE user_id = $1 AND game_id = $2
    `;

    const values = [user.id, query.game];

    try {
      // Execute the SQL query
      const settings = await pgPool.query(sttm, values);

      res.json({
        status: true,
        data: settings.rows[0],
      });
    } catch (error) {
      console.error("Error getting user game settings:", error);
      res.status(500).json({ status: false, error: "Internal server error" });
    }
  } catch (error) {
    console.error("Error updating/inserting user game settings:", error);
    res.status(500).json({ status: false, error: "Internal server error" });
  }
});

module.exports = router;
