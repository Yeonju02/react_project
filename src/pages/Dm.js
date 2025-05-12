import React, { useState } from 'react';
import { Box, Typography, Button, useMediaQuery } from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import DmSidebar from '../components/DmSideBar';
import { jwtDecode } from 'jwt-decode';
import NewDmDialog from '../components/NewDmDialog';
import DmRoom from '../components/DmRoom';

export default function Dm() {
  const isWide = useMediaQuery('(min-width:1200px)');
  const sidebarWidth = isWide ? 250 : 72;
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [reload, setReload] = useState(false);

  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).userId : '';

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: sidebarWidth,
        right: 0,
        bottom: 0,
        display: 'flex',
        overflow: 'hidden'
      }}
    >
      <DmSidebar onSelectRoom={setSelectedRoom} reload={reload} />

      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
        {typeof selectedRoom === 'number' ? (
          <DmRoom
            roomNo={selectedRoom}
            userId={userId}
            onMessageSend={() => setReload(prev => !prev)}
            onDeleteRoom={() => setSelectedRoom(null)}
          />
        ) : (
          <Box textAlign="center">
            <MessageIcon sx={{ fontSize: 60, mb: 2, color: '#999' }} />
            <Typography variant="h6" gutterBottom>내 메시지</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              친구나 그룹에 비공개 사진과 메시지를 보내보세요
            </Typography>
            <Button variant="contained" onClick={() => setOpenDialog(true)}>메시지 보내기</Button>
          </Box>
        )}
      </Box>

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
          setSelectedRoom(data.room_no);
        }}
      />
    </Box>
  );
}
