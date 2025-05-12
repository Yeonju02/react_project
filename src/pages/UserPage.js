import React, { useEffect, useState } from 'react';
import {
  Box, Avatar, Typography, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, List, ListItem, ListItemAvatar, ListItemText, Button
} from '@mui/material';
import GridOnIcon from '@mui/icons-material/GridOn';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import SearchIcon from '@mui/icons-material/Search'; 

function UserPage() {
  const token = localStorage.getItem('token');
  const myId = token ? jwtDecode(token).userId : '';
  const { userId } = useParams();
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [openType, setOpenType] = useState(null);

  const [myFollowings, setMyFollowings] = useState([]); // 내가 팔로우 중인 사용자

    useEffect(() => {
    if (!myId) return;

    // 내가 팔로우한 목록 (myId 기준)
    fetch("http://localhost:4000/follow/followings/" + myId, {
        headers: {
            'authorization': 'Bearer ' + token
            }
    })
        .then(res => res.json())
        .then(data => {
        setMyFollowings(data.followings || []);
        });
    }, [myId]);

    useEffect(() => {
        if (!userId || !myId) return;

        fetch('http://localhost:4000/follow/status/' + userId, {
            headers: {
            'authorization': 'Bearer ' + token
            }
        })
            .then(res => res.json())
            .then(data => {
            setIsFollowing(data.isFollowing);  // 서버에서 true/false 반환
            });

            // 유저의 팔로워 목록
            fetch('http://localhost:4000/follow/followers/' + userId, {
                headers: { 'authorization': 'Bearer ' + token }
            })
                .then(res => res.json())
                .then(data => {
                setFollowers(data.followers || []);
                });

            // 유저의 팔로잉 목록
            fetch('http://localhost:4000/follow/followings/' + userId, {
                headers: { 'authorization': 'Bearer ' + token }
            })
                .then(res => res.json())
                .then(data => {
                setFollowings(data.followings || []);
                });
        }, [userId, myId]);


    // 해당 유저가 내가 팔로우한 사람인지 확인
    const isFollowedByMe = (targetUserId) => {
    return myFollowings.some(user => user.user_id === targetUserId);
    };

    // 목록 내 팔로우/언팔로우 토글
    const toggleFollow = (targetUserId, followed) => {
        const url = 'http://localhost:4000/follow/' + targetUserId;
        fetch(url, {
            method: followed ? 'DELETE' : 'POST',
            headers: {
            'authorization': 'Bearer ' + token
            }
        })
            .then(res => res.json())
            .then(data => {
            if (data.success) {
                setMyFollowings(prev =>
                followed
                    ? prev.filter(user => user.userId !== targetUserId)
                    : [...prev, { userId: targetUserId }]
                );

                if (openType === 'follower') {
                setFollowers(prev =>
                    followed
                    ? prev.filter(user => user.userId !== myId)
                    : [...prev, { userId: myId }]
                );
                } else if (openType === 'following') {
                setFollowings(prev =>
                    followed
                    ? prev.filter(user => user.userId !== targetUserId)
                    : [...prev, { userId: targetUserId }]
                );
                }

                if (targetUserId === userId) {
                setIsFollowing(!followed);
                }
            }
            });
        };


    useEffect(() => {
        if (!openType || !myId) return;
        fetch("http://localhost:4000/follow/followings/" + myId, {
        headers: {
            'authorization': 'Bearer ' + token
            }
    })
            .then(res => res.json())
            .then(data => {
            setMyFollowings(data.followings || []);
            });
    }, [openType, myId]);


    const handleFollow = () => toggleFollow(userId, false);
    const handleUnfollow = () => toggleFollow(userId, true);

  return (
    <Box sx={{ maxWidth: 935, mx: 'auto', mt: 5 }}>
      {/* 상단 프로필 */}
      <Box sx={{ display: 'flex', gap: 8, mb: 5 }}>
        <Avatar
          src="/assets/profile.jpg"
          sx={{ width: 150, height: 150, border: '2px solid #ccc' }}
        />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="h5">{userId}</Typography>
            {isFollowing ? (
              <Button variant="outlined" size="small" onClick={handleUnfollow}>팔로잉</Button>
            ) : (
              <Button variant="contained" size="small" onClick={handleFollow}>팔로우</Button>
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
            <Typography variant="subtitle2">프로필 소개</Typography>
            <Typography color="text.secondary">🌸 hello! welcome to user page 🌸</Typography>
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
      </Tabs>

      {/* 게시물 */}
      <Box sx={{ width: 916, mx: 'auto', display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
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
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
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

      <Dialog open={!!openType} onClose={() => setOpenType(null)} fullWidth maxWidth="xs">
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
                        user.userId !== myId && (
                            <Button
                            variant={user.isFollowing === 1 ? 'outlined' : 'contained'}
                            size="small"
                            onClick={async () => {
                                const url = 'http://localhost:4000/follow/' + user.userId;
                                const method = user.isFollowing === 1 ? 'DELETE' : 'POST';

                                const res = await fetch(url, {
                                method,
                                headers: {
                                    'authorization': 'Bearer ' + token
                                }
                                });

                                const data = await res.json();
                                if (data.success) {
                                const updated = { ...user, isFollowing: user.isFollowing === 1 ? 0 : 1 };
                                if (openType === 'follower') {
                                    setFollowers(prev =>
                                    prev.map(u => (u.userId === user.userId ? updated : u))
                                    );
                                } else {
                                    setFollowings(prev =>
                                    prev.map(u => (u.userId === user.userId ? updated : u))
                                    );
                                }
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

export default UserPage;