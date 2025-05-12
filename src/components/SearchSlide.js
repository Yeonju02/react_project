import React, { useEffect, useState } from 'react';
import {
  Box, TextField, Tabs, Tab, Typography, Divider, Slide, Paper, Avatar
} from '@mui/material';
import PostDialog from './PostDialog';
import { useNavigate } from 'react-router-dom';
import NotificationSlide from './NotificationSlide';

// (중략)
function SearchSlide({ open, onClose, sidebarWidth = 72, type = 'search' }) {
  const [keyword, setKeyword] = useState('');
  const [tab, setTab] = useState(0);
  const [results, setResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : '';

  // 🔍 검색용
  useEffect(() => {
    if (type !== 'search') return;
    if (!keyword) {
      setResults([]);
      return;
    }

    const endpoint = tab === 0 ? '/search/posts' : '/search/users';
    fetch("http://localhost:4000" + endpoint + "?q=" + encodeURIComponent(keyword))
      .then(res => res.json())
      .then(data => setResults(data.list || []))
      .catch(err => console.error('검색 오류:', err));
  }, [keyword, tab, type]);

  // ❤️ 알림용
  useEffect(() => {
    if (type !== 'noti' || !userId) return;
    fetch("http://localhost:4000/notification/" + userId)
      .then(res => res.json())
      .then(data => setNotifications(data || []))
      .catch(err => console.error('알림 오류:', err));
  }, [type]);

  const handleCardClick = async (item) => {
    try {
      const res = await fetch("http://localhost:4000/post/" + item.postNo);
      const data = await res.json();
      if (data.success) {
        setSelectedPost(data.post);
        setDialogOpen(true);
      }
    } catch (err) {
      console.error('게시글 상세 조회 실패:', err);
    }
  };

  return (
    <Slide direction="right" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={1}
        sx={{
          position: 'fixed',
          top: 0,
          left: sidebarWidth || 72, 
          bottom: 0,
          width: 400,
          zIndex: 10,
          backgroundColor: '#fff',
          borderRight: '1px solid #ddd',
          boxShadow: '4px 0 10px rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            {type === 'search' ? '검색' : '알림'}
          </Typography>

          {type === 'search' && (
            <>
              <TextField
                fullWidth
                placeholder="검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                variant="outlined"
                size="small"
              />

              <Tabs value={tab} onChange={(_, newVal) => setTab(newVal)} centered sx={{ mt: 2 }}>
                <Tab label="게시글" />
                <Tab label="사용자" />
              </Tabs>

              <Divider sx={{ my: 1 }} />
            </>
          )}

          {type === 'search' && (results.length === 0 ? (
            <Typography sx={{ mt: 4, textAlign: 'center', color: 'gray' }}>
              검색 결과가 없습니다.
            </Typography>
          ) : (
            results.map((item, idx) => (
              <Box
                key={idx}
                onClick={() => {
                  if (tab === 0) {
                    handleCardClick(item); 
                  } else {
                    navigate('/user/' + item.user_id); 
                    onClose();
                  }
                }}
                sx={{
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  border: '1px solid #eee',
                  p: 1,
                  borderRadius: 1,
                  cursor: 'pointer', 
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                {tab === 0 ? (
                  <>
                    {item.thumbnail ? (
                      <img
                        src={"http://localhost:4000" + item.thumbnail}
                        alt="썸네일"
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          backgroundColor: '#f0f0f0',
                          borderRadius: 1,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontSize: 12,
                          color: 'gray'
                        }}
                      >
                        이미지 없음
                      </Box>
                    )}
                    <Box>
                      <Typography fontWeight="bold">{item.user_id}</Typography>
                      <Typography variant="body2" color="textSecondary" noWrap width={250}>
                        {item.content}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Avatar src={item.profile_img || "/assets/profile.jpg"} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight="bold">{item.user_id}</Typography>
                      <Typography variant="caption" color="textSecondary">{item.name}</Typography>
                    </Box>
                  </>
                )}
              </Box>
            ))
          ))}

          {type === 'noti' && notifications.map((noti, idx) => (
            <Box key={idx} 
              onClick={() => {
                  // 게시글 상세 페이지로 이동
                  if (noti.target_post) navigate(`/post/${noti.target_post}`);
                  onClose();
                }}
              sx={{
                p: 1.5,
                mb: 1,
                border: '1px solid #eee',
                borderRadius: 2,
                bgcolor: noti.is_read === 'N' ? '#f9f5ff' : '#fff'
              }}
            >


              
              <Typography variant="body2">{noti.content}</Typography>
              <Typography variant="caption" color="textSecondary">
                {new Date(noti.created_at).toLocaleString()}
              </Typography>
            </Box>
          ))}

          {selectedPost && (
            <PostDialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              post={selectedPost}
            />
          )}
        </Box>
      </Paper>
    </Slide>
  );
}

export default SearchSlide;

