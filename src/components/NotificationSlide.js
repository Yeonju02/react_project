import React, { useEffect, useState } from 'react';
import { Slide, Box, Typography, Avatar } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import PostDialog from './PostDialog';

export default function NotificationSlide({ open, onClose, sidebarWidth = 72 }) {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).userId : '';
  const [selectedPost, setSelectedPost] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!userId || !open) return;
    fetch('http://localhost:4000/notification/' + userId)
      .then(res => res.json())
      .then(data => setNotifications(data));
  }, [userId, open]);

  return (
    <div>
      <Slide direction="right" in={open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: sidebarWidth,
            width: 400,
            height: '100%',
            bgcolor: 'white',
            boxShadow: 4,
            zIndex: 10,
            overflowY: 'auto'
          }}
        >
          <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>알림</Typography>

          {notifications.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '80%',
                color: '#888',
                textAlign: 'center',
                px: 2
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                아직 받은 알림이 없어요
              </Typography>
              <Typography variant="caption" color="textSecondary">
                누군가가 회원님의 게시글에 좋아요를 누르거나<br />
                댓글을 달면 여기에 표시돼요.
              </Typography>
            </Box>
          ) : (
            notifications.map((noti) => {
              const getStyle = (type) => {
                switch (type) {
                  case 'like': return { color: '#ff5c8a', label: '좋아요' };
                  case 'comment': return { color: '#3498db', label: '댓글' };
                  case 'reply': return { color: '#27ae60', label: '답글' };
                  case 'tag': return { color: '#fbc02d', label: '태그' };
                  case 'follow': return { color: '#7e57c2', label: '팔로우' };
                  default: return { color: '#999', label: '' };
                }
              };
              const { color, label } = getStyle(noti.type);

              return (
                <Box
                  key={noti.noti_no}
                  onClick={async () => {
                    if (noti.type === 'follow') {
                      // 알림 읽음 처리만
                      await fetch(`http://localhost:4000/notification/read/${noti.noti_no}`, {
                        method: 'POST'
                      });

                      setNotifications(prev =>
                        prev.map(n =>
                          n.noti_no === noti.noti_no ? { ...n, is_read: 'Y' } : n
                        )
                      );

                      return; // 게시글 다이얼로그 띄우지 않음
                    }

                    let postNo = noti.target_post;

                    // 댓글 또는 답글이라면 target_post가 없을 수 있으므로 댓글에서 추출
                    if (!postNo && noti.target_comment) {
                      try {
                        const res = await fetch(`http://localhost:4000/comment/${noti.target_comment}/post`);
                        const data = await res.json();
                        if (data.success) {
                          postNo = data.postNo;
                        } else {
                          console.warn('댓글로부터 게시글 번호 가져오기 실패');
                          return;
                        }
                      } catch (err) {
                        console.error('댓글 기반 게시글 조회 실패:', err);
                        return;
                      }
                    }

                    if (!postNo) return;

                    try {
                      await fetch(`http://localhost:4000/notification/read/${noti.noti_no}`, {
                        method: 'POST'
                      });

                      setNotifications(prev =>
                        prev.map(n =>
                          n.noti_no === noti.noti_no ? { ...n, is_read: 'Y' } : n
                        )
                      );

                      const res = await fetch(`http://localhost:4000/post/${postNo}`);
                      const data = await res.json();

                      if (data.success && data.post) {
                        setSelectedPost(data.post);
                        setDialogOpen(true);
                      }
                    } catch (err) {
                      console.error("게시글 로딩 실패:", err);
                    }
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.5,
                    cursor: 'pointer',
                    backgroundColor: noti.is_read === 'N' ? '#f8f4ff' : 'white',
                    borderLeft: `4px solid ${color}`,
                    '&:hover': { backgroundColor: '#f0f0f0' },
                  }}
                >
                  <Avatar
                    src={
                      noti.sender_profile
                        ? 'http://localhost:4000/' + noti.sender_profile
                        : '/assets/profile.jpg'
                    }
                    sx={{ width: 40, height: 40, mr: 2 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: noti.is_read === 'N' ? 600 : 400 }}>
                      <span style={{ color }}>{label}</span> - {noti.content}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatDistanceToNow(new Date(noti.created_at), { addSuffix: true, locale: ko })}
                    </Typography>
                  </Box>
                  {noti.thumbnail && noti.thumbnail !== 'null' && (
                    <img
                      src={'http://localhost:4000' + noti.thumbnail}
                      alt="썸네일"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 4,
                        objectFit: 'cover',
                        marginLeft: 8
                      }}
                    />
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </Slide>

      {selectedPost && (
        <PostDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
        />
      )}
    </div>
  );

}
