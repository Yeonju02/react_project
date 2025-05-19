import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, useMediaQuery, Menu as MuiMenu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddBoxIcon from '@mui/icons-material/AddBox';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../assets/logo.png';

import SearchSlide from './SearchSlide';
import NotificationSlide from './NotificationSlide';

export default function Menu({ unreadCount, setUnreadCount }) {
  const navigate = useNavigate();
  const isWide = useMediaQuery('(min-width: 1200px)');
  const [selected, setSelected] = useState('home');
  const [previousSelected, setPreviousSelected] = useState('home');
  const [showSearch, setShowSearch] = useState(false);
  const [showNoti, setShowNoti] = useState(false);
  const [unreadNotiCount, setUnreadNotiCount] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null); // ✅ 드롭다운 anchor 상태
  const isMenuOpen = Boolean(menuAnchorEl);

  const [profileImg, setProfileImg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : '';
    if (!userId) return;
    fetch('http://localhost:4000/user/info/' + userId)
      .then(res => res.json())
      .then((data) => {
        setProfileImg(data.profile_img)
      });
  }, []);


  // 더보기 클릭 시
  const handleMoreClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // 문제 신고 페이지 이동
  const handleReport = () => {
    navigate('/report');
  };

  // 회원 탈퇴 페이지 이동
  const handleWithdraw = () => {
    navigate('/withdraw');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : '';
    if (!userId) return;

    fetch('http://localhost:4000/dm/unread/count/' + userId)
      .then(res => res.json())
      .then(data => setUnreadCount(data.count || 0));

    fetch('http://localhost:4000/notification/unread/count/' + userId)
      .then(res => res.json())
      .then(data => setUnreadNotiCount(data.count || 0));
  }, []);

  const handleMenuClick = (menu, path) => {
    if (menu === 'search') {
      setShowSearch(!showSearch);
      setShowNoti(false);
      setPreviousSelected(selected);
      setSelected(menu);
    } else if (menu === 'like') {
      setShowNoti(!showNoti);
      setShowSearch(false);
      setPreviousSelected(selected);
      setSelected(menu);

      // 알림 전체 읽음 처리
      const token = localStorage.getItem('token');
      const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : '';
      fetch('http://localhost:4000/notification/read/all/' + userId, {
        method: 'POST',
      });
      setUnreadNotiCount(0);
    } else {
      setShowSearch(false);
      setShowNoti(false);
      setSelected(menu);
      if (path) navigate(path);
    }
  };

  const iconColor = (menu) => selected === menu ? '#CBA3E3' : '#333';

  // 📌 일관된 뱃지 스타일 포함한 메뉴 렌더링 함수
  const renderItem = (menu, label, icon, path, badgeCount = 0, badgeVisible = true) => (
    <Box
      key={menu}
      onClick={(e) => {
        if (typeof path === 'function') {
          path(e); // 함수일 경우 직접 실행
        } else {
          handleMenuClick(menu, path);
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 1,
        py: 1.2,
        width: '100%',
        cursor: 'pointer',
        position: 'relative',
        '&:hover': { backgroundColor: '#f5f5f5' }
      }}
    >
      <Box position="relative">
        {icon}
        {badgeCount > 0 && badgeVisible && (
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              bgcolor: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              fontSize: 10,
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
          >
            {badgeCount > 99 ? '99+' : badgeCount}
          </Box>
        )}
      </Box>
      {isWide && <Typography>{label}</Typography>}
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          width: isWide ? 250 : 72,
          height: '100vh',
          borderRight: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          py: 2,
          px: 1,
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 20
        }}
      >
        {/* 로고 */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', px: 2 }}>
          <img
            src={logo}
            alt="Logo"
            style={{ height: isWide ? 120 : 80, transition: 'height 0.3s ease' }}
          />
        </Box>

        {/* 메뉴 항목 */}
        {renderItem('home', '홈', <HomeIcon fontSize="large" sx={{ color: iconColor('home'), ml: 0.1 }} />, '/main')}
        {renderItem('search', '검색', <SearchIcon fontSize="large" sx={{ color: iconColor('search'), ml: 0.2 }} />)}
        {renderItem(
          'dm',
          '메시지',
          <SendIcon sx={{ color: iconColor('dm'), fontSize: 30, ml: 0.6 }} />,
          () => {
            setShowSearch(false);
            setShowNoti(false);
            setSelected('dm');
            navigate('/dm');
          },
          unreadCount
        )}

        {renderItem('like', '알림', <FavoriteIcon sx={{ color: iconColor('like'), fontSize: 30, ml: 0.5 }} />, null, unreadNotiCount, !showNoti)}
        {renderItem('add', '만들기', <AddBoxIcon sx={{ color: iconColor('add'), fontSize: 30, ml: 0.5 }} />, '/post/add')}
        {renderItem('mypage', '프로필',
          <Avatar
            src={profileImg ? 'http://localhost:4000/' + profileImg : process.env.PUBLIC_URL + '/assets/default.jpg'}
            sx={{
              width: 30,
              height: 30,
              ml: 0.7,
              border: selected === 'mypage' ? '2px solid #CBA3E3' : 'none' // ✅ 보라 테두리 조건
            }}
          />,
          '/mypage'
        )}

        <Box sx={{ flexGrow: 1 }} />
        {renderItem('more', '더 보기',
          <MenuIcon sx={{ fontSize: 30, color: '#8e8e8e', '&hover': 'pointer' }} />,
          (e) => handleMoreClick(e)
        )}

      </Box>

      {/* 검색 슬라이드 */}
      {showSearch && (
        <SearchSlide
          open={showSearch}
          onClose={() => {
            setShowSearch(false);
            setSelected(previousSelected);
          }}
          sidebarWidth={isWide ? 250 : 72}
        />
      )}

      {/* 알림 슬라이드 */}
      {showNoti && (
        <NotificationSlide
          open={showNoti}
          onClose={() => {
            setShowNoti(false);
            setSelected(previousSelected);
          }}
          sidebarWidth={isWide ? 250 : 72}
        />
      )}
      <MuiMenu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        disableAutoFocusItem
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            ml: 4,
            mt: -6,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            width: 220,
          }
        }}
      >
        {/* 상단 메뉴 */}
        <MenuItem
          onClick={() => {
            alert("추후 개발 예정입니다!");
            handleMenuClose();
          }}
        >
          <Typography fontSize={14}>모드 전환</Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            alert("추후 개발 예정입니다!");
            handleMenuClose();
          }}
        >
          <Typography fontSize={14}>문제 신고</Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            alert("추후 개발 예정입니다!");
            handleMenuClose();
          }}
        >
          <Typography fontSize={14} sx={{ color: 'red' }}>회원 탈퇴</Typography>
        </MenuItem>

        <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>
          <Typography fontSize={14}>로그아웃</Typography>
        </MenuItem>
      </MuiMenu>
    </>
  );
}
