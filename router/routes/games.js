const express = require("express");
const pgPool = require("../../libs/db");

// Start of url is /api/games
const router = express.Router();

router.get("/activegames", async (req, res) => {
  const userID = req.session.user.id;

  const sttm = `
  SELECT G.name, G.abbrev, UGS.is_active
  FROM usergamesettings UGS
  INNER JOIN games G ON UGS.game_id = G.game_id
  WHERE UGS.user_ID = $1
  `;

  try {
    const result = await pgPool.query(sttm, [userID]);

    if (result.rowCount > 0) {
      res.json(result.rows);
    } else {
      res.send(false);
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/allgames", async (req, res) => {
  const userID = req.session.user.id;

  const sttm = `
  SELECT G.*, 
       COALESCE(UGS.is_active, false) AS is_active
FROM Games G
LEFT JOIN UserGameSettings UGS ON G.game_id = UGS.game_id AND UGS.user_id = $1;
  `;

  try {
    const result = await pgPool.query(sttm, [userID]);

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.send(false);
  }
});

module.exports = router;
