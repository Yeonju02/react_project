const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const JWT_KEY = 'myinstaclone_secret';

// 🔒 회원가입
router.post('/join', async (req, res) => {
  const { userId, password, name, email } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM TBL_USER WHERE user_id = ?', [userId]);
    if (existing.length > 0) {
      return res.json({ success: false, message: '이미 존재하는 아이디입니다.' });
    }

    const hashedPwd = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO TBL_USER (user_id, password, name, email, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    await db.query(query, [userId, hashedPwd, name, email]);

    res.json({ success: true, message: '회원가입이 완료되었습니다.' });
  } catch (err) {
    console.error('회원가입 오류 발생:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});


// ✅ 프로필 편집 기능 (사진 업로드 포함)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/profile';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `profile_${Date.now()}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

router.post('/profile', upload.single('profile_img'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: '토큰 없음' });

    const decoded = jwt.verify(token, JWT_KEY);
    const userId = decoded.userId;

    const { name, bio } = req.body;
    const profileImg = req.file ? req.file.path.replace(/\\/g, '/') : null;

    let updateFields = [];
    let params = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      params.push(name);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      params.push(bio);
    }
    if (profileImg !== null) {
      updateFields.push('profile_img = ?');
      params.push(profileImg);
    }

    if (updateFields.length === 0) {
      return res.json({ success: false, message: '수정할 항목 없음' });
    }

    params.push(userId);
    const query = `UPDATE TBL_USER SET ${updateFields.join(', ')} WHERE user_id = ?`;
    await db.query(query, params);

    res.json({ success: true, message: '프로필 업데이트 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 사용자 정보
router.get('/info/:userId', async (req, res) => {
  const { userId } = req.params;
  const [rows] = await db.query(`
    SELECT user_id, name, bio, profile_img
    FROM TBL_USER
    WHERE user_id = ?
  `, [userId]);

  if (rows.length === 0) return res.status(404).json({ message: '사용자 없음' });
  res.json(rows[0]);
});

module.exports = router;
