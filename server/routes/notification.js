const express = require('express');
const router = express.Router();
const db = require('../db');

// 알림 목록 조회
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT 
      N.noti_no,
      N.receiver_id,
      N.sender_id,
      N.type,
      N.content,
      N.is_read,
      N.created_at,
      N.target_post,
      N.target_comment,
      N.target_user,
      U.profile_img AS sender_profile,
      I.img_path AS thumbnail
    FROM tbl_notification N
    LEFT JOIN tbl_user U ON N.sender_id = U.user_id
    LEFT JOIN tbl_post_img I ON N.target_post = I.post_no AND I.thumbnail = 'Y'
    WHERE N.receiver_id = ?
    ORDER BY N.created_at DESC
  `;

  try {
    const [rows] = await db.query(query, [userId]);
    res.json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error('알림 조회 오류:', err);
    res.status(500).json({ message: '알림 조회 실패' });
  }
});

// 알림 읽음 처리
router.post('/read/:notiNo', async (req, res) => {
  const { notiNo } = req.params;
  const query = `UPDATE tbl_notification SET is_read = 'Y' WHERE noti_no = ?`;
  await db.query(query, [notiNo]);
  res.send('updated');
});

// 알림 등록
router.post('/', async (req, res) => {
  const {
    receiver_id,
    sender_id,
    type,
    content,
    target_post = null,
    target_comment = null,
    target_user = null
  } = req.body;

  if (!receiver_id || !sender_id || !type || !content) {
    return res.status(400).json({ success: false, message: '필수 값 누락' });
  }

  try {
    const query = `
      INSERT INTO tbl_notification (
        receiver_id, sender_id, type, content,
        target_post, target_comment, target_user,
        is_read, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'N', NOW())
    `;

    const [result] = await db.query(query, [
      receiver_id, sender_id, type, content,
      target_post, target_comment, target_user
    ]);

    res.json({ success: true, noti_no: result.insertId });
  } catch (err) {
    console.error('알림 등록 실패:', err);
    res.status(500).json({ success: false, message: 'DB 오류' });
  }
});

router.post('/read/all/:userId', async (req, res) => {
  const { userId } = req.params;
  await db.query(`
    UPDATE tbl_notification SET is_read = 'Y'
    WHERE receiver_id = ? AND is_read = 'N'
  `, [userId]);
  res.json({ success: true });
});

router.get('/unread/count/:userId', async (req, res) => {
  const { userId } = req.params;
  const [[{ count }]] = await db.query(`
    SELECT COUNT(*) AS count FROM tbl_notification
    WHERE receiver_id = ? AND is_read = 'N'
  `, [userId]);
  res.json({ count });
});

router.post('/read/:roomNo/:userId', async (req, res) => {
  const { roomNo, userId } = req.params;
  await db.query(`
    UPDATE tbl_dm_msg
    SET is_read = 'Y'
    WHERE room_no = ? AND sender_id != ? AND is_read = 'N'
  `, [roomNo, userId]);

  res.send({ success: true });
});

module.exports = router;
