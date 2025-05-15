import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
  Typography,
  Avatar,
  IconButton,
  Dialog,
  Button
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LikeButton from '../components/LikeButton';
import SaveButton from '../components/SaveButton';
import PostDialog from '../components/PostDialog';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { formatDistanceToNow } from 'date-fns';
import ko from 'date-fns/locale/ko';
import ShareDialog from '../components/ShareDialog';
import { jwtDecode } from 'jwt-decode';
import ShareIcon from '@mui/icons-material/Share';

function Main() {
  const [posts, setPosts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [expandedPostNo, setExpandedPostNo] = useState(null);
  const [likeCounts, setLikeCounts] = useState({});
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePost, setSharePost] = useState(null);
  const [optionsOpenPost, setOptionsOpenPost] = useState(null);

  const [followingMap, setFollowingMap] = useState({});

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

        const initialCounts = {};
        const initialFollowMap = {};

        data.list.forEach(post => {
          initialCounts[post.postNo] = post.likeCount;
          initialFollowMap[post.userId] = post.isFollowing;
        });
        setLikeCounts(initialCounts);
        setFollowingMap(initialFollowMap);
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

  const highlightTags = (text) => {
    const parts = text.split(/([@#][a-zA-Z0-9가-힣_]+)/g); // 멘션 & 해시태그 추출
    return parts.map((part, idx) =>
      part.startsWith('@') || part.startsWith('#') ? (
        <span key={idx} style={{ color: 'purple', fontWeight: 500 }}>{part}</span>
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  };

  const toggleFollow = async (targetUserId) => {
    const isFollowing = followingMap[targetUserId];
    try {
      await fetch(`http://localhost:4000/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          "Content-Type": "application/json",
          "authorization": "Bearer " + token
        },
        body: JSON.stringify({ targetUserId })
      });
      setFollowingMap(prev => ({
        ...prev,
        [targetUserId]: !isFollowing
      }));
    } catch (err) {
      console.error('팔로우 토글 실패:', err);
    }
  };

  const handleDeletePost = async (postNo) => {
    try {
      const res = await fetch(`http://localhost:4000/post/${postNo}`, {
        method: 'DELETE',
        headers: {
          "authorization": "Bearer " + token
        }
      });
      if (res.ok) {
        // 삭제 성공 시 posts에서 제거
        setPosts(prev => prev.filter(p => p.postNo !== postNo));
        setOptionsOpenPost(null);
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('게시글 삭제 오류:', err);
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      {posts.map((post) => {
        const index = currentImageIndex[post.postNo] || 0;
        const imageUrl = post.images?.[index] || '';

        return (
          <Card key={post.postNo} sx={{ mb: 2, borderRadius: 0, boxShadow: 'none', borderBottom: '1px solid #ccc' }}>
            {/* 프로필 영역 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={post.profileImg ? 'http://localhost:4000/' + post.profileImg : '/assets/default-profile.png'}
                  sx={{ mr: 1 }}
                />

                <Typography variant="subtitle2" fontWeight="bold">{post.userId}</Typography>
                <Typography variant="caption" sx={{ ml: 1, color: 'gray' }}>
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
                </Typography>
                {userId !== post.userId && (
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 1,
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      color: followingMap[post.userId] ? 'gray' : 'purple',
                      '&:hover': {
                        color: '#6a1b9a'
                      }
                    }}
                    onClick={() => toggleFollow(post.userId)}
                  >
                    {followingMap[post.userId] ? '팔로잉' : '팔로우'}
                  </Typography>
                )}
              </Box>
              <IconButton onClick={() => setOptionsOpenPost(post)}>
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
                  sx={{ height: 600, objectFit: 'cover' }}
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

                    <Box sx={{
                      position: 'absolute',
                      bottom: 8,
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 1
                    }}>
                      {post.images.map((_, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: idx === index ? '#fff' : '#888'
                          }}
                        />
                      ))}
                    </Box>
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
                  <IconButton sx={{ ml: 0.8 }} size="small" onClick={() => {
                    setSelectedPost(post);
                    setDialogOpen(true);
                  }}>
                    <ChatBubbleOutlineIcon />
                  </IconButton>
                  <IconButton sx={{ mb: 0.3 }} size="small" onClick={() => {
                    setSharePost(post);
                    setShareOpen(true);
                  }}>
                    <ShareIcon />
                  </IconButton>

                  <ShareDialog
                    open={shareOpen}
                    onClose={() => setShareOpen(false)}
                    post={sharePost}
                    userId={userId}
                  />
                </Box>

                {/* 오른쪽: 저장 버튼 */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton size="small">
                    <SaveButton
                      postNo={post.postNo}
                      initialSaved={post.savedByMe}
                    />
                  </IconButton>
                </Box>
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
                <b>{post.userId}</b> {highlightTags(post.content)}
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

      <Dialog
        open={!!optionsOpenPost}
        onClose={() => setOptionsOpenPost(null)}
        PaperProps={{
          sx: {
            width: 360,
            borderRadius: 3,
            overflow: 'hidden',
          }
        }}
      >
        <Box>
          {optionsOpenPost?.userId === userId ? (
            <>
              <Button
                fullWidth
                onClick={() => handleDeletePost(optionsOpenPost.postNo)}
                sx={{
                  color: 'red',
                  fontSize: 16,
                  py: 2,
                  borderBottom: '1px solid #ddd'
                }}
              >
                게시글 삭제
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  setOptionsOpenPost(null);
                }}
                sx={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  borderBottom: '1px solid #ddd',
                  py: 2
                }}
              >
                게시글 수정
              </Button>
            </>
          ) : (
            <Button
              fullWidth
              onClick={() => {
                // TODO: 신고 기능 연결
                alert("신고 클릭됨");
                setOptionsOpenPost(null);
              }}
              sx={{
                color: 'red',
                fontWeight: 'bold',
                fontSize: 16,
                borderBottom: '1px solid #ddd',
                py: 2
              }}
            >
              신고
            </Button>
          )}
          <Button
            fullWidth
            onClick={() => setOptionsOpenPost(null)}
            sx={{
              fontSize: 16,
              py: 2
            }}
          >
            취소
          </Button>
        </Box>
      </Dialog>

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

const optionBtnStyle = {
  px: 2,
  py: 1,
  textAlign: 'center',
  cursor: 'pointer',
  borderRadius: 1,
  fontWeight: 500,
  '&:hover': {
    backgroundColor: '#f5f5f5'
  }
};


export default Main;
