import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
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
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { formatDistanceToNow } from 'date-fns';
import ko from 'date-fns/locale/ko';
import ShareDialog from '../components/ShareDialog';
import { jwtDecode } from 'jwt-decode';

function Main() {
  const [posts, setPosts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [expandedPostNo, setExpandedPostNo] = useState(null);
  const [likeCounts, setLikeCounts] = useState({});
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePost, setSharePost] = useState(null);
  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).userId : '';

  useEffect(() => {
    fetch('http://localhost:4000/post', {
      headers: {
        "authorization": "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => {
        setPosts(data.list);
        // 초기 좋아요 수 상태 저장
        const initialCounts = {};
        data.list.forEach(post => {
          initialCounts[post.postNo] = post.likeCount;
        });
  setLikeCounts(initialCounts);
})

      .catch(err => console.error('게시글 불러오기 실패:', err));
  }, [token]);

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
          <Card key={post.postNo} sx={{ mb: 2, borderRadius: 0, boxShadow: 'none', borderBottom: '1px solid #ccc' }}>
            {/* 프로필 영역 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={`/assets/profile.jpg`} sx={{ mr: 1 }} />
                <Typography variant="subtitle2" fontWeight="bold">{post.userId}</Typography>
                <Typography variant="caption" sx={{ ml: 1, color: 'gray' }}>
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
                </Typography>
                <Typography variant="body2" sx={{ ml: 1, color: '#1976d2', fontWeight: 'bold', cursor: 'pointer' }}>
                  팔로우
                </Typography>
              </Box>
              <IconButton>
                <MoreHorizIcon />
              </IconButton>
            </Box>

            {/* 이미지 */}
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
                      sx={navBtnStyle('left')}
                    >
                      <ArrowBackIosNewIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleSlide(post.postNo, 1, post.images.length)}
                      sx={navBtnStyle('right')}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            )}

            {/* 인터랙션 버튼 */}
            <Box sx={{ px: 2, pt: 1 }}>
              {/* 아이콘 줄 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* 왼쪽: 좋아요, 댓글, 공유 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LikeButton
                    postNo={post.postNo}
                    initialLiked={post.likedByMe}
                    initialCount={likeCounts[post.postNo]}
                    onLike={() => { /* 알림 처리 등 */ }}
                    onLikeToggle={(newCount) =>
                      setLikeCounts(prev => ({ ...prev, [post.postNo]: newCount }))
                    }
                  />
                  <IconButton size="small" onClick={() => {
                    setSelectedPost(post);
                    setDialogOpen(true);
                  }}>
                    <ChatBubbleOutlineIcon />
                  </IconButton>
                  <IconButton  size="small" onClick={() => {
                    setSharePost(post);
                    setShareOpen(true);
                  }}>
                    <SendIcon />
                  </IconButton>

                  <ShareDialog
                    open={shareOpen}
                    onClose={() => setShareOpen(false)}
                    post={sharePost}
                    userId={userId}
                  />
                </Box>

                {/* 오른쪽: 저장 버튼 */}
                <SaveButton
                  postNo={post.postNo}
                  initialSaved={post.savedByMe}
                />
              </Box>

              {/* 좋아요 수 */}
              <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                좋아요 {likeCounts[post.postNo] || 0}개
              </Typography>
            </Box>

            {/* 내용 */}
            <Box sx={{ px: 2, pb: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-line',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: expandedPostNo === post.postNo ? 'unset' : 1,
                  WebkitBoxOrient: 'vertical',
                  mt: 1
                }}
              >
                <b>{post.userId}</b> {post.content}
              </Typography>

              {/* 더보기 버튼 */}
              {post.content.split('\n').length > 2 || post.content.length > 100 ? (
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ cursor: 'pointer', fontWeight: 500 }}
                  onClick={() =>
                    setExpandedPostNo(
                      expandedPostNo === post.postNo ? null : post.postNo
                    )
                  }
                >
                  {expandedPostNo === post.postNo ? '' : '더보기'}
                </Typography>
              ) : null}

              {/* 댓글 수 */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, fontWeight: 500, cursor: 'pointer' }}
                onClick={() => {
                  setSelectedPost(post);
                  setDialogOpen(true);
                }}
              >
                댓글 {post.commentCount || 0}개 보기
              </Typography>
            </Box>
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

// 스타일 함수
const navBtnStyle = (position) => ({
  position: 'absolute',
  top: '50%',
  [position]: 8,
  color: 'white',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  },
  transform: 'translateY(-50%)'
});

export default Main;
