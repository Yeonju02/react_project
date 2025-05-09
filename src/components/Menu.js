import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddBoxIcon from '@mui/icons-material/AddBox';
import MenuIcon from '@mui/icons-material/Menu'; // 더보기
import logo from '../assets/logo.png';
import SearchSlide from './SearchSlide';

export default function Menu() {
  useEffect(() => {
          const link = document.createElement("link");
          link.href = "https://fonts.googleapis.com/css2?family=Grand+Hotel&display=swap";
          link.rel = "stylesheet";
          document.head.appendChild(link);
        }, []);
        
  const navigate = useNavigate();
  const isWide = useMediaQuery('(min-width: 1200px)');
  const [selected, setSelected] = useState('home');
  const [previousSelected, setPreviousSelected] = useState('home');
  const [showSearch, setShowSearch] = useState(false);

  const handleMenuClick = (menu, path) => {
    if (menu === 'search') {
      if (showSearch) {
        setShowSearch(false);
        setSelected(previousSelected);
      } else {
        setPreviousSelected(selected);
        setShowSearch(true);
        setSelected('search');
      }
    } else {
      setSelected(menu);
      setShowSearch(false);
      if (path) navigate(path);
    }
  };

  const iconColor = (menu) => selected === menu ? '#CBA3E3' : '#333';

  const renderItem = (menu, label, icon, path) => (
    <Box
      key={menu}
      onClick={() => handleMenuClick(menu, path)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 1,
        py: 1.2,
        width: '100%',
        cursor: 'pointer',
        '&:hover': { backgroundColor: '#f5f5f5' }
      }}
    >
      {icon}
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
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              height: isWide ? 120 : 80, // 넓으면 크게, 작으면 작게
              transition: 'height 0.3s ease'
            }}
          />
        </Box>

        {/* 메뉴 항목 */}
        {renderItem('home', '홈', <HomeIcon fontSize='large' sx={{ color: iconColor('home'), ml : 0.1 }} />, '/main')}
        {renderItem('search', '검색', <SearchIcon fontSize='large' sx={{ color: iconColor('search'), ml : 0.2}} />)}
        {renderItem('dm', '메시지', <SendIcon sx={{ color: iconColor('dm'), fontSize: 30, ml : 0.6, mb : 0.1 }} />, '/message')}
        {renderItem('like', '알림', <FavoriteIcon sx={{ color: iconColor('like'), fontSize: 30, ml : 0.5 }} />)}
        {renderItem('add', '만들기', <AddBoxIcon sx={{ color: iconColor('add'), fontSize: 30, ml : 0.5, mb : 0.3 }} />, '/post/add')}
        {renderItem('mypage', '프로필', <Avatar src="/assets/profile.jpg" sx={{ width: 30, height: 30, ml: 0.7, border: selected === 'mypage' ? '2px solid black' : 'none' }} />, '/mypage')}

        <Box sx={{ flexGrow: 1 }} />

        {/* 더 보기 */}
        {renderItem('more', '더 보기', <MenuIcon sx={{ fontSize: 30, color: '#8e8e8e' }} />)}
      </Box>

      {/* 검색 슬라이드 */}
      {showSearch && <SearchSlide open={showSearch} onClose={() => {
        setShowSearch(false);
        setSelected(previousSelected);
      }} 
      sidebarWidth={isWide ? 250 : 72}/>}
    </>
  );
}
