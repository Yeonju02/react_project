const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

const JWT_KEY = 'myinstaclone_secret';

// 게시글 목록 조회
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_KEY);
        userId = decoded.userId;
      } catch (err) {
        console.warn('토큰 검증 실패:', err.message);
      }
    }

    const [posts] = await db.query(`
      SELECT 
        post_no AS postNo,
        user_id AS userId,
        content,
        created_at AS createdAt
      FROM TBL_POST
      ORDER BY created_at DESC
    `);

    for (const post of posts) {
      const [images] = await db.query(`
        SELECT img_path FROM TBL_POST_IMG WHERE post_no = ? ORDER BY img_no ASC
      `, [post.postNo]);
      post.images = images.map(img => img.img_path);

      const [likeResult] = await db.query(`
        SELECT COUNT(*) AS count FROM TBL_LIKE WHERE post_no = ?
      `, [post.postNo]);
      post.likeCount = likeResult[0].count;

      const [liked] = await db.query(`
        SELECT 1 FROM TBL_LIKE WHERE post_no = ? AND user_id = ?
      `, [post.postNo, userId]);
      post.likedByMe = liked.length > 0;

      const [saved] = await db.query(`
        SELECT 1 FROM TBL_SAVED_POST WHERE post_no = ? AND user_id = ?
      `, [post.postNo, userId]);
      post.savedByMe = saved.length > 0;

      const [commentCount] = await db.query(`
        SELECT COUNT(*) AS count FROM TBL_COMMENT WHERE post_no = ?
      `, [post.postNo]);
      post.commentCount = commentCount[0].count;

      const [profile] = await db.query(`
        SELECT profile_img FROM TBL_USER WHERE user_id = ?
      `, [post.userId]);
      post.profileImg = profile[0]?.profile_img || null;

      const [followed] = await db.query(`
        SELECT 1 FROM TBL_FOLLOW WHERE follower_id = ? AND followee_id = ?
      `, [userId, post.userId]);
      post.isFollowing = followed.length > 0;

      // 🎯 태그된 유저 정보 추가
      const [tags] = await db.query(`
        SELECT 
          tagged_user_id AS userId,
          position_x AS x,
          position_y AS y
        FROM tbl_post_user_tag
        WHERE post_no = ?
      `, [post.postNo]);

      post.userTags = tags;
    }

    res.json({ list: posts });
  } catch (err) {
    console.error('게시글 목록 조회 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// 게시글 작성
router.post('/', upload.array('files'), async (req, res) => {
  const { userId, content } = req.body;
  const files = req.files;

  // 🔥 여기 추가!
  const taggedUsers = JSON.parse(req.body.taggedUsers || '[]');

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // 1) 게시글 등록
    const postQuery = `
      INSERT INTO TBL_POST (user_id, content, created_at)
      VALUES (?, ?, NOW())
    `;
    const [postResult] = await conn.query(postQuery, [userId, content]);
    const postNo = postResult.insertId;

    // 2) 이미지 저장 + 썸네일 지정
    if (files.length > 0) {
      const imgQuery = `
        INSERT INTO TBL_POST_IMG (post_no, img_path, thumbnail)
        VALUES (?, ?, ?)
      `;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imagePath = "/uploads/" + file.filename;
        const thumbnail = (i === 0) ? 'Y' : 'N';
        await conn.query(imgQuery, [postNo, imagePath, thumbnail]);
      }
    }

    // 3) 태그된 사용자 처리
    if (taggedUsers.length > 0) {
      for (const tag of taggedUsers) {
        await db.query(`
          INSERT INTO TBL_POST_USER_TAG(post_no, tagged_user_id, position_x, position_y)
          VALUES (?, ?, ?, ?)`,
          [postNo, tag.userId, tag.x, tag.y]
        );

        if (tag.userId !== userId) {
          await db.query(`
            INSERT INTO TBL_NOTIFICATION(receiver_id, sender_id, type, content, target_post)
            VALUES (?, ?, 'tag', ?, ?)`,
            [tag.userId, userId, `${userId}님이 회원님을 게시글에 태그했습니다.`, postNo]
          );
        }
      }
    }

    await conn.commit();
    res.json({ success: true, message: '게시글 등록 완료!', postNo });

  } catch (err) {
    await conn.rollback();
    console.error('게시글 업로드 실패:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  } finally {
    conn.release();
  }
});

// 게시글 삭제
router.delete('/:postNo', async (req, res) => {
  const { postNo } = req.params;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, JWT_KEY);
    const userId = decoded.userId;

    const [postResult] = await db.query(`
      SELECT user_id FROM TBL_POST WHERE post_no = ?
    `, [postNo]);

    if (!postResult.length) {
      return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
    }

    if (postResult[0].user_id !== userId) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    // 🔁 댓글 삭제 (순서 주의)
    await db.query(`DELETE FROM TBL_COMMENT WHERE post_no = ? AND parent_id IS NOT NULL`, [postNo]); // 대댓글
    await db.query(`DELETE FROM TBL_COMMENT WHERE post_no = ? AND parent_id IS NULL`, [postNo]);     // 일반 댓글

    // 🔁 태그된 유저 삭제
    await db.query(`DELETE FROM tbl_post_user_tag WHERE post_no = ?`, [postNo]);

    // 🔁 해시태그 연결 삭제 (⭐ 중요)
    await db.query(`DELETE FROM TBL_POST_TAG WHERE post_no = ?`, [postNo]);

    // 🔁 이미지 삭제
    await db.query(`DELETE FROM TBL_POST_IMG WHERE post_no = ?`, [postNo]);

    // 🔁 게시글 삭제
    await db.query(`DELETE FROM TBL_POST WHERE post_no = ?`, [postNo]);

    res.json({ message: '삭제 완료' });
  } catch (err) {
    console.error('게시글 삭제 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});


// 검색창에서 게시글 상세보기
router.get('/:postNo', async (req, res) => {
  const postNo = req.params.postNo;
  const token = req.headers.authorization?.split(' ')[1];
  let userId = null;

  try {
    if (token) {
      const decoded = jwt.verify(token, JWT_KEY);
      userId = decoded.userId;
    }

    const [[post]] = await db.query(`
      SELECT post_no AS postNo, user_id AS userId, content, 
             DATE_FORMAT(created_at, '%Y-%m-%d') AS createdAt
      FROM TBL_POST WHERE post_no = ?
    `, [postNo]);

    const [images] = await db.query(`
      SELECT img_path FROM TBL_POST_IMG WHERE post_no = ? ORDER BY img_no
    `, [postNo]);

    post.images = images.map(img => img.img_path);

    const [[likeRow]] = await db.query(`
      SELECT COUNT(*) AS count FROM TBL_LIKE WHERE post_no = ?
    `, [postNo]);
    post.likeCount = likeRow.count;

    if (userId) {
      const [[like]] = await db.query(`
        SELECT 1 FROM TBL_LIKE WHERE post_no = ? AND user_id = ?
      `, [postNo, userId]);
      post.likedByMe = !!like;

      const [[save]] = await db.query(`
        SELECT 1 FROM TBL_SAVED_POST WHERE post_no = ? AND user_id = ?
      `, [postNo, userId]);
      post.savedByMe = !!save;
    }

    res.json({ success: true, post });
  } catch (err) {
    console.error('게시글 상세 조회 오류:', err);
    res.status(500).json({ success: false });
  }
});

// 마이페이지 게시글
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  const token = req.headers.authorization?.split(' ')[1];
  let myId = null;

  try {
    if (token) {
      const decoded = jwt.verify(token, JWT_KEY);
      myId = decoded.userId;
    }

    const [posts] = await db.query(`
      SELECT 
        post_no AS postNo,
        user_id AS userId,
        content,
        DATE_FORMAT(created_at, '%Y-%m-%d') AS createdAt
      FROM TBL_POST
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);

    for (const post of posts) {
      const [images] = await db.query(`
        SELECT img_path FROM TBL_POST_IMG WHERE post_no = ? ORDER BY img_no
      `, [post.postNo]);
      post.image_urls = images.map(img => img.img_path);

      const [[likeRow]] = await db.query(`
        SELECT COUNT(*) AS count FROM TBL_LIKE WHERE post_no = ?
      `, [post.postNo]);
      post.likeCount = likeRow.count;

      if (myId) {
        const [[like]] = await db.query(`
          SELECT 1 FROM TBL_LIKE WHERE post_no = ? AND user_id = ?
        `, [post.postNo, myId]);
        post.likedByMe = !!like;

        const [[save]] = await db.query(`
          SELECT 1 FROM TBL_SAVED_POST WHERE post_no = ? AND user_id = ?
        `, [post.postNo, myId]);
        post.savedByMe = !!save;
      } else {
        post.likedByMe = false;
        post.savedByMe = false;
      }
    }

    // ✅ 수정된 응답
    res.json({ list: posts });

  } catch (err) {
    console.error('사용자 게시글 조회 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});


// 게시글 태그
router.post('/hashtags', async (req, res) => {
  const { postNo, tagNames } = req.body;
  try {
    for (let tag of tagNames) {
      // 태그 존재 여부 확인
      let [existing] = await db.query(`SELECT tag_no FROM TBL_TAG WHERE tag_name = ?`, [tag]);

      let tagNo;
      if (existing.length === 0) {
        const [inserted] = await db.query(`INSERT INTO TBL_TAG (tag_name) VALUES (?)`, [tag]);
        tagNo = inserted.insertId;
      } else {
        tagNo = existing[0].tag_no;
      }

      // 중복 방지를 위해 IGNORE 사용
      await db.query(`INSERT IGNORE INTO TBL_POST_TAG (post_no, tag_no) VALUES (?, ?)`, [postNo, tagNo]);
    }

    res.json({ message: "Hashtags saved" });
  } catch (err) {
    console.error("Hashtag insert error", err);
    res.status(500).send("Hashtag insert error");
  }
});


// 게시글 작성 시 사용자 태그
router.post('/user-tags', async (req, res) => {
  const { postNo, userTags } = req.body;
  try {
    for (let tag of userTags) {
      await db.query(`
        INSERT INTO TBL_POST_USER_TAG (post_no, tagged_user_id, position_x, position_y)
        VALUES (?, ?, ?, ?)`,
        [postNo, tag.userId, tag.x, tag.y]
      );
    }

    res.json({ message: "User tags saved" });
  } catch (err) {
    console.error("User tag insert error", err);
    res.status(500).send("User tag insert error");
  }
});


module.exports = router;
