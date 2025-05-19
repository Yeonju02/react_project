const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const JWT_KEY = 'myinstaclone_secret';

// 좋아요 추가
router.post('/:postNo', async (req, res) => {
  const { postNo } = req.params;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_KEY);
    const userId = decoded.userId;

    const query = `
        INSERT IGNORE INTO TBL_LIKE (post_no, user_id)
        VALUES (?, ?)
    `;
    await db.query(query, [postNo, userId]);

    res.json({ success: true });
  } catch (err) {
    console.log('좋아요 추가 실패:', err);
    res.status(500).json({ success: false });
  }
});

// 좋아요 취소
router.delete('/:postNo', async (req, res) => {
  const { postNo } = req.params;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_KEY);
    const userId = decoded.userId;

    const query = `
      DELETE FROM TBL_LIKE
      WHERE post_no = ? AND user_id = ?
    `;
    await db.query(query, [postNo, userId]);

    res.json({ success: true });
  } catch (err) {
    console.error('좋아요 삭제 실패:', err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
