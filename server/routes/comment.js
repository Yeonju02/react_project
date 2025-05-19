const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');

const jwt = require('jsonwebtoken');
const JWT_KEY = 'myinstaclone_secret';

// 댓글 목록 조회
router.get('/:postNo', async (req, res) => {
  const postNo = req.params.postNo;
  const token = req.headers.authorization?.split(' ')[1];
  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_KEY);
      userId = decoded.userId;
    } catch (err) {
      console.warn('토큰 해독 실패:', err.message);
    }
  }

  try {
    const [rows] = await db.query(`
        SELECT comment_no, user_id, content, parent_id, 
               DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS createdAt
        FROM TBL_COMMENT
        WHERE post_no = ?
        ORDER BY created_at ASC
      `, [postNo]);

    // 좋아요 상태 조회
    const likeMap = {};
    if (userId) {
      const [likes] = await db.query(`
          SELECT comment_no
          FROM TBL_COMMENT_LIKE
          WHERE user_id = ?
        `, [userId]);
      likes.forEach(like => {
        likeMap[like.comment_no] = true;
      });
    }

    // 댓글 계층 구조로 만들고 likedByMe 속성 추가
    const nested = [];
    const map = {};

    for (let comment of rows) {
      comment.children = [];
      comment.likedByMe = !!likeMap[comment.comment_no];

      // likeCount도 함께 조회하려면 여기서 추가 쿼리 or JOIN 필요
      const [likeCount] = await db.query(`
          SELECT COUNT(*) AS count FROM TBL_COMMENT_LIKE WHERE comment_no = ?
        `, [comment.comment_no]);
      comment.likeCount = likeCount[0].count;

      map[comment.comment_no] = comment;

      if (!comment.parent_id) {
        nested.push(comment);
      } else {
        map[comment.parent_id]?.children.push(comment);
      }
    }

    res.json({ list: nested });
  } catch (err) {
    console.error('댓글 조회 오류:', err);
    res.status(500).json({ message: '댓글 조회 실패' });
  }
});

// 댓글 삭제
router.delete('/:commentNo', auth, async (req, res) => {
  const commentNo = req.params.commentNo;
  const userId = req.user.userId; // JWT에서 사용자 확인

  try {
    // 댓글 소유자 확인
    const [rows] = await db.query(`
      SELECT * FROM TBL_COMMENT WHERE comment_no = ?
    `, [commentNo]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '댓글이 존재하지 않습니다' });
    }

    if (rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: '본인의 댓글만 삭제할 수 있습니다' });
    }

    // ✅ 1. 자식 댓글 먼저 삭제
    await db.query(`
      DELETE FROM TBL_COMMENT WHERE parent_id = ?
    `, [commentNo]);

    // ✅ 2. 부모 댓글 삭제
    await db.query(`
      DELETE FROM TBL_COMMENT WHERE comment_no = ?
    `, [commentNo]);

    res.json({ success: true });
  } catch (err) {
    console.error('댓글 삭제 오류:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});


// 댓글/대댓글 등록
router.post('/', async (req, res) => {
  const { postNo, content, parentId } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_KEY);
    const userId = decoded.userId;

    await db.query(`
        INSERT INTO TBL_COMMENT (post_no, user_id, content, parent_id, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `, [postNo, userId, content, parentId || null]);

    res.json({ success: true, userId });
  } catch (err) {
    console.error('댓글 등록 오류:', err);
    res.status(500).json({ success: false, message: '댓글 등록 실패' });
  }
});

// 댓글 좋아요 등록
router.post('/like/:commentNo', auth, async (req, res) => {
  const commentNo = req.params.commentNo;
  const userId = req.user.userId;

  try {
    await db.query(`
        INSERT IGNORE INTO TBL_COMMENT_LIKE (comment_no, user_id, created_at)
        VALUES (?, ?, NOW())
      `, [commentNo, userId]);

    res.json({ success: true });
  } catch (err) {
    console.error('댓글 좋아요 등록 오류:', err);
    res.status(500).json({ success: false });
  }
});

// 댓글 좋아요 취소
router.delete('/like/:commentNo', auth, async (req, res) => {
  const commentNo = req.params.commentNo;
  const userId = req.user.userId;

  try {
    await db.query(`
        DELETE FROM TBL_COMMENT_LIKE
        WHERE comment_no = ? AND user_id = ?
      `, [commentNo, userId]);

    res.json({ success: true });
  } catch (err) {
    console.error('댓글 좋아요 삭제 오류:', err);
    res.status(500).json({ success: false });
  }
});

// 댓글 좋아요 갯수
router.get('/status/:postNo', auth, async (req, res) => {
  const postNo = req.params.postNo;
  const userId = req.user.userId;

  try {
    const [likes] = await db.query(`
        SELECT C.comment_no, COUNT(L.like_no) AS likeCount,
          MAX(CASE WHEN L.user_id = ? THEN 1 ELSE 0 END) AS likedByMe
        FROM TBL_COMMENT C
        LEFT JOIN TBL_COMMENT_LIKE L ON C.comment_no = L.comment_no
        WHERE C.post_no = ?
        GROUP BY C.comment_no
      `, [userId, postNo]);

    res.json({ list: likes });
  } catch (err) {
    console.error('댓글 좋아요 상태 조회 오류:', err);
    res.status(500).json({ message: '조회 실패' });
  }
});


// 댓글 사용자 언급
router.post('/comment/mentions', async (req, res) => {
  const { commentNo, postNo, mentionerId, mentionedUserIds } = req.body;

  try {
    for (let mentionedId of mentionedUserIds) {
      await db.query(`
        INSERT INTO TBL_MENTION (post_no, mentioner_user_id, mentioned_user_id)
        VALUES (?, ?, ?)`,
        [postNo, mentionerId, mentionedId]
      );
    }

    res.json({ message: "Mentions saved" });
  } catch (err) {
    console.error("Mention insert error", err);
    res.status(500).send("Mention insert error");
  }
});

// 댓글 알림 클릭 했을 때
router.get('/:commentNo/post', async (req, res) => {
  const commentNo = req.params.commentNo;
  const [rows] = await db.query(
    `SELECT post_no FROM TBL_COMMENT WHERE comment_no = ?`,
    [commentNo]
  );
  if (rows.length > 0) {
    res.json({ success: true, postNo: rows[0].post_no });
  } else {
    res.json({ success: false });
  }
});


module.exports = router;