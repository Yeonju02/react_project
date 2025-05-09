import React, { useEffect, useState } from 'react';
import {
  Box, Avatar, Typography, Grid, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, List, ListItem, ListItemAvatar, ListItemText, Button
} from '@mui/material';
import GridOnIcon from '@mui/icons-material/GridOn';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import { jwtDecode } from 'jwt-decode';

function MyPage() {
  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).userId : '';
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [openType, setOpenType] = useState(null); // 'follower' or 'following'
  const [tabIndex, setTabIndex] = useState(0);
  const [posts, setPosts] = useState([]);


  useEffect(() => {
    if (!userId) return;
    fetch('http://localhost:4000/follow/' + userId)
      .then(res => res.json())
      .then(data => {
        setFollowers(data.followers || []);
        setFollowings(data.followings || []);
    });

    fetch('http://localhost:4000/post/user/' + userId)
    .then(res => res.json())
    .then(data => {
      console.log("받은 게시글 : ", data.list);
      setPosts(data.list || []);
    });
  }, [userId]);

  const handleOpen = (type) => setOpenType(type);
  const handleClose = () => setOpenType(null);

  return (
    <Box sx={{ maxWidth: 935, mx: 'auto', mt: 5 }}>
      {/* 상단 프로필 */}
      <Box sx={{ display: 'flex', gap: 8, mb: 5 }}>
        <Avatar
          src="/assets/profile.jpg"
          sx={{
            width: 150,
            height: 150,
            border: '2px solid #ccc'
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="h5">{userId}</Typography>
            <Button variant="outlined" size="small">프로필 편집</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
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
      <Tabs
        centered
        value={tabIndex}
        onChange={(e, val) => setTabIndex(val)}
        sx={{ borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd' }}
      >
        <Tab icon={<GridOnIcon />} label="게시물" />
        <Tab icon={<BookmarkBorderIcon />} label="저장됨" />
        <Tab icon={<PersonPinIcon />} label="태그됨" />
      </Tabs>

      {/* 게시물 격자 출력 */}
      <Box
        sx={{
          width: 916, // ← 300px * 3 + gap * 2
          mx: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1, // 8px gap
          mt: 2
        }}
      >
        {posts.map((post) => (
          <Box
            key={post.post_no}
            sx={{
              width: 300,
              height: 300,
              borderRadius: 1,
              border: '1px solid #ccc',
              overflow: 'hidden',
              backgroundColor: post.image_urls.length > 0 ? 'transparent' : '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 1
            }}
          >
            {post.image_urls.length > 0 ? (
              <Box
                component="img"
                src={'http://localhost:4000' + post.image_urls[0]}
                alt="post"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <Typography
                variant="body2"
                sx={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 5,
                  overflow: 'hidden',
                  whiteSpace: 'pre-line',
                  fontSize: '14px',
                  color: '#333'
                }}
              >
                {post.content}
              </Typography>
            )}
          </Box>
        ))}
      </Box>


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
