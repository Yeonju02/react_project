import React, { useState } from 'react';
import { Box, IconButton, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddBoxIcon from '@mui/icons-material/AddBox';
import logo from '../assets/instagram-logo.png';


export default function Menu() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('home');

  const handleMenuClick = (menu, path) => {
    setSelected(menu);
    if (path) navigate(path);
  };

  const iconColor = (menu) => selected === menu ? '#CBA3E3' : '#8e8e8e';

  return (
    <Box
      sx={{
        width: 72,
        height: '100vh',
        borderRight: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#fff',
        py: 2,
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 20
      }}
    >
      {/* 로고 */}
      <Box sx={{ mb: 4 }}>
        <img src={logo} alt="Instagram Logo" style={{ height: 50 }} />
      </Box>

      {/* 메뉴 아이콘들 */}
      <IconButton sx={{ my: 1 }} onClick={() => handleMenuClick('home', '/main')}>
        <HomeIcon sx={{ color: iconColor('home'), fontSize : 40 }} />
      </IconButton>

      <IconButton sx={{ my: 1 }} onClick={() => handleMenuClick('search')}>
        <SearchIcon sx={{ color: iconColor('search'), fontSize : 40 }} />
      </IconButton>

      <IconButton sx={{ my: 1 }} onClick={() => handleMenuClick('dm', '/message')}>
        <SendIcon fontSize="large" sx={{ color: iconColor('dm') }} />
      </IconButton>

      <IconButton sx={{ my: 2 }} onClick={() => handleMenuClick('like')}>
        <FavoriteIcon fontSize="large" sx={{ color: iconColor('like') }} />
      </IconButton>

      <IconButton sx={{ my: 1 }} onClick={() => handleMenuClick('add', '/post/add')}>
        <AddBoxIcon fontSize="large" sx={{ color: iconColor('add') }} />
      </IconButton>

      {/* 프로필 이미지 */}
      <Box sx={{ flexGrow: 1 }} />
      <IconButton onClick={() => handleMenuClick('mypage', '/mypage')}>
        <Avatar
          src="/assets/profile.jpg"
          sx={{
            width: 32,
            height: 32,
            border: selected === 'mypage' ? '2px solid black' : 'none'
          }}
        />
      </IconButton>
    </Box>
  );
}
