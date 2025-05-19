const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_KEY = 'myinstaclone_secret';

// 저장 추가
router.post('/:postNo', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { postNo } = req.params;

  try {
    const decoded = jwt.verify(token, JWT_KEY);
    const userId = decoded.userId;

    const query = `
      INSERT IGNORE INTO TBL_SAVED_POST (user_id, post_no, saved_at)
      VALUES (?, ?, NOW())
    `;
    await db.query(query, [userId, postNo]);
    res.json({ success: true });
  } catch (err) {
    console.error('저장 실패:', err);
    res.status(500).json({ success: false });
  }
});

// 저장 취소
router.delete('/:postNo', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { postNo } = req.params;

  try {
    const decoded = jwt.verify(token, JWT_KEY);
    const userId = decoded.userId;

    const query = `
      DELETE FROM TBL_SAVED_POST WHERE user_id = ? AND post_no = ?
    `;
    await db.query(query, [userId, postNo]);
    res.json({ success: true });
  } catch (err) {
    console.error('저장 삭제 실패:', err);
    res.status(500).json({ success: false });
  }
});

// 저장된 게시물 조회
router.get('/saved/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(`
      SELECT p.post_no, p.user_id, p.content, p.created_at
      FROM TBL_SAVED_POST s
      JOIN TBL_POST p ON s.post_no = p.post_no
      WHERE s.user_id = ?
      ORDER BY s.saved_at DESC
    `, [userId]);

    for (const post of rows) {
      const [images] = await db.query(`
        SELECT img_path FROM TBL_POST_IMG WHERE post_no = ? ORDER BY img_no
      `, [post.post_no]);
      post.image_urls = images.map(img => img.img_path);
    }

    res.json({ list: rows });
  } catch (err) {
    console.error('저장된 게시글 조회 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
