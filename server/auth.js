// jwt 토큰 검증
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'myinstaclone_secret'; // .env 없이 하드코딩

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // console.log("authHeader ==> ", authHeader);
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: '인증 토큰 없음', isLogin: false });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // console.log("decoded ==> ", decoded);
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(403).json({ message: '유효하지 않은 토큰', isLogin: false });
    }
};