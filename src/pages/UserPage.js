import React, { useEffect, useState } from 'react';
import {
  Box, Avatar, Typography, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, List, ListItem, ListItemAvatar, ListItemText, Button
} from '@mui/material';
import GridOnIcon from '@mui/icons-material/GridOn';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import PostDialog from '../components/PostDialog';

function UserPage() {
  const token = localStorage.getItem('token');
  const myId = token ? jwtDecode(token).userId : '';
  const { userId } = useParams();
  const [tabIndex, setTabIndex] = useState(0);
  const [posts, setPosts] = useState([]);
  const [taggedPosts, setTaggedPosts] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [openType, setOpenType] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const headers = {
    authorization: 'Bearer ' + token
  };

  useEffect(() => {
    fetch(`http://localhost:4000/user/info/${userId}`, { headers })
      .then(res => res.json())
      .then(data => setUserInfo(data));

    fetch(`http://localhost:4000/post/user/${userId}`, { headers })
      .then(res => res.json())
      .then(data => setPosts(data.list || []));

    fetch(`http://localhost:4000/tag/tagged/${userId}`, { headers })
      .then(res => res.json())
      .then(data => setTaggedPosts(data || []));

    fetch(`http://localhost:4000/follow/status/${userId}`, { headers })
      .then(res => res.json())
      .then(data => setIsFollowing(data.isFollowing));

    // ✅ 팔로워 목록 가져오기
    fetch(`http://localhost:4000/follow/followers/${userId}`, { headers })
      .then(res => res.json())
      .then(data => setFollowers(data.followers || []));

    // ✅ 팔로잉 목록 가져오기
    fetch(`http://localhost:4000/follow/followings/${userId}`, { headers })
      .then(res => res.json())
      .then(data => setFollowings(data.followings || []));
  }, [userId]);

  useEffect(() => {
    if (!openType) return;

    const endpoint = openType === 'follower' ? 'followers' : 'followings';
    fetch(`http://localhost:4000/follow/${endpoint}/${userId}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (openType === 'follower') setFollowers(data.followers || []);
        else setFollowings(data.followings || []);
      });
  }, [openType, userId]);

  const handleFollowToggle = () => {
    const url = `http://localhost:4000/follow/${userId}`;
    const method = isFollowing ? 'DELETE' : 'POST';
    fetch(url, { method, headers })
      .then(res => res.json())
      .then(data => {
        if (data.success) setIsFollowing(!isFollowing);
      });
  };

  const renderPosts = tabIndex === 0 ? posts : taggedPosts;

  return (
    <Box sx={{ maxWidth: 950, mx: 'auto', mt: 5 }}>
      <Box sx={{ display: 'flex', gap: 8, mb: 5, ml: 20 }}>
        <Avatar
          src={userInfo?.profile_img ? 'http://localhost:4000/' + userInfo.profile_img : '/assets/profile.jpg'}
          sx={{ width: 150, height: 150, border: '2px solid #ccc' }}
        />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="h5">{userId}</Typography>
            {myId !== userId && (
              <Button
                variant={isFollowing ? 'outlined' : 'contained'}
                size="small"
                onClick={handleFollowToggle}
                sx={{
                  fontWeight: 'bold',
                  borderRadius: 2,
                  borderColor: '#b39ddb',
                  backgroundColor: isFollowing ? 'transparent' : '#c7b8f5',
                  color: isFollowing ? '#7e57c2' : '#fff',
                  '&:hover': {
                    backgroundColor: isFollowing ? '#ede7f6' : '#a18df2',
                    borderColor: '#9575cd'
                  }
                }}
              >
                {isFollowing ? '팔로잉' : '팔로우'}
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
            <Typography>게시물 <strong>{posts.length}</strong></Typography>
            <Typography sx={{ cursor: 'pointer' }} onClick={() => setOpenType('follower')}>
              팔로워 <strong>{followers.length}</strong>
            </Typography>
            <Typography sx={{ cursor: 'pointer' }} onClick={() => setOpenType('following')}>
              팔로잉 <strong>{followings.length}</strong>
            </Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontWeight: 'bold' }}>{userInfo?.name || ''}</Typography>
            <Typography color="text.secondary">{userInfo?.bio || ''}</Typography>
          </Box>
        </Box>
      </Box>

      {/* 탭 */}
      <Box sx={{ width: 916, mx: 'auto', mt: 1, ml: 10 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          variant="fullWidth"
          TabIndicatorProps={{ style: { backgroundColor: '#a18df2' } }}
          sx={{
            borderTop: '1px solid #d1c4e9',
            borderBottom: '1px solid #d1c4e9',
            minHeight: 40, // 높이 줄이기
            '& .MuiTab-root': {
              minHeight: 40, // 각 탭 높이
              fontSize: 13,
              fontWeight: 'bold',
              color: '#a18df2',
              textTransform: 'none',
              px: 1.5,
              '&.Mui-selected': {
                color: '#7e57c2'
              }
            }
          }}
        >
          <Tab icon={<GridOnIcon />} label="게시물" iconPosition="start" />
          <Tab icon={<PersonPinIcon />} label="태그됨" iconPosition="start" />
        </Tabs>
      </Box>

      {/* 게시물 */}
      <Box
        sx={{
          width: 916,
          mx: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mt: 2,
          ml: 10
        }}
      >
        {renderPosts.length === 0 ? (
          <Box sx={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            {tabIndex === 0 ? '게시물이 없습니다.' : '태그된 게시물이 없습니다.'}
          </Box>
        ) : (
          renderPosts.map((post) => (
            <Box
              key={post.post_no}
              onClick={() => {
                setSelectedPost({
                  ...post,
                  images: post.image_urls
                });
                setDialogOpen(true);
              }}
              sx={{
                width: 300,
                height: 300,
                borderRadius: 1,
                border: '1px solid #d1c4e9',
                overflow: 'hidden',
                backgroundColor: post.image_urls.length > 0 ? 'transparent' : '#f5f0ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                p: 1,
                '&:hover': {
                  backgroundColor: '#f3e5f5',
                  opacity: 0.9
                }
              }}
            >
              {post.image_urls.length > 0 ? (
                <Box
                  component="img"
                  src={'http://localhost:4000' + post.image_urls[0]}
                  alt="post"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Typography fontSize={14} color="#333">{post.content}</Typography>
              )}
            </Box>
          ))
        )}
      </Box>

      {/* 팔로워/팔로잉 모달 */}
      <Dialog open={!!openType} onClose={() => setOpenType(null)} fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          {openType === 'follower' ? '팔로워 목록' : '팔로잉 목록'}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {(openType === 'follower' ? followers : followings).map((user, idx) => (
              <ListItem key={idx}>
                <ListItemAvatar>
                  <Avatar
                    src={user.profile_img ? 'http://localhost:4000/' + user.profile_img : '/assets/profile.jpg'}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography fontWeight="bold">{user.userId}</Typography>}
                  secondary={<Typography fontSize={12}>{user.name}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* 게시글 다이얼로그 */}
      <PostDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        post={selectedPost}
      />
    </Box>
  );
}

export default UserPage;
