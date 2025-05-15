import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, List, ListItem,
  ListItemAvatar, Avatar, ListItemText, TextField
} from '@mui/material';

export default function TagUserDialog({ open, onClose, onSelect }) {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState('');

  const fetchUsers = async (q) => {
    try {
      const res = await fetch(`http://localhost:4000/search/users?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setUsers(data.list || []);
    } catch (err) {
      console.error('사용자 검색 실패:', err);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setKeyword(value);

    if (value.trim()) {
      fetchUsers(value);
    } else {
      setUsers([]); // 검색어 없으면 초기화
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>사용자 태그하기</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="아이디 또는 이름으로 검색"
          value={keyword}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
        />

        <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
          {users.map((user, idx) => (
            <ListItem button key={idx} onClick={() => onSelect({
              userId: user.user_id,
              nickname: user.name
            })}>
              <ListItemAvatar>
                <Avatar src={user.profile_img || ''} />
              </ListItemAvatar>
              <ListItemText primary={user.name} secondary={`@${user.user_id}`} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
