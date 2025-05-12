import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Avatar,
  IconButton
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import LikeButton from '../components/LikeButton';
import SaveButton from '../components/SaveButton';
import PostDialog from '../components/PostDialog';

function Main() {
  const [posts, setPosts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const MAX_LINES = 1;
  const [expandedPost, setExpandedPost] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("👉 보내는 토큰:", token);

    fetch('http://localhost:4000/post', {
        headers: {
            "authorization" : "Bearer " + token
        }
    })
      .then(res => res.json())
      .then(data => 
        {   console.log("👉 서버 응답 데이터:", data);
            setPosts(data.list)
        })
      .catch(err => console.error('게시글 불러오기 실패:', err));
  }, []);

  const handleSlide = (postNo, direction, imagesLength) => {
    setCurrentImageIndex(prev => {
      const current = prev[postNo] || 0;
      const next = (current + direction + imagesLength) % imagesLength;
      return { ...prev, [postNo]: next };
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      {posts.map((post) => {
        const index = currentImageIndex[post.postNo] || 0;
        const imageUrl = post.images?.[index] || '';

        return (
          <Card key={post.postNo} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
              <Avatar src={`/assets/profile.jpg`} sx={{ mr: 1 }} />
              <Typography variant="subtitle1">{post.userId}</Typography>
            </Box>

            {post.images?.length > 0 && (
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  image={"http://localhost:4000" + imageUrl}
                  alt="게시글 이미지"
                  sx={{ height: 400, objectFit: 'cover' }}
                />
                {post.images.length > 1 && (
                  <>
                    <IconButton
                      onClick={() => handleSlide(post.postNo, -1, post.images.length)}
                      sx={{ position: 'absolute', top: '50%', left: 8, color: 'white' ,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',  
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.6)' 
                        }}}
                    >
                      <ArrowBackIosNewIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleSlide(post.postNo, 1, post.images.length)}
                      sx={{ position: 'absolute', top: '50%', right: 8, color: 'white' ,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',  
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.6)' 
                        }}}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    {post.images.map((_, i) => (
                    <Box
                        key={i}
                        sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: i === index ? 'black' : '#ccc',
                        mx: 0.5
                        }}
                    />
                    ))}
                </Box>
              </Box>
            )}

            <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LikeButton
                  postNo={post.postNo}
                  initialLiked={post.likedByMe}
                  initialCount={post.likeCount}
                  onLike={async () => {
                    const token = localStorage.getItem('token');
                    const senderId = JSON.parse(atob(token.split('.')[1])).userId;
                    const receiverId = post.userId;

                    if (senderId === receiverId) return; // 자기 자신에게는 알림 X

                    await fetch('http://localhost:4000/notification', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        receiver_id: receiverId,
                        sender_id: senderId,
                        type: 'like',
                        content: `${senderId}님이 회원님의 게시글을 좋아했습니다.`,
                        target_post: post.postNo
                      })
                    });
                  }}
                />
                <IconButton
                    size="small"
                    sx={{ color: 'gray' }}
                    onClick={() => {
                        setSelectedPost(post);
                        setDialogOpen(true);
                    }}
                    >
                    <ChatBubbleOutlineIcon />
                </IconButton>

                <IconButton size="small" sx={{ color: 'gray' }}>
                    <SendIcon />
                </IconButton>
                </Box>
                <SaveButton
                    postNo={post.postNo}
                    initialSaved={post.savedByMe} 
                />
            </Box>
            <Box>
                <Typography
                    variant="body2"
                    sx={{
                    whiteSpace: 'pre-line',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: expandedPost === post.postNo ? 'none' : MAX_LINES,
                    WebkitBoxOrient: 'vertical',
                    }}
                >
                    {post.content}
                </Typography>

                {post.content.split('\n').length > MAX_LINES && expandedPost !== post.postNo && (
                    <Typography
                    variant="body2"
                    color="primary"
                    sx={{ cursor: 'pointer', fontWeight: 500 }}
                    onClick={() => setExpandedPost(post.postNo)}
                    >
                    더보기
                    </Typography>
                )}
                </Box>

            <Typography variant="caption" color="textSecondary">
                {post.createdAt}
            </Typography>
            </CardContent>
          </Card>
        );
      })}
      <PostDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        post={selectedPost}
      />

    </Box>
  );
}

export default Main;
