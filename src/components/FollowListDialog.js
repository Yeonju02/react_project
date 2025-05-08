import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Avatar, Typography, Button, Box, TextField, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function FollowListDialog({ open, onClose, title, list, currentUserId }) {
  const [followState, setFollowState] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const initialState = {};
    list.forEach(user => {
      initialState[user.userId] = user.isFollowing;
    });
    setFollowState(initialState);
  }, [list]);

  const toggleFollow = async (targetId) => {
    const token = localStorage.getItem('token');
    const isFollowing = followState[targetId];
    const method = isFollowing ? 'DELETE' : 'POST';

    const res = await fetch("http://localhost:4000/follow/" + targetId, {
      method,
      headers: { 'authorization': 'Bearer ' + token }
    });

    const data = await res.json();
    if (data.success) {
      setFollowState(prev => ({
        ...prev,
        [targetId]: !isFollowing
      }));
    }
  };

  const filteredList = list.filter(user =>
    user.userId.toLowerCase().includes(search.toLowerCase()) ||
    (user.name && user.name.includes(search))
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <TextField
          placeholder="검색"
          variant="outlined"
          size="small"
          fullWidth
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />

        {filteredList.map(user => (
          <Box
            key={user.userId}
            sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
          >
            <Avatar
              src={user.profile_img ? "http://localhost:4000" + user.profile_img : "/assets/profile.jpg"}
              sx={{ width: 40, height: 40, mr: 2 }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontWeight: 'bold', fontSize: 14 }}>{user.userId}</Typography>
              <Typography variant="caption" color="textSecondary">{user.name}</Typography>
            </Box>
            {user.userId !== currentUserId && (
              <Button
                variant={followState[user.userId] ? 'outlined' : 'contained'}
                size="small"
                onClick={() => toggleFollow(user.userId)}
                sx={{ textTransform: 'none' }}
              >
                {followState[user.userId] ? '팔로잉' : '팔로우'}
              </Button>
            )}
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
}

export default FollowListDialog;
