const express = require('express');
const router = express.Router();
const db = require('../db');

// 게시글 검색
router.get('/posts', async (req, res) => {
  const keyword = req.query.q || '';
  try {
    const [rows] = await db.query(`
        SELECT P.post_no AS postNo, P.user_id, P.content,
               I.img_path AS thumbnail
        FROM TBL_POST P
        LEFT JOIN TBL_POST_IMG I ON P.post_no = I.post_no AND I.thumbnail = 'Y'
        WHERE P.content LIKE ?
        ORDER BY P.created_at DESC
    `, [`%` + keyword + `%`]);

    res.json({ list: rows });
  } catch (err) {
    console.error('게시글 검색 오류:', err);
    res.status(500).json({ message: '검색 실패' });
  }
});

// 사용자 검색
router.get('/users', async (req, res) => {
  const keyword = req.query.q || '';
  try {
    const [rows] = await db.query(`
      SELECT user_id, name, profile_img
      FROM TBL_USER
      WHERE user_id LIKE ? OR name LIKE ?
      ORDER BY user_id
    `, [`%` + keyword + `%`, `%` + keyword + `%`]);

    res.json({ list: rows });
  } catch (err) {
    console.error('사용자 검색 오류:', err);
    res.status(500).json({ message: '검색 실패' });
  }
});

module.exports = router;
