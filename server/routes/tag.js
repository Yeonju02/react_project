// routes/tagged.js 또는 routes/post.js 내부
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /tagged/:userId - 해당 유저가 태그된 게시글 조회
router.get('/tagged/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. tag_name이 userId인 tag_no 조회
    const [tagResult] = await db.query(`
      SELECT tag_no FROM tbl_tag WHERE tag_name = ?
    `, [userId]);

    if (tagResult.length === 0) return res.json([]); // 태그 없음

    const tagNo = tagResult[0].tag_no;

    // 2. 해당 tag_no가 달린 게시글 번호 조회
    const [postResult] = await db.query(`
      SELECT p.post_no, p.user_id, p.content, p.created_at
      FROM tbl_post_tag pt
      JOIN tbl_post p ON pt.post_no = p.post_no
      WHERE pt.tag_no = ?
      ORDER BY p.created_at DESC
    `, [tagNo]);

    // 3. 각 게시글에 이미지 붙이기
    for (let post of postResult) {
      const [imgs] = await db.query(`
        SELECT img_path FROM tbl_post_img
        WHERE post_no = ?
        ORDER BY img_no ASC
      `, [post.post_no]);

      post.image_urls = imgs.map(img => img.img_path);
    }

    res.json(postResult);
  } catch (err) {
    console.error('태그된 게시글 조회 실패:', err);
    res.status(500).json({ error: '서버 에러' });
  }
});

module.exports = router;
