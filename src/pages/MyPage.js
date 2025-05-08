import React, { useEffect, useState } from 'react';
import {
  Box, Avatar, Typography, Grid, Tabs, Tab, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';

function MyPage() {
  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).userId : '';
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [openType, setOpenType] = useState(null); // 'follower' or 'following'

  useEffect(() => {
    if (!userId) return;
    fetch('http://localhost:4000/follow/' + userId)
      .then(res => res.json())
      .then(data => {
        setFollowers(data.followers || []);
        setFollowings(data.followings || []);
      });
  }, [userId]);

  const handleOpen = (type) => setOpenType(type);
  const handleClose = () => setOpenType(null);

  return (
    <Box sx={{ maxWidth: 935, mx: 'auto', mt: 5 }}>
      {/* 상단 프로필 */}
      <Box sx={{ display: 'flex', gap: 8, mb: 5 }}>
        <Avatar src="/assets/profile.jpg" sx={{ width: 150, height: 150 }} />
        <Box>
          <Typography variant="h5">{userId}</Typography>
          <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
            <Typography>게시물 <strong>109</strong></Typography>
            <Typography sx={{ cursor: 'pointer' }} onClick={() => handleOpen('follower')}>
              팔로워 <strong>{followers.length}</strong>
            </Typography>
            <Typography sx={{ cursor: 'pointer' }} onClick={() => handleOpen('following')}>
              팔로잉 <strong>{followings.length}</strong>
            </Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">연주</Typography>
            <Typography color="text.secondary">🌸 hello! welcome to my page 🌸</Typography>
          </Box>
        </Box>
      </Box>

      {/* 탭 메뉴 */}
      <Tabs centered sx={{ borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd' }}>
        <Tab label="게시물" />
        <Tab label="저장됨" />
        <Tab label="태그됨" />
      </Tabs>

      {/* 게시물 격자 출력 */}
      <Grid container spacing={1} sx={{ mt: 2 }}>
        {[...Array(9)].map((_, i) => (
          <Grid item xs={4} key={i}>
            <Box
              component="img"
              src={"/uploads/sample" + (i + 1) + ".png"}
              alt={"post-" + (i + 1)}
              sx={{ width: '100%', height: 300, objectFit: 'cover' }}
            />
          </Grid>
        ))}
      </Grid>

      {/* 팔로워/팔로잉 다이얼로그 */}
      <Dialog open={!!openType} onClose={handleClose} fullWidth>
        <DialogTitle>{openType === 'follower' ? '팔로워 목록' : '팔로잉 목록'}</DialogTitle>
        <DialogContent>
          <List>
            {(openType === 'follower' ? followers : followings).map((user, idx) => (
              <ListItem key={idx}>
                <ListItemAvatar>
                  <Avatar src="/assets/profile.jpg" />
                </ListItemAvatar>
                <ListItemText primary={user.user_id} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default MyPage;
