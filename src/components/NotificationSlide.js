import React, { useEffect, useState } from 'react';
import { Slide, Box, Typography, Avatar, Divider } from '@mui/material';
import { jwtDecode } from 'jwt-decode';

export default function NotificationSlide({ open, onClose, sidebarWidth = 72 }) {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).userId : '';

  useEffect(() => {
    if (!userId || !open) return;
    fetch(`http://localhost:4000/notification/${userId}`)
      .then(res => res.json())
      .then(data => setNotifications(data));
  }, [open]);

  return (
    <Slide direction="right" in={open} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: sidebarWidth,
          width: 300,
          height: '100%',
          bgcolor: 'white',
          boxShadow: 4,
          zIndex: 1300,
          overflowY: 'auto'
        }}
      >
        <Typography variant="h6" sx={{ p: 2 }}>알림</Typography>
        <Divider />
        {notifications.map((noti) => (
          <Box key={noti.noti_no} sx={{ px: 2, py: 1, bgcolor: noti.is_read === 'N' ? '#f0f0f0' : 'white' }}>
            <Typography variant="body2">{noti.content}</Typography>
            <Typography variant="caption" color="textSecondary">{new Date(noti.created_at).toLocaleString()}</Typography>
          </Box>
        ))}
      </Box>
    </Slide>
  );
}
