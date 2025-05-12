import React, { useEffect, useState } from 'react';
import {
  Box, Avatar, Typography, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, List, ListItem, ListItemAvatar, ListItemText, Button
} from '@mui/material';
import GridOnIcon from '@mui/icons-material/GridOn';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import { jwtDecode } from 'jwt-decode';
import SearchIcon from '@mui/icons-material/Search';

function MyPage() {
  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).userId : '';
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [openType, setOpenType] = useState(null); // 'follower' or 'following'
  const [tabIndex, setTabIndex] = useState(0);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);

  const renderPosts = tabIndex === 0 ? posts : savedPosts;

  const headers = {
    'authorization' : 'Bearer ' + token
  };

  useEffect(() => {
  if (!userId) return;

  // ✅ 초기 팔로워/팔로잉 정보 가져오기
  fetch(`http://localhost:4000/follow/followers/${userId}`, { headers })
    .then(res => res.json())
    .then(data => setFollowers(data.followers || []));

  fetch(`http://localhost:4000/follow/followings/${userId}`, { headers })
    .then(res => res.json())
    .then(data => setFollowings(data.followings || []));
}, [userId]);

  useEffect(() => {
  if (!userId || !openType) return;

  if (openType === 'follower') {
    fetch('http://localhost:4000/follow/followers/' + userId, { headers })
      .then(res => res.json())
      .then(data => setFollowers(data.followers || []));
  } else if (openType === 'following') {
    fetch('http://localhost:4000/follow/followings/' + userId, { headers })
      .then(res => res.json())
      .then(data => setFollowings(data.followings || []));
  }
}, [openType, userId]);

  useEffect(() => {
    if (!userId) return;

    fetch('http://localhost:4000/post/user/' + userId, { headers })
      .then(res => res.json())
      .then(data => setPosts(data.list || []));

    fetch('http://localhost:4000/save/saved/' + userId, { headers })
      .then(res => res.json())
      .then(data => setSavedPosts(data.list || []));
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
            <Typography>게시물 <strong>{posts.length}</strong></Typography>
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
          width: 916,
          mx: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mt: 2
        }}
      >
        {renderPosts.map((post) => (
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
        <DialogTitle sx={{ textAlign: 'center' }}>
          {openType === 'follower' ? '팔로워 목록' : '팔로잉 목록'}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: 2, pt: 1 }}>
            <Box
              component="input"
              placeholder="검색"
              sx={{
                width: '100%',
                p: 1,
                border: '1px solid #ccc',
                borderRadius: 1,
                mb: 1,
                fontSize: 14
              }}
            />
          </Box>

          <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {(openType === 'follower' ? followers : followings).length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 10,
                  color: '#999',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <SearchIcon sx={{ fontSize: 50, mb: 1 }} />
                <Typography fontSize={14}>
                  회원님
                  {openType === 'follower'
                    ? '을 팔로우하는 사람이 여기에 표시됩니다'
                    : '이 팔로우하는 사람이 여기에 표시됩니다'}
                </Typography>
              </Box>
            ) : (
              (openType === 'follower' ? followers : followings).map((user, idx) => (
                <ListItem
                  key={idx}
                  secondaryAction={
                    openType === 'follower' ? (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          setFollowers(prev => prev.filter(u => u.userId !== user.userId))
                        }
                        sx={{
                          fontSize: 12,
                          minWidth: 60,
                          borderRadius: 5,
                          borderColor: '#dbdbdb',
                          color: '#262626',
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#bbb',
                            backgroundColor: '#fafafa'
                          }
                        }}
                      >
                        삭제
                      </Button>
                    ) : (
                      <Button
                        variant={user.isFollowing === 1 ? 'outlined' : 'contained'}
                        size="small"
                        onClick={async () => {
                          const url = `http://localhost:4000/follow/${user.userId}`;
                          const method = user.isFollowing === 1 ? 'DELETE' : 'POST';

                          const res = await fetch(url, {
                            method,
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                          });

                          const data = await res.json();
                          if (data.success) {
                            setFollowings(prev =>
                              prev.map(u =>
                                u.userId === user.userId ? { ...u, isFollowing: user.isFollowing === 1 ? 0 : 1 } : u
                              )
                            );
                          }
                        }}
                        sx={{
                          fontSize: 12,
                          minWidth: 60,
                          borderRadius: 5,
                          textTransform: 'none',
                          backgroundColor: user.isFollowing === 1 ? 'transparent' : '#0095f6',
                          color: user.isFollowing === 1 ? '#262626' : '#fff',
                          borderColor: '#dbdbdb',
                          '&:hover': {
                            backgroundColor: user.isFollowing === 1 ? '#fafafa' : '#007bd1'
                          }
                        }}
                      >
                        {user.isFollowing === 1 ? '팔로잉' : '팔로우'}
                      </Button>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      src={user.profile_img || '/assets/profile.jpg'}
                      sx={{ width: 44, height: 44 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography fontWeight="bold" fontSize={14}>
                        {user.userId}
                      </Typography>
                    }
                    secondary={
                      <Typography fontSize={12} color="text.secondary">
                        {user.name || ''}
                      </Typography>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default MyPage;
