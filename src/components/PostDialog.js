import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, Typography, IconButton, Box, Avatar, TextField, Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import heartEmpty from '../assets/heart-empty.png';
import heartFilled from '../assets/heart-filled.png';

function PostDialog({ open, onClose, post }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (post && open) {
      const token = localStorage.getItem('token');
      fetch("http://localhost:4000/comment/" + post.postNo, {
        headers: {
          "authorization" : "Bearer " + token
        }
      })
        .then(res => res.json())
        .then(data => setComments(data.list || []));
      setCurrentIndex(0);
    }
  }, [post, open]);
  

  const handleAddComment = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "authorization" : "Bearer " + token
      },
      body: JSON.stringify({
        postNo: post.postNo,
        content: newComment
      })
    });

    const data = await res.json();
    if (data.success) {
      setComments(prev => [...prev, { userId: data.userId, content: newComment }]);
      setNewComment('');
    }
  };

  const handleReplySubmit = async (parentId) => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "authorization" : 'Bearer ' + token
      },
      body: JSON.stringify({
        postNo: post.postNo,
        content: replyText,
        parentId: parentId
      })
    });
  
    const data = await res.json();
    if (data.success) {
      // 새로고침 or 댓글 새로 fetch
      const updated = await fetch("http://localhost:4000/comment/" + post.postNo)
        .then(res => res.json());
      setComments(updated.list || []);
      setReplyText('');
      setReplyTarget(null);
    }
  };

  const handleSlide = (direction) => {
    const len = post.images.length;
    setCurrentIndex((prev) => (prev + direction + len) % len);
  };

  const handleCommentLikeToggle = async (commentNo) => {
    const token = localStorage.getItem('token');
    const comment = comments.find(c => c.comment_no === commentNo);
    const isLiked = comment?.likedByMe;
  
    const res = await fetch("http://localhost:4000/comment/like/" + commentNo, {
      method: isLiked ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': 'Bearer ' + token
      }
    });
  
    const data = await res.json();
    if (data.success) {
      // 좋아요 상태 로컬 업데이트
      setComments(prev =>
        prev.map(c =>
          c.comment_no === commentNo
            ? {
                ...c,
                likedByMe: !isLiked,
                likeCount: (c.likeCount || 0) + (isLiked ? -1 : 1)
              }
            : c
        )
      );
    }
  };
  

  if (!post) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogContent sx={{ display: 'flex', p: 0 }}>
        {/* 왼쪽: 이미지 슬라이드 */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ position: 'relative', height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#f0f0f0' }}>
            {post.images?.length > 0 ? (
                <>
                <img
                    src={"http://localhost:4000" + post.images[currentIndex]}
                    alt="게시글"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {post.images.length > 1 && (
                    <>
                    <IconButton
                        onClick={() => handleSlide(-1)}
                        sx={{ position: 'absolute', top: '50%', left: 10, color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.6)' } }}
                    >
                        <ArrowBackIosNewIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => handleSlide(1)}
                        sx={{ position: 'absolute', top: '50%', right: 10, color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.6)' } }}
                    >
                        <ArrowForwardIosIcon />
                    </IconButton>
                    </>
                )}
                </>
            ) : (
                
                <Typography variant="subtitle1" color="textSecondary">
                이미지가 첨부되지 않은 게시글입니다
                </Typography>
            )}
            </Box>

        {/* ✅ 이미지 아래에 dot 표시 */}
        {post.images?.length > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                {post.images.map((_, i) => (
                <Box
                    key={i}
                    sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: i === currentIndex ? 'black' : '#ccc',
                    mx: 0.5
                    }}
                />
                ))}
            </Box>
            )}
        </Box>

        {/* 오른쪽: 댓글 + 입력 */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src={`/assets/profile.jpg`} sx={{ mr: 1 }} />
              <Typography variant="h6">{post.userId}</Typography>
            </Box>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
          </Box>

          <Typography variant="body2" sx={{ my: 1 }}>{post.content}</Typography>

          <Box sx={{ borderTop: '1px solid #ddd', my: 1 }} />

          <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
            {comments.map((cmt) => (
                <Box key={cmt.comment_no} sx={{ mb: 2, ml: 1 }}>
                {/* 댓글 상단: 아바타 + 아이디 + 본문 */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar src="/assets/profile.jpg" sx={{ width: 30, height: 30, mr: 1 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{cmt.user_id}</Typography>
                    <Typography variant="body2">{cmt.content}</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="caption" color="textSecondary">{cmt.createdAt}</Typography>
                      <Typography variant="caption" color="textSecondary">좋아요 {cmt.likeCount || 0}개</Typography>
                      <Button size="small" sx={{ textTransform: 'none', p: 0, minWidth: 0 }} onClick={() => setReplyTarget(cmt.comment_no)}>
                        <Typography variant="caption" color="textSecondary">답글 달기</Typography>
                      </Button>
                    </Box>
                  </Box>
              
                  {/* 좋아요 하트 */}
                  <img
                    src={cmt.likedByMe ? heartFilled : heartEmpty}
                    alt="like"
                    style={{ width: 18, height: 18, cursor: 'pointer', marginLeft: 'auto' }}
                    onClick={() => handleCommentLikeToggle(cmt.comment_no)}
                  />
                </Box>
              
                {/* 대댓글 입력 */}
                {replyTarget === cmt.comment_no && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, ml: 4 }}>
                    <TextField
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      fullWidth size="small"
                      placeholder="답글 입력..."
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleReplySubmit(cmt.comment_no)}
                    >
                      등록
                    </Button>
                  </Box>
                )}
              
                {/* 답글 보기 */}
                {cmt.children && cmt.children.length > 0 && (
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 4, mt: 1, cursor: 'pointer' }}>
                    ── 답글 보기({cmt.children.length}개)
                  </Typography>
                )}
              
                {/* 대댓글 리스트 */}
                {cmt.children?.map((reply) => (
                  <Box key={reply.comment_no} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, ml: 5 }}>
                    <Avatar src={`/assets/profile.jpg`} sx={{ width: 26, height: 26 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{reply.user_id}</Typography>
                      <Typography variant="body2">{reply.content}</Typography>
                      <Typography variant="caption" color="textSecondary">{reply.createdAt}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>              
            ))}
            </Box>

          <Box sx={{ borderTop: '1px solid #ddd', mb: 1 }} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              fullWidth size="small"
              placeholder="댓글 입력..."
            />
            <Button onClick={handleAddComment} variant="contained">등록</Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default PostDialog;
