import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, Typography, TextField, Button, Grid, Box
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function ShareDialog({ open, onClose, post, userId }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!open) return;

    const headers = { authorization: 'Bearer ' + token };

    Promise.all([
      fetch('http://localhost:4000/follow/followings/' + userId, { headers }),
      fetch('http://localhost:4000/follow/followers/' + userId, { headers })
    ])
      .then(res => Promise.all(res.map(r => r.json())))
      .then(([followingsData, followersData]) => {
        const combined = [...(followingsData.followings || []), ...(followersData.followers || [])];
        const unique = Array.from(new Map(combined.map(user => [user.userId, user])).values());
        setUsers(unique);
      });
  }, [open, userId, token]);

  const toggleUser = (targetId) => {
    setSelected(prev =>
      prev.includes(targetId)
        ? prev.filter(id => id !== targetId)
        : [...prev, targetId]
    );
  };

  const handleSend = () => {
    fetch('http://localhost:4000/dm/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post,
        receivers: selected,
        senderId: userId,
        message
      })
    });
    setMessage('');
    onClose();
  };

  const filteredUsers = users.filter(user =>
    user.userId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ textAlign: 'center', color: '#ba9fe3' }}>공유</DialogTitle>
      <DialogContent sx={{ px: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#ba9fe3',
              }
            }
          }}
        />

        <Grid container spacing={2}>
          {filteredUsers.map((user) => {
            const isSelected = selected.includes(user.userId);
            return (
              <Grid item xs={3} key={user.userId} onClick={() => toggleUser(user.userId)}>
                <Box
                  sx={{
                    position: 'relative',
                    border: isSelected ? '2px solid #ba9fe3' : '2px solid transparent',
                    borderRadius: '50%',
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    cursor: 'pointer'
                  }}
                >
                  <Avatar
                    src={user.profile_img ? `http://localhost:4000/${user.profile_img}` : ''}
                    alt={user.userId}
                    sx={{ width: 60, height: 60 }}
                  />
                  {isSelected && (
                    <CheckCircleIcon
                      sx={{
                        position: 'absolute',
                        bottom: -6,
                        right: -6,
                        color: '#ba9fe3',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        fontSize: 18
                      }}
                    />
                  )}
                </Box>
                <Typography variant="caption" align="center" display="block" noWrap sx={{ color: '#ba9fe3' }}>
                  {user.userId}
                </Typography>
              </Grid>
            );
          })}
        </Grid>

        <TextField
          placeholder="메시지 쓰기..."
          fullWidth
          size="small"
          multiline
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{
            mt: 2,
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#ba9fe3',
              }
            }
          }}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          variant="contained"
          disabled={selected.length === 0}
          onClick={handleSend}
          sx={{
            width: '90%',
            bgcolor: '#ba9fe3',
            '&:hover': {
              bgcolor: '#a17de3',
            }
          }}
        >
          따로 보내기
        </Button>
      </DialogActions>
    </Dialog>
  );
}