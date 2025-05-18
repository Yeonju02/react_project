import { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, TextField, Button, Avatar, Divider,
  Dialog, DialogTitle, DialogActions
} from '@mui/material';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import SharedPostCard from './SharedPostCard';
import PostDialog from './PostDialog';

const socket = io('http://localhost:4000', { autoConnect: false }); // 한 번만 생성

export default function DmRoom({ roomNo, onMessageSend, onDeleteRoom }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const scrollRef = useRef(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPostNo, setSelectedPostNo] = useState(null);
  const token = localStorage.getItem('token');
  const decodedUserId = token ? jwtDecode(token).userId : '';

  useEffect(() => {
    // 메시지 불러오기
    fetch('http://localhost:4000/dm/messages/' + roomNo)
      .then(res => res.json())
      .then(data => setMessages(data));

    // 상대 유저 정보 불러오기
    fetch('http://localhost:4000/dm/other/' + roomNo + '/' + decodedUserId)
      .then(res => res.json())
      .then(data => setOtherUser(data));
  }, [roomNo, decodedUserId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ 소켓 연결 및 메시지 수신 처리
  useEffect(() => {
    socket.connect();                 // 연결
    socket.emit('joinRoom', roomNo); // 방 참가

    socket.on('receiveMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('receiveMessage');
      socket.emit('leaveRoom', roomNo); // (옵션) 방 나가기
      socket.disconnect();              // 연결 해제
    };
  }, [roomNo]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsg = {
      roomNo,
      sender_id: decodedUserId,
      content: input,
      created_at: new Date().toISOString()
    };

    await fetch('http://localhost:4000/dm/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg)
    });

    setMessages([...messages, newMsg]);
    setInput('');
    socket.emit('sendMessage', newMsg);

    if (onMessageSend) onMessageSend();
  };

  const handleDeleteRoom = async () => {
    await fetch('http://localhost:4000/dm/room/' + roomNo, {
      method: 'DELETE',
    });
    setOpenConfirm(false);
    if (onMessageSend) onMessageSend();         // 목록 갱신
    if (onDeleteRoom) onDeleteRoom();
  };

  return (
    <Box width="100%" height="100%" display="flex" flexDirection="column" overflow="hidden">

      {/* 상단: 유저 정보 + 채팅 삭제 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1.5} flexShrink={0}>
        <Box display="flex" alignItems="center">
          <Avatar
            sx={{ width: 40, height: 40, mr: 1 }}
            src={otherUser?.profile_img ? `http://localhost:4000/${otherUser.profile_img}` : '/img/default-profile.png'}
          />
          <Typography fontWeight="bold">{otherUser?.name || ''}</Typography>
        </Box>
        <Button variant="text" color="error" size="small" onClick={() => setOpenConfirm(true)}>
          채팅 삭제
        </Button>
      </Box>
      <Divider />

      {/* 메시지 영역 */}
      <Box flex={1} px={2} py={1} sx={{ overflowY: "auto", minHeight: 0 }}>
        {messages.map((msg, idx) => {
          const isMine = String(msg.sender_id) === String(decodedUserId);

          const renderMessage = () => {
            // 공유 메시지일 경우
            if (msg.content.startsWith('[게시글 공유]')) {
              const lines = msg.content.split('\n');
              const userLine = lines.find(line => line.startsWith('@')) || '';
              const contentLine = lines.find(line => line.startsWith('"'))?.replace(/"/g, '') || '';
              const imageLine = lines.find(line => line.startsWith('<image:')) || '';
              const imagePath = imageLine.replace('<image:', '').replace('>', '').trim();

              const postUserId = userLine.replace('@', '').replace('님의 게시글', '').trim();

              return (
                <Box
                  sx={{
                    display: 'inline-block',
                    bgcolor: isMine ? '#f3efff' : '#eee',
                    px: 1,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: '80%',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    const postNoMatch = msg.content.match(/postNo:(\d+)/);
                    if (postNoMatch) {
                      const postNo = parseInt(postNoMatch[1], 10);
                      setSelectedPostNo(postNo);
                      setDialogOpen(true);
                    }
                  }}
                >
                  <SharedPostCard postUserId={postUserId} content={contentLine} image={imagePath} />
                </Box>

              );
            }

            // 일반 메시지일 경우
            return (
              <Typography
                sx={{
                  display: 'inline-block',
                  bgcolor: isMine ? '#f3efff' : '#eee',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: '70%',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line'
                }}
              >
                {msg.content}
              </Typography>
            );
          };

          return (
            <Box key={idx} textAlign={isMine ? 'right' : 'left'} mb={1}>
              {renderMessage()}
            </Box>
          );
        })}
        <div ref={scrollRef} />
      </Box>

      <Divider />

      {/* 하단 입력창 */}
      <Box display="flex" alignItems="center" px={2} py={1.5} flexShrink={0}>
        <TextField
          placeholder="메시지 입력..."
          fullWidth
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          sx={{
            bgcolor: '#faf8ff',              // 연보라 배경
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#c7b8f5',      // 테두리 연보라
              },
              '&:hover fieldset': {
                borderColor: '#a18df2',      // 호버 시 진한 연보라
              },
              '&.Mui-focused fieldset': {
                borderColor: '#a18df2',      // 포커스 시 진한 연보라
              },
            }
          }}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          sx={{
            ml: 1,
            minWidth: 80,
            backgroundColor: '#c7b8f5',
            '&:hover': { backgroundColor: '#a18df2' }
          }}
        >
          전송
        </Button>
      </Box>

      <PostDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        post={{ postNo: selectedPostNo }}
      />
      {/* ✅ 삭제 확인 모달 */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>채팅방을 삭제하시겠습니까?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>취소</Button>
          <Button color="error" onClick={handleDeleteRoom}>삭제</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
