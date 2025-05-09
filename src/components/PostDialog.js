// PostDialog.js
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, Typography, IconButton, Box, Avatar, TextField, Button, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import heartEmpty from '../assets/heart-empty.png';
import heartFilled from '../assets/heart-filled.png';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ConfirmCmt from './ConfirmCmt';

function PostDialog({ open, onClose, post }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCommentNo, setSelectedCommentNo] = useState(null);
  const [deleteMode, setDeleteMode] = useState('delete');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.userId);  
    }
    if (post && open) {
      fetch("http://localhost:4000/comment/" + post.postNo, {
        headers: { authorization: "Bearer " + token }
      })
        .then(res => res.json())
        .then(data => setComments(data.list || []));
      setCurrentIndex(0);
    }
  }, [post, open]);

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
      setComments(prev =>
        prev.map(c =>
          c.comment_no === commentNo
            ? { ...c, likedByMe: !isLiked, likeCount: (c.likeCount || 0) + (isLiked ? -1 : 1) }
            : c
        )
      );
    }
  };

  const handleAddComment = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: "Bearer " + token
      },
      body: JSON.stringify({ postNo: post.postNo, content: newComment })
    });
    const data = await res.json();
    if (data.success) {
      const updated = await fetch("http://localhost:4000/comment/" + post.postNo, {
        headers: { authorization: "Bearer " + token }
      }).then(res => res.json());
      setComments(updated.list || []);
      setNewComment('');
    }
  };

  const handleReplySubmit = async (parentId) => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ postNo: post.postNo, content: replyText, parentId })
    });
    const data = await res.json();
    if (data.success) {
      const updated = await fetch("http://localhost:4000/comment/" + post.postNo, {
        headers: { authorization: "Bearer " + token }
      }).then(res => res.json());
      setComments(updated.list || []);
      setReplyText('');
      setReplyTarget(null);
    }
  };

  const toggleReplies = (commentNo) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentNo]: !prev[commentNo]
    }));
  };

  if (!post) return null;

  const handleDeleteComment = async () => {
    const token = localStorage.getItem('token');
    await fetch("http://localhost:4000/comment/" + selectedCommentNo, {
      method: 'DELETE',
      headers: {
        'authorization': 'Bearer ' + token
      }
    });
  
    const updated = await fetch("http://localhost:4000/comment/" + post.postNo, {
      headers: { "authorization": "Bearer " + token }
    }).then(res => res.json());
  
    setComments(updated.list || []);
    setDeleteModalOpen(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogContent sx={{ display: 'flex', p: 0, height: 600, overflow: 'hidden' }}>
        {/* 왼쪽: 이미지 영역 */}
        <Box sx={{ width: '50%', position: 'relative', bgcolor: '#000' }}>
          {post.images?.length > 0 ? (
            <>
              <img
                src={"http://localhost:4000" + post.images[currentIndex]}
                alt="게시글"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              {post.images.length > 1 && (
                <>
                  <IconButton onClick={() => handleSlide(-1)} sx={{ position: 'absolute', top: '50%', left: 10, color: 'white' }}>
                    <ArrowBackIosNewIcon />
                  </IconButton>
                  <IconButton onClick={() => handleSlide(1)} sx={{ position: 'absolute', top: '50%', right: 10, color: 'white' }}>
                    <ArrowForwardIosIcon />
                  </IconButton>
                </>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: 8, width: '100%' }}>
                {post.images.map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: i === currentIndex ? '#fff' : '#888',
                      mx: 0.5
                    }}
                  />
                ))}
              </Box>
            </>
          ) : (
            <Typography sx={{ color: '#fff', m: 'auto' }}>이미지 없음</Typography>
          )}
        </Box>

        {/* 오른쪽: 댓글 본문 + 입력 */}
        <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
          {/* 상단 유저 + 닫기 */}
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src="/assets/profile.jpg" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">{post.userId}</Typography>
            </Box>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
          </Box>

          <Divider />

          {/* 본문 및 댓글 영역 */}
          <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 2 }}>{post.content}</Typography>

            {comments.map((cmt) => (
              <Box key={cmt.comment_no} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                            '&:hover .more-btn' : {visibility: 'visible'}
                 }}>
                  {/* 왼쪽: 댓글 내용 */}
                  <Box sx={{ display: 'flex', flex: 1 }}>
                    <Avatar src="/assets/profile.jpg" sx={{ mr: 2, mt: 1 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2"><b>{cmt.user_id}</b> {cmt.content}</Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="caption">{cmt.createdAt}</Typography>
                        <Typography variant="caption">좋아요 {cmt.likeCount || 0}개</Typography>
                        <Button size="small" onClick={() => setReplyTarget(cmt.comment_no)} sx={{ p: 0, minWidth: 0 }}>
                          <Typography variant="caption">답글 달기</Typography>
                        </Button>
                      </Box>

                      {replyTarget === cmt.comment_no && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <TextField
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            fullWidth size="small"
                            placeholder="답글 입력..."
                          />
                          <Button variant="contained" onClick={() => handleReplySubmit(cmt.comment_no)}>등록</Button>
                        </Box>
                      )}

                      <Button size="small" onClick={() => toggleReplies(cmt.comment_no)} sx={{ mt: 1, p: 0, minWidth: 0 }}>
                        <Typography variant="caption" color="gray">
                          {expandedReplies[cmt.comment_no] ? '답글 숨기기' : `답글 보기(${cmt.children?.length || 0}개)`}
                        </Typography>
                      </Button>
                    </Box>
                  </Box>

                  {/* 댓글 옵션, 좋아요 */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 0.5 }}>
                    <img
                        src={cmt.likedByMe ? heartFilled : heartEmpty}
                        alt="like"
                        style={{ width: 16, height: 16, cursor: 'pointer', marginTop: 4 }}
                        onClick={() => handleCommentLikeToggle(cmt.comment_no)}
                      />
                    {cmt.user_id === currentUserId ? (
                      <IconButton
                        onClick={() => {
                          setSelectedCommentNo(cmt.comment_no);
                          setDeleteMode('delete');
                          setDeleteModalOpen(true);
                        }}
                      >
                        <MoreHorizIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={() => {
                          setSelectedCommentNo(cmt.comment_no);
                          setDeleteMode('report');
                          setDeleteModalOpen(true);
                        }}
                      >
                        <MoreHorizIcon />
                      </IconButton>
                    )}

                  </Box>
                </Box>

                {/* 대댓글 출력 */}
                {expandedReplies[cmt.comment_no] && cmt.children?.map((reply) => (
                  <Box key={reply.comment_no} sx={{ display: 'flex', gap: 1, mt: 1, ml: 5 }}>
                    <Avatar src="/assets/profile.jpg" sx={{ width: 26, height: 26 }} />
                    <Box>
                      <Typography variant="body2"><b>{reply.user_id}</b> {reply.content}</Typography>
                      <Typography variant="caption">{reply.createdAt}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>

          {/* 구분선 */}
          <Divider />

          {/* 댓글 입력창 */}
          <Box sx={{ display: 'flex', p: 1, alignItems: 'center' }}>
            <TextField
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글 달기..."
              variant="outlined"
              fullWidth
              size="small"
            />
            <Button onClick={handleAddComment} variant="text" disabled={!newComment.trim()}>게시</Button>
          </Box>
        </Box>
        <ConfirmCmt
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteComment}
        />
      </DialogContent>
    </Dialog>
    
  );
}

export default PostDialog;
