// PostDialog.js
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, Typography, IconButton, Box, Avatar, TextField, Button, Divider
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import heartEmpty from '../assets/heart-empty.png';
import heartFilled from '../assets/heart-filled.png';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ConfirmCmt from './ConfirmCmt';
import LikeButton from './LikeButton';
import ShareIcon from '@mui/icons-material/Share';
import SaveButton from './SaveButton';
import { formatDistanceToNow } from 'date-fns';
import ko from 'date-fns/locale/ko';
import { useNavigate } from 'react-router-dom';

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
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionResults, setMentionResults] = useState([]);
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [replyMentionQuery, setReplyMentionQuery] = useState('');
  const [replyMentionResults, setReplyMentionResults] = useState([]);
  const [replyMentionedUsers, setReplyMentionedUsers] = useState([]);
  const [showReplyMentions, setShowReplyMentions] = useState(false);
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [optionOpen, setOptionOpen] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [liked, setLiked] = useState(post?.likedByMe || false);
  const [likeCount, setLikeCount] = useState(post?.likeCount || 0);

  const lightPurple = '#9b59b6'; // 연보라색
  const darkPurple = '#8e44ad';  // hover 등 진한 보라

  const [profileMap, setProfileMap] = useState({});

  useEffect(() => {
    if (!open || !post) return;

    const userIds = new Set([
      post.userId,
      ...comments.flatMap(cmt => [
        cmt.user_id,
        ...(cmt.children?.map(reply => reply.user_id) || [])
      ])
    ]);

    Promise.all([...userIds].map(uid =>
      fetch(`http://localhost:4000/user/info/${uid}`)
        .then(res => res.json())
        .then(data => ({ userId: uid, profile_img: data.profile_img }))
        .catch(() => ({ userId: uid, profile_img: null }))
    )).then(results => {
      const map = {};
      results.forEach(({ userId, profile_img }) => {
        map[userId] = profile_img ? `http://localhost:4000/${profile_img}` : '/default/profile.png';
      });
      setProfileMap(map);
    });
  }, [post, open, comments]);

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
    if (post) {
      setLiked(post.likedByMe || false);
      setLikeCount(post.likeCount || 0);
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
    const payload = JSON.parse(atob(token.split('.')[1]));
    const senderId = payload.userId;

    try {
      // 1. 댓글 등록
      const res = await fetch('http://localhost:4000/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: "Bearer " + token
        },
        body: JSON.stringify({ postNo: post.postNo, content: newComment })
      });

      const data = await res.json();

      if (!data.success) {
        alert('댓글 등록 실패');
        return;
      }

      const commentNo = data.commentNo;

      // 2. 멘션 API 호출
      if (mentionedUsers.length > 0 && commentNo) {
        await fetch('http://localhost:4000/comment/mentions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: "Bearer " + token
          },
          body: JSON.stringify({
            commentNo,
            postNo: post.postNo,
            mentionerId: senderId,
            mentionedUserIds: mentionedUsers
          })
        });
      }

      // 3. 게시글 댓글 새로고침
      const updated = await fetch("http://localhost:4000/comment/" + post.postNo, {
        headers: { authorization: "Bearer " + token }
      }).then(res => res.json());
      setComments(updated.list || []);

      // 4. 댓글 알림 (작성자 ≠ 게시글 주인일 때만)
      const receiverId = post.userId;
      if (senderId !== receiverId) {
        await fetch('http://localhost:4000/notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receiver_id: receiverId,
            sender_id: senderId,
            type: 'comment',
            content: `${senderId}님이 회원님의 게시글에 댓글을 남겼습니다.`,
            target_post: post.postNo
          })
        });
      }

      // 5. 입력 초기화
      setNewComment('');
      setMentionedUsers([]);
      setShowMentions(false);
      setMentionResults([]);

    } catch (err) {
      console.error('댓글 등록 중 오류:', err);
      alert('댓글 등록 실패');
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
      // ✅ 댓글 목록 새로고침
      const updated = await fetch("http://localhost:4000/comment/" + post.postNo, {
        headers: { authorization: "Bearer " + token }
      }).then(res => res.json());
      setComments(updated.list || []);
      setReplyText('');
      setReplyTarget(null);

      // ✅ 대댓글 알림 보내기
      const senderId = JSON.parse(atob(token.split('.')[1])).userId;
      const parentComment = comments.find(c => c.comment_no === parentId);
      const receiverId = parentComment?.user_id;

      if (senderId && receiverId && senderId !== receiverId) {
        await fetch('http://localhost:4000/notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receiver_id: receiverId,
            sender_id: senderId,
            type: 'reply',
            content: `${senderId}님이 회원님의 댓글에 답글을 남겼습니다.`,
            target_post: post.postNo,
            target_comment: parentId
          })
        });
      }
    }
  };

  const toggleReplies = (commentNo) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentNo]: !prev[commentNo]
    }));
  };

  if (!post || !post.postNo) return null;

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

  const handleCommentInputChange = (e) => {
    const value = e.target.value;
    setNewComment(value);

    const match = value.match(/@([a-zA-Z0-9_]+)$/);
    if (match) {
      setMentionQuery(match[1]);
      setShowMentions(true);

      fetch(`http://localhost:4000/search/users?q=${match[1]}`)
        .then(res => res.json())
        .then(data => setMentionResults(data.list || []));
    } else {
      setShowMentions(false);
      setMentionResults([]);
    }
  };

  const handleMentionSelect = (user) => {
    const newText = newComment.replace(/@([a-zA-Z0-9_]+)$/, `@${user.user_id} `);
    setNewComment(newText);
    setMentionedUsers(prev => [...new Set([...prev, user.user_id])]);
    setShowMentions(false);
    setMentionResults([]);
  };

  const handleReplyInputChange = (e) => {
    const value = e.target.value;
    setReplyText(value);

    const match = value.match(/@([a-zA-Z0-9_]+)$/);
    if (match) {
      setReplyMentionQuery(match[1]);
      setShowReplyMentions(true);

      fetch(`http://localhost:4000/search/users?q=${match[1]}`)
        .then(res => res.json())
        .then(data => setReplyMentionResults(data.list || []));
    } else {
      setShowReplyMentions(false);
      setReplyMentionResults([]);
    }
  };

  const handleReplyMentionSelect = (user) => {
    const newText = replyText.replace(/@([a-zA-Z0-9_]+)$/, `@${user.user_id} `);
    setReplyText(newText);
    setReplyMentionedUsers(prev => [...new Set([...prev, user.user_id])]);
    setShowReplyMentions(false);
  };

  const highlightMentionsAndTags = (text) => {
    const parts = text.split(/([@#][a-zA-Z0-9가-힣_]+)/g); // @, # 키워드 감지
    return parts.map((part, idx) =>
      part.startsWith('@') || part.startsWith('#') ? (
        <span key={idx} style={{ color: 'purple', fontWeight: 500 }}>{part}</span>
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  };
  const toggleFollow = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:4000/follow', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ targetUserId: post.userId })
      });
      setIsFollowing(prev => !prev);
    } catch (err) {
      console.error('팔로우 토글 실패:', err);
    }
  };

  // onClose 호출 시 변경된 post 정보 전달
  const handleClose = () => {
    onClose({
      ...post,
      likeCount,
      likedByMe: liked,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogContent sx={{ display: 'flex', p: 0, height: 600, overflow: 'hidden' }}>
        {/* 왼쪽: 이미지 영역 */}
        <Box sx={{ width: '50%', position: 'relative', bgcolor: '#ccc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {post.images?.length > 0 ? (
            <>
              <img
                src={"http://localhost:4000" + post.images[currentIndex]}
                alt="게시글"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onClick={() => setShowTags(prev => !prev)}
              />
              {showTags && post.userTags?.map((tag, idx) => (
                <Box
                  key={idx}
                  sx={{
                    position: 'absolute',
                    top: `${tag.y * 100}%`,
                    left: `${tag.x * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: 14,
                    fontWeight: 'bold',
                    zIndex: 10
                  }}
                >
                  @{tag.userId}
                </Box>
              ))}

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
            <Typography sx={{ color: '#fff', fontSize: 16 }}>이미지 없음</Typography>
          )}
        </Box>

        {/* 오른쪽: 댓글 본문 + 입력 */}
        <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
          {/* 상단 유저 + 닫기 */}
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src={profileMap[post.userId] || '/default/profile.png'} sx={{ mr: 1 }} />
              <Typography
                variant="subtitle2"
                sx={{ cursor: 'pointer', fontWeight: 600 }}
                onClick={() => navigate(`/user/${post.userId}`)}
              >
                {post.userId}
              </Typography>
              {currentUserId !== post.userId && (
                <Typography
                  variant="body2"
                  sx={{
                    ml: 1,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    color: isFollowing ? 'gray' : lightPurple,
                    '&:hover': { color: darkPurple }
                  }}
                  onClick={toggleFollow}
                >
                  {isFollowing ? '팔로잉' : '팔로우'}
                </Typography>
              )}
            </Box>
            <IconButton onClick={() => setOptionOpen(true)}><MoreHorizIcon /></IconButton>
          </Box>

          <Divider />

          {/* 본문 및 댓글 영역 */}
          <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 2 }}>{highlightMentionsAndTags(post.content)}</Typography>

            {comments.map((cmt) => (
              <Box key={cmt.comment_no} sx={{ mb: 2 }}>
                <Box sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  '&:hover .more-btn': { visibility: 'visible' }
                }}>
                  {/* 왼쪽: 댓글 내용 */}
                  <Box sx={{ display: 'flex', flex: 1 }}>
                    <Avatar src={profileMap[cmt.user_id] || '/default/profile.png'} sx={{ mr: 2, mt: 1 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2"><b>{cmt.user_id}</b> {highlightMentionsAndTags(cmt.content)}</Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="caption" color="gray">
                          {formatDistanceToNow(new Date(cmt.createdAt), { addSuffix: true, locale: ko })}
                        </Typography>
                        <Typography variant="caption">좋아요 {cmt.likeCount}개</Typography>
                        <Button
                          size="small"
                          onClick={() => {
                            if (replyTarget === cmt.comment_no) {
                              // 이미 열려 있으면 닫기
                              setReplyTarget(null);
                              setReplyText('');
                              setReplyMentionedUsers([]);
                            } else {
                              // 새로 열기
                              setReplyTarget(cmt.comment_no);
                              setReplyText(`@${cmt.user_id} `);
                              setReplyMentionedUsers(prev => [...new Set([...prev, cmt.user_id])]);
                            }
                          }}
                          sx={{ p: 0, minWidth: 0 }}
                        >
                          <Typography variant="caption" sx={{ color: lightPurple }}>답글 달기</Typography>
                        </Button>
                      </Box>

                      {replyTarget === cmt.comment_no && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, position: 'relative' }}>
                          <TextField
                            value={replyText}
                            onChange={handleReplyInputChange}
                            fullWidth
                            size="small"
                            placeholder="답글 입력..."
                            sx={{
                              bgcolor: '#faf8ff',
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#c7b8f5' },
                                '&:hover fieldset': { borderColor: '#a18df2' },
                                '&.Mui-focused fieldset': { borderColor: '#a18df2' }
                              }
                            }}
                          />

                          <Button
                            variant="contained"
                            onClick={() => handleReplySubmit(cmt.comment_no)}
                            sx={{
                              backgroundColor: '#c7b8f5',
                              color: '#fff',
                              '&:hover': {
                                backgroundColor: '#a18df2'
                              },
                              '&.Mui-disabled': {
                                backgroundColor: '#e2dcf6',
                                color: '#fff'
                              }
                            }}
                          >
                            등록
                          </Button>

                          {showReplyMentions && replyMentionResults.length > 0 && (
                            <Box sx={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              bgcolor: '#fff',
                              border: '1px solid #ccc',
                              borderRadius: 1,
                              mt: 0.5,
                              zIndex: 10,
                              width: '100%'
                            }}>
                              {replyMentionResults.map((user, idx) => (
                                <Box
                                  key={idx}
                                  sx={{ p: 1, cursor: 'pointer', '&:hover': { backgroundColor: '#eee' } }}
                                  onClick={() => handleReplyMentionSelect(user)}
                                >
                                  <Typography><b>{user.name}</b> @{user.user_id}</Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      )}

                      {(cmt.children?.length || 0) > 0 && (
                        <Button size="small" onClick={() => toggleReplies(cmt.comment_no)} sx={{ mt: 1, p: 0, minWidth: 0 }}>
                          <Typography variant="caption" color="gray">
                            {expandedReplies[cmt.comment_no] ? '답글 숨기기' : `답글 보기(${cmt.children.length}개)`}
                          </Typography>
                        </Button>
                      )}
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

                    {/* ✅ 내 댓글일 때만 옵션 아이콘 보여주기 */}
                    {cmt.user_id === currentUserId && (
                      <IconButton
                        onClick={() => {
                          setSelectedCommentNo(cmt.comment_no);
                          setDeleteMode('delete');
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
                  <Box key={reply.comment_no} sx={{ display: 'flex', gap: 1, mt: 1, ml: 5, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex' }}>
                      <Avatar src={profileMap[reply.user_id] || '/default/profile.png'} sx={{ width: 26, height: 26, mr: 1 }} />
                      <Box>
                        <Typography variant="body2"><b>{reply.user_id}</b> {highlightMentionsAndTags(reply.content)}</Typography>
                        <Typography variant="caption">{reply.createdAt}</Typography>
                      </Box>
                    </Box>

                    {/* 좋아요 & 옵션 메뉴 */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img
                        src={reply.likedByMe ? heartFilled : heartEmpty}
                        alt="like"
                        style={{ width: 16, height: 16, cursor: 'pointer', marginTop: 4 }}
                        onClick={() => handleCommentLikeToggle(reply.comment_no)}
                      />
                      <IconButton
                        onClick={() => {
                          setSelectedCommentNo(reply.comment_no);
                          setDeleteMode(reply.user_id === currentUserId ? 'delete' : 'report');
                          setDeleteModalOpen(true);
                        }}
                      >
                        <MoreHorizIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
          <Divider />

          {/* 하단 아이콘 + 좋아요 수 영역 */}
          <Box sx={{ px: 2, pt: 1, mb: 2 }}>
            {/* 아이콘 줄 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* 왼쪽: 좋아요 + 공유 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LikeButton
                  postNo={post.postNo}
                  initialLiked={liked}
                  initialCount={likeCount}
                  onLike={() => { }}
                  onLikeToggle={(newCount, newLiked) => {
                    setLikeCount(newCount);
                    setLiked(newLiked);
                  }}
                />
                <IconButton sx={{ mb: 0.3 }} size="small" onClick={() => {
                  // 공유 다이얼로그 열기
                  alert("공유 기능은 추후 연결해주세요.");
                }}>
                  <ShareIcon />
                </IconButton>
              </Box>

              {/* 오른쪽: 저장 */}
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
              좋아요 {likeCount || 0}개
            </Typography>
            <Typography variant="caption" color="gray">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
            </Typography>
          </Box>

          {/* 구분선 */}
          <Divider />

          {/* 댓글 입력창 */}
          <Box sx={{ display: 'flex', p: 1, alignItems: 'center' }}>
            <TextField
              value={newComment}
              onChange={handleCommentInputChange}
              placeholder="댓글 달기..."
              variant="outlined"
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#c7b8f5',
                  },
                  '&:hover fieldset': {
                    borderColor: '#a18df2',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#a18df2',
                  },
                },
                bgcolor: '#faf8ff',
              }}
            />
            <Button onClick={handleAddComment} variant="text" sx={{ color: lightPurple }} disabled={!newComment.trim()}>게시</Button>
            {showMentions && mentionResults.length > 0 && (
              <Box sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                bgcolor: '#fff',
                border: '1px solid #ccc',
                borderRadius: 1,
                mt: 0.5,
                zIndex: 10,
                width: '100%'
              }}>
                {mentionResults.map((user, idx) => (
                  <Box
                    key={idx}
                    sx={{ p: 1, cursor: 'pointer', '&:hover': { backgroundColor: '#eee' } }}
                    onClick={() => handleMentionSelect(user)}
                  >
                    <Typography><b>{user.name}</b> @{user.user_id}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
        <ConfirmCmt
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteComment}
        />
      </DialogContent>
      <Dialog
        open={optionOpen}
        onClose={() => setOptionOpen(false)}
        PaperProps={{
          sx: {
            width: 360,
            borderRadius: 3,
            overflow: 'hidden',
          }
        }}
      >
        <Box>
          {post.userId === currentUserId ? (
            <>
              <Button
                fullWidth
                onClick={() => {
                  alert("삭제 기능 연결 예정");
                  setOptionOpen(false);
                }}
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
                  alert("추후 개발 예정입니다!");
                  setOptionOpen(false);
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
                alert("신고 완료!");
                setOptionOpen(false);
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
            onClick={() => setOptionOpen(false)}
            sx={{
              fontSize: 16,
              py: 2
            }}
          >
            취소
          </Button>
        </Box>
      </Dialog>

    </Dialog>


  );
}

export default PostDialog;
