const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_KEY = 'myinstaclone_secret';

router.post("/", async (req, res) => {
  const { userId, password } = req.body;

  try {
    const query = "SELECT user_id, password, name FROM TBL_USER WHERE user_id = ?";
    const [user] = await db.query(query, [userId]);

    let result = {};

    if (user.length > 0) {
      const isMatch = await bcrypt.compare(password, user[0].password);
      if (isMatch) {
        const payload = {
          userId: user[0].user_id,
          name: user[0].name
        };
        const token = jwt.sign(payload, JWT_KEY, { expiresIn: '1h' });

        result = {
          success: true,
          token
        };
      } else {
        result = { message: "비밀번호가 일치하지 않습니다." };
      }
    } else {
      result = { message: "존재하지 않는 사용자입니다." };
    }

    res.json(result);
  } catch (err) {
    console.error("로그인 중 에러 발생:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
