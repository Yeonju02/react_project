import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Paper
} from '@mui/material';

import loginSlide from '../assets/login-slide.png';
import logo from '../assets/instagram-logo.png';
import { useNavigate } from 'react-router-dom';

function Login() {
    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Grand+Hotel&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }, []);
    
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 쿠키 인증 시
        body: JSON.stringify({ userId, password })
      });
  
      const data = await res.json();
  
      if (data.success) {
        localStorage.setItem('token', data.token);
        navigate("/main");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('서버 오류');
      console.error(err);
    }
  };
  

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
      }}
    >
      {/* 좌측 이미지 영역 */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, mr: 5 }}>
        <img
          src={loginSlide} 
          alt="Instagram Side Png"
          style={{ height: 500 }}
        />
      </Box>

      {/* 우측 로그인 박스 */}
      <Box>
        <Paper elevation={3} sx={{ p: 4, width: 350, textAlign: 'center' }}>
            <img
                src={logo}
                alt="Instagram"
                style={{ height: 100 }}
            />
          <Typography variant="h3" fontFamily="'Grand Hotel', cursive" mb={3}>
            Instagram
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            label="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 2, bgcolor: '#0095f6', textTransform: 'none' }}
            onClick={handleLogin}
          >
            로그인
          </Button>

          <Typography variant="body2" color="textSecondary" mb={2}>
            또는
          </Typography>

          <Typography variant="body2" mb={2}>
            <Link href="#" underline="hover">
              비밀번호를 잊으셨나요?
            </Link>
          </Typography>

          <Typography variant="body2">
            계정이 없으신가요?{' '}
            <Link href="/join" underline="hover" color="#0095f6">
              가입하기
            </Link>
          </Typography>
        </Paper>

      </Box>
    </Box>
  );
}

export default Login;
