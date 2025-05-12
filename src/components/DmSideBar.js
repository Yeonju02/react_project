import { useEffect, useState } from 'react';
import {
  Box, Avatar, Typography, Button
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import NewDmDialog from './NewDmDialog';
import NoteAltRoundedIcon from '@mui/icons-material/NoteAltRounded';

export default function DmSidebar({ onSelectRoom, reload }) {
  const [dmList, setDmList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).userId : '';

  useEffect(() => {
    if (!userId) return;
    fetch('http://localhost:4000/dm/rooms/' + userId)
      .then(res => res.json())
      .then(data => setDmList(data));
  }, [userId, reload]);

  // ✅ 날짜 포맷 함수
  const formatDate = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let hour = date.getHours();
    const minute = String(date.getMinutes()).padStart(2, '0');
    const ampm = hour < 12 ? '오전' : '오후';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;

    return `${year}년 ${month}월 ${day}일 ${ampm} ${hour}시 ${minute}분`;
  };

  return (
    <Box width={360} borderRight="1px solid #ddd" overflow="auto">
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
        <Typography variant="h6">{userId}</Typography>
        <Button
          variant="text"
          sx={{ minWidth: 0, fontSize: 24 }}
          onClick={() => setOpenDialog(true)}
        >
          <NoteAltRoundedIcon sx={{ fontSize: 30, color: '#888' }} />
        </Button>
      </Box>

      <Box px={2} py={1}>
        <Typography variant="h6" color="black">메시지</Typography>
      </Box>

      {dmList.map((dm, idx) => {
        const isMine = dm.last_sender === userId;
        const lastMessageText = (isMine ? '나: ' : '') + dm.last_message;
        const formattedTime = formatDate(dm.last_time);

        return (
          <Box key={idx} px={2} py={1} display="flex" alignItems="center"
            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
            onClick={() => onSelectRoom(dm.room_no)}
          >
            <Avatar
              src={dm.profile_img || '/img/default-profile.png'}
              sx={{ width: 44, height: 44, mr: 1 }}
            />
            <Box flex={1} overflow="hidden">
              {/* 이름 + 시간 한 줄에 */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography
                  variant="subtitle1"
                  fontSize={15}
                  noWrap
                  sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {dm.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ flexShrink: 0, whiteSpace: 'nowrap', ml: 1, color : 'blue' }}
                >
                  {formattedTime}
                </Typography>
              </Box>

              {/* 메시지 줄이기 */}
              <Typography
                variant="body2"
                color="text.secondary"
                fontSize={13}
                noWrap
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '80%'
                }}
              >
                {lastMessageText}
              </Typography>
            </Box>
          </Box>
        );
      })}

      {/* 💬 NewDmDialog 연결 */}
      <NewDmDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onCreateRoom={async (targetUserId) => {
          const res = await fetch('http://localhost:4000/dm/room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userA: userId, userB: targetUserId })
          });
          const data = await res.json();
          setOpenDialog(false);
          onSelectRoom(data.room_no); 
        }}
      />
    </Box>
  );
}
