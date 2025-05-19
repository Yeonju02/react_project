const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');

const http = require('http');
const { Server } = require('socket.io');

const db = require('./db');
const loginRouter = require('./routes/login');
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const commentRouter = require('./routes/comment');
const dmRouter = require('./routes/dm');
const followRouter = require('./routes/follow');
const notificationRouter = require('./routes/notification');
const saveRouter = require('./routes/save');
const tagRouter = require('./routes/tag');
const likeRouter = require('./routes/like');
const searchRouter = require('./routes/search');

const app = express();

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}));

app.use(session({
    secret: 'insta_clone_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 30
    }
}));

// 라우터 연결
app.use('/login', loginRouter);
app.use('/user', userRouter);
app.use('/post', postRouter);
app.use('/comment', commentRouter);
app.use('/dm', dmRouter);
app.use('/follow', followRouter);
app.use('/notification', notificationRouter);
app.use('/save', saveRouter);
app.use('/tag', tagRouter);
app.use('/like', likeRouter);
app.use('/search', searchRouter);


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // 개발 시 전체 허용
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('🔌 클라이언트 연결됨:', socket.id);

  socket.on('joinRoom', (roomNo) => {
    socket.join(roomNo);
    console.log(`✅ ${socket.id} → 방 ${roomNo} 참가`);
  });

  socket.on('sendMessage', (msg) => {
    const { roomNo } = msg;
    socket.to(roomNo).emit('receiveMessage', msg); // broadcast
  });

  socket.on('disconnect', () => {
    console.log('❌ 연결 해제:', socket.id);
  });
});


server.listen(4000, () => {
    console.log("🚀 서버 실행 중: http://localhost:4000");
});
