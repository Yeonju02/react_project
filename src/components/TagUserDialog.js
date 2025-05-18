import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, List, ListItem,
  ListItemAvatar, Avatar, ListItemText, TextField, CircularProgress, Box, Typography
} from '@mui/material';

export default function TagUserDialog({ open, onClose, onSelect }) {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (q) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/search/users?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setTimeout(() => {
        setUsers(data.list || []);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('사용자 검색 실패:', err);
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    if (value.trim()) {
      fetchUsers(value);
    } else {
      setUsers([]);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle sx={{ color: '#caa6f7' }}>사용자 태그하기</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="아이디 또는 이름으로 검색"
          value={keyword}
          onChange={handleSearchChange}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#caa6f7',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#caa6f7',
            },
            '& input': {
              color: '#caa6f7',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#caa6f7',
            },
          }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} sx={{ color: '#caa6f7' }} />
          </Box>
        ) : users.length === 0 && keyword.trim() ? (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography sx={{ color: '#caa6f7' }}>검색 결과가 없습니다</Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {users.map((user, idx) => (
              <ListItem
                button
                key={idx}
                onClick={() => onSelect({ userId: user.user_id, nickname: user.name })}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f4ecff',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar src={user.profile_img || ''} />
                </ListItemAvatar>
                <ListItemText
                  primary={<span style={{ color: '#caa6f7' }}>{user.name}</span>}
                  secondary={<span style={{ color: '#b18ee0' }}>@{user.user_id}</span>}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
