import React, { useEffect, useState } from 'react';
import {
  Box, TextField, Tabs, Tab, Typography, Divider, Slide, Paper, Avatar
} from '@mui/material';
import PostDialog from './PostDialog';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

function SearchSlide({ open, onClose, sidebarWidth = 72 }) {
  const [keyword, setKeyword] = useState('');
  const [tab, setTab] = useState(0);
  const [results, setResults] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!keyword) {
      setResults([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true); // 로딩 시작
      const endpoint = tab === 0 ? '/search/posts' : '/search/users';
      try {
        const res = await fetch("http://localhost:4000" + endpoint + "?q=" + encodeURIComponent(keyword));
        const data = await res.json();
        setTimeout(() => { // 결과도 늦게 보여주기
          setResults(data.list || []);
          setLoading(false); // 로딩 종료
        }, 1000); // 0.5초 딜레이
      } catch (err) {
        console.error('검색 오류:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [keyword, tab]);

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
            검색
          </Typography>

          <TextField
            fullWidth
            placeholder="검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#c7b8f5', // 기본 테두리
                },
                '&:hover fieldset': {
                  borderColor: '#a18df2', // hover 시 테두리
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#a18df2', // 포커스 시 테두리
                },
              }
            }}
          />

          <Tabs value={tab} onChange={(_, newVal) => setTab(newVal)} centered
            TabIndicatorProps={{
              style: { backgroundColor: '#a18df2' }
            }}
            textColor="inherit"
            sx={{
              mt: 2,
              '& .MuiTab-root': {
                color: '#bbb', // 기본 탭 텍스트 연보라 계열
                fontWeight: 'bold'
              },
              '& .Mui-selected': {
                color: '#a18df2',
              }
            }}>
            <Tab label="게시글" />
            <Tab label="사용자" />
          </Tabs>

          <Divider sx={{ my: 1 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress sx={{ color: '#a18df2' }} />
            </Box>
          ) : results.length === 0 ? (
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
                    backgroundColor: '#f3e5f5'
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
                    <Avatar src={item.profile_img ? "http://localhost:4000/" + item.profile_img : "/default/profile.png"} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight="bold">{item.user_id}</Typography>
                      <Typography variant="caption" color="textSecondary">{item.name}</Typography>
                    </Box>
                  </>
                )}
              </Box>
            ))
          )}

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
