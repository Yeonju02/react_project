const express = require('express');
const router = express.Router();
const db = require('../db');

// 채팅할 사용자 검색 (팔로워 + 팔로잉)
router.get('/candidates', async (req, res) => {
  try {
    const { userId, keyword = '' } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const search = '%' + keyword + '%'; 

    const sql = `
      SELECT DISTINCT u.user_id, u.name, u.profile_img
      FROM tbl_user u
      WHERE (
        u.user_id IN (
          SELECT followee_id FROM tbl_follow WHERE follower_id = ?
        )
        OR u.user_id IN (
          SELECT follower_id FROM tbl_follow WHERE followee_id = ?
        )
      )
      AND (
        u.user_id LIKE ? OR u.name LIKE ?
      )
    `;

    const [rows] = await db.query(sql, [userId, userId, search, search]);
    res.json(rows); // ✅ JSON 배열로 응답
  } catch (err) {
    console.error('서버 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 채팅방 생성
// userA와 userB가 참여하는 채팅방이 이미 있는지 확인 → 없으면 생성
router.post("/room", async (req, res) => {
  try {
    const { userA, userB } = req.body;

    if (!userA || !userB) {
      return res.status(400).json({ error: 'userA and userB are required' });
    }

    // 1. 기존 채팅방 있는지 확인
    const [rows] = await db.query(`
      SELECT r.room_no
      FROM tbl_dm_room r
      JOIN tbl_dm_member m1 ON r.room_no = m1.room_no
      JOIN tbl_dm_member m2 ON r.room_no = m2.room_no
      WHERE m1.user_id = ? AND m2.user_id = ?
      GROUP BY r.room_no
    `, [userA, userB]);

    if (rows.length > 0) {
      return res.json({ room_no: rows[0].room_no });
    }

    // 2. 새 채팅방 생성
    const [roomInsert] = await db.query("INSERT INTO tbl_dm_room (created_at) VALUES (NOW())");
    const roomNo = roomInsert.insertId;

    // 자기 자신에게 보내는 경우는 1명만 insert
    if (userA === userB) {
      await db.query("INSERT INTO tbl_dm_member (room_no, user_id) VALUES (?, ?)", [roomNo, userA]);
    } else {
      await db.query("INSERT INTO tbl_dm_member (room_no, user_id) VALUES (?, ?), (?, ?)", [roomNo, userA, roomNo, userB]);
    }

    res.json({ room_no: roomNo });
  } catch (err) {
    console.error("채팅방 생성 오류:", err);
    res.status(500).json({ error: '채팅방 생성 실패' });
  }
});

// 상대방 정보 조회
router.get('/other/:roomNo/:userId', async (req, res) => {
  try {
    const { roomNo, userId } = req.params;

    const sql = `
      SELECT u.user_id, u.name, u.profile_img
      FROM tbl_dm_member m
      JOIN tbl_user u ON m.user_id = u.user_id
      WHERE m.room_no = ? AND m.user_id != ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [roomNo, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: '상대방 정보를 찾을 수 없습니다.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('상대방 정보 조회 실패:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});


// 메시지 보내기
router.post("/message", async (req, res) => {
  const { roomNo, sender_id, content } = req.body;

  try {
    // 1. 메시지 저장
    await db.query(`
      INSERT INTO tbl_dm_msg (room_no, sender_id, content, created_at)
      VALUES (?, ?, ?, NOW())
    `, [roomNo, sender_id, content]);

    // 2. 상대방(receiver_id) 찾기
    const [members] = await db.query(`
      SELECT user_id FROM tbl_dm_member
      WHERE room_no = ? AND user_id != ?
    `, [roomNo, sender_id]);

    if (members.length > 0) {
      const receiver_id = members[0].user_id;

      // 3. 알림 추가
      await db.query(`
        INSERT INTO tbl_notification (receiver_id, sender_id, type, content, is_read, created_at, room_no)
        VALUES (?, ?, 'chat', ?, 'N', NOW(), ?)
      `, [receiver_id, sender_id, `${sender_id}님이 메시지를 보냈습니다.`, roomNo]);
    }

    res.json({ message: "sent" });
  } catch (err) {
    console.error("메시지 전송 또는 알림 오류:", err);
    res.status(500).json({ message: "server error" });
  }
});


// 메시지 불러오기
router.get("/messages/:roomNo", async (req, res) => {
  const { roomNo } = req.params;

  const [messages] = await db.query(`
    SELECT sender_id, content, created_at
    FROM tbl_dm_msg
    WHERE room_no = ?
    ORDER BY created_at ASC
  `, [roomNo]);

  res.json(messages);
});

// 진행중인 채팅방
router.get("/rooms/:userId", async (req, res) => {
  const { userId } = req.params;

  const [rooms] = await db.query(`
    SELECT 
      r.room_no,
      MAX(u.user_id) AS user_id,
      MAX(u.name) AS name,
      MAX(u.profile_img) AS profile_img,
      MAX(lm.content) AS last_message,
      MAX(lm.created_at) AS last_time,
      MAX(lm.sender_id) AS last_sender,
      MAX( 
        EXISTS (
          SELECT 1 FROM tbl_dm_msg m
          WHERE m.room_no = r.room_no
            AND m.sender_id != ?
            AND m.is_read = 'N'
        )
      ) AS unread
    FROM tbl_dm_member me
    JOIN tbl_dm_member you ON me.room_no = you.room_no AND me.user_id != you.user_id
    JOIN tbl_user u ON you.user_id = u.user_id
    JOIN tbl_dm_room r ON r.room_no = me.room_no
    LEFT JOIN (
      SELECT m1.*
      FROM tbl_dm_msg m1
      JOIN (
        SELECT room_no, MAX(created_at) AS max_time
        FROM tbl_dm_msg
        GROUP BY room_no
      ) m2 ON m1.room_no = m2.room_no AND m1.created_at = m2.max_time
    ) lm ON lm.room_no = r.room_no
    WHERE me.user_id = ?
    GROUP BY r.room_no
    ORDER BY MAX(lm.created_at) DESC
  `, [userId, userId]);

  res.json(rooms);
});


// 채팅방 삭제
router.delete('/room/:roomNo', async (req, res) => {
  const { roomNo } = req.params;

  try {
    await db.query('DELETE FROM tbl_dm_msg WHERE room_no = ?', [roomNo]);
    await db.query('DELETE FROM tbl_dm_member WHERE room_no = ?', [roomNo]);
    await db.query('DELETE FROM tbl_dm_room WHERE room_no = ?', [roomNo]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

// 안읽은 메시지 수
router.get('/unread/count/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT COUNT(DISTINCT sender_id) AS count
      FROM tbl_dm_msg
      WHERE is_read = 'N' AND sender_id != ? AND room_no IN (
        SELECT room_no FROM tbl_dm_member WHERE user_id = ?
      )
    `, [userId, userId]);

    res.json({ count: rows[0].count });
  } catch (err) {
    console.error('DM 안읽은 메시지 수 오류:', err);
    res.status(500).send('server error');
  }
});

// 특정 유저가 특정 채팅방의 메시지를 읽음 처리
router.post('/read/:roomNo/:userId', async (req, res) => {
  const { roomNo, userId } = req.params;

  try {
    await db.query(`
      UPDATE tbl_dm_msg
      SET is_read = 'Y'
      WHERE room_no = ? AND sender_id != ? AND is_read = 'N'
    `, [roomNo, userId]);

    res.json({ success: true, message: '읽음 처리 완료' });
  } catch (err) {
    console.error('읽음 처리 실패:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 게시글 공유
router.post('/share', async (req, res) => {
  try {
    const { senderId, receivers, post, message } = req.body;
    const { postNo, userId, content, images } = post;

    const safeContent = content || '';
    const image = images?.[0] || '';

    for (let receiverId of receivers) {
      // ✅ 기존 방 조회 - 정확히 두 명(sender + receiver)이 포함된 방만 찾기
      const [rows] = await db.query(
        `SELECT room_no
         FROM tbl_dm_member
         WHERE user_id IN (?, ?)
         GROUP BY room_no
         HAVING COUNT(DISTINCT user_id) = 2`,
        [senderId, receiverId]
      );

      let roomNo;

      if (rows.length > 0) {
        // ✅ 기존 방 있음
        roomNo = rows[0].room_no;
      } else {
        // ✅ 기존 방 없음 → 새 방 생성 + 멤버 등록
        const [newRoom] = await db.query(`INSERT INTO tbl_dm_room(created_at) VALUES(NOW())`);
        roomNo = newRoom.insertId;

        await db.query(
          `INSERT INTO tbl_dm_member(room_no, user_id) VALUES (?, ?), (?, ?)`,
          [roomNo, senderId, roomNo, receiverId]
        );
      }

      // ✅ 메시지 전송
          await db.query(
        `INSERT INTO tbl_dm_msg(room_no, sender_id, content, created_at)
        VALUES (?, ?, ?, NOW())`,
        [
          roomNo,
          senderId,
          `[게시글 공유]\n@${userId}님의 게시글\n"${safeContent}"\n<image:${image}>\npostNo:${postNo}`
        ]
      );

      // 📌 2. 사용자가 입력한 메시지가 있다면 따로 전송
      if (message && message.trim() !== '') {
        await db.query(
          `INSERT INTO tbl_dm_msg(room_no, sender_id, content, created_at)
          VALUES (?, ?, ?, NOW())`,
          [roomNo, senderId, message.trim()]
        );
      }
        }

    res.json({ success: true });
  } catch (err) {
    console.error('공유 에러:', err);
    res.status(500).json({ success: false, message: '서버 에러 발생', error: err.message });
  }
});


module.exports = router;