const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');

// 팔로우 등록
router.post('/:followeeId', auth, async (req, res) => {
  const followerId = req.user.userId;
  const followeeId = req.params.followeeId;

  try {
    await db.query(`
      INSERT IGNORE INTO TBL_FOLLOW (follower_id, followee_id, followed_at)
      VALUES (?, ?, NOW())
    `, [followerId, followeeId]);

    res.json({ success: true });
  } catch (err) {
    console.error('팔로우 등록 오류:', err);
    res.status(500).json({ success: false });
  }
});

// 팔로우 취소
router.delete('/:followeeId', auth, async (req, res) => {
  const followerId = req.user.userId;
  const followeeId = req.params.followeeId;

  try {
    await db.query(`
      DELETE FROM TBL_FOLLOW
      WHERE follower_id = ? AND followee_id = ?
    `, [followerId, followeeId]);

    res.json({ success: true });
  } catch (err) {
    console.error('팔로우 취소 오류:', err);
    res.status(500).json({ success: false });
  }
});

// 특정 유저 팔로우 여부 확인
router.get('/status/:followeeId', auth, async (req, res) => {
  const followerId = req.user.userId;
  const followeeId = req.params.followeeId;

  try {
    const [rows] = await db.query(`
      SELECT 1 FROM TBL_FOLLOW
      WHERE follower_id = ? AND followee_id = ?
    `, [followerId, followeeId]);

    res.json({ isFollowing: rows.length > 0 });
  } catch (err) {
    console.error('팔로우 상태 조회 오류:', err);
    res.status(500).json({ success: false });
  }
});

// 팔로잉 목록 
router.get('/followings/:userId', auth, async (req, res) => {
  const viewedUserId = req.params.userId;
  const loginUserId = req.user.userId;
  const keyword = req.query.q ? `%` + req.query.q + `%` : null;

  try {
    let query = `
      SELECT 
        U.user_id AS userId,
        U.name,
        U.profile_img,
        EXISTS (
          SELECT 1 FROM TBL_FOLLOW
          WHERE follower_id = ? AND followee_id = U.user_id
        ) AS isFollowing
      FROM TBL_FOLLOW F
      JOIN TBL_USER U ON F.followee_id = U.user_id
      WHERE F.follower_id = ?
    `;

    const params = [loginUserId, viewedUserId];

    if (keyword) {
      query += ` AND (U.user_id LIKE ? OR U.name LIKE ?)`;
      params.push(keyword, keyword);
    }

    query += ` ORDER BY F.followed_at DESC`;

    const [rows] = await db.query(query, params);
    res.json({ followings: rows });
  } catch (err) {
    console.error('팔로잉 리스트 조회 오류:', err);
    res.status(500).json({ message: '조회 실패' });
  }
});


// 팔로워 목록
router.get('/followers/:userId', auth, async (req, res) => {
  const viewedUserId = req.params.userId;
  const loginUserId = req.user.userId;
  const keyword = req.query.q ? `%` + req.query.q + `%` : null;

  try {
    let query = `
      SELECT 
        U.user_id AS userId,
        U.name,
        U.profile_img,
        EXISTS (
          SELECT 1 FROM TBL_FOLLOW
          WHERE follower_id = ? AND followee_id = U.user_id
        ) AS isFollowing
      FROM TBL_FOLLOW F
      JOIN TBL_USER U ON F.follower_id = U.user_id
      WHERE F.followee_id = ?
    `;

    const params = [loginUserId, viewedUserId];

    if (keyword) {
      query += ` AND (U.user_id LIKE ? OR U.name LIKE ?)`;
      params.push(keyword, keyword);
    }

    query += ` ORDER BY F.followed_at DESC`;

    const [rows] = await db.query(query, params);
    res.json({ followers: rows });
  } catch (err) {
    console.error('팔로워 리스트 조회 오류:', err);
    res.status(500).json({ message: '조회 실패' });
  }
});


module.exports = router;
