import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Box, Avatar, Typography, Radio, RadioGroup, Button
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';

export default function NewDmDialog({ open, onClose, onCreateRoom }) {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState('');
  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).userId : '';

  useEffect(() => {
    if (!open) return;
    fetch('http://localhost:4000/dm/candidates?userId=' + userId + '&keyword=' + keyword)
      .then(res => res.json())
      .then(data => {
        setUsers(data);
    });
  }, [open, keyword]);

  const filtered = users.filter(u =>
    u.user_id.includes(keyword) || (u.name && u.name.includes(keyword))
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>새로운 메시지</DialogTitle>
      <DialogContent>
        <TextField
          placeholder="검색..."
          variant="standard"
          fullWidth
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          sx={{ mb: 2 }}
        />

        <RadioGroup value={selected} onChange={(e) => setSelected(e.target.value)}>
          {filtered.map((user) => (
            <Box key={user.user_id} display="flex" alignItems="center" px={1.5} py={1}>
              <Avatar src={user.profile_img || '/img/default-profile.png'} sx={{ mr: 1 }} />
              <Box flexGrow={1}>
                <Typography>{user.name}</Typography>
              </Box>
              <Radio value={user.user_id} />
            </Box>
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          disabled={!selected}
          onClick={() => {
            onCreateRoom(selected);
            onClose();
          }}
          fullWidth
        >
          채팅
        </Button>
      </DialogActions>
    </Dialog>
  );
}
