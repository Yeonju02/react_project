import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // 로고 이미지 경로

function Join() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleJoin = async () => {
    if (!isValidEmail(email)) {
      alert('올바른 이메일 형식이 아닙니다.');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/user/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password, name, email })
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        navigate('/login');
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
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#fafafa"
    >
      <Box>
        <Paper elevation={3} sx={{ p: 4, width: 350, textAlign: 'center' }}>
          <img
            src={logo}
            alt="Instagram"
            style={{ height: 90, marginBottom: 10 }}
          />

          <Typography variant="h6" mb={2} sx={{ color: '#ba9fe3' }}>
            계정을 만들어 친구들과 사진을 공유하고 소통하세요.
          </Typography>

          <TextField
            fullWidth
            label="아이디"
            variant="outlined"
            margin="dense"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            sx={{
              '& label.Mui-focused': {
                color: '#ba9fe3',
              },
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#ba9fe3',
                }
              }
            }}
          />
          <TextField
            fullWidth
            label="비밀번호"
            type="password"
            variant="outlined"
            margin="dense"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              '& label.Mui-focused': {
                color: '#ba9fe3',
              },
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#ba9fe3',
                }
              }
            }}
          />
          <TextField
            fullWidth
            label="이름"
            variant="outlined"
            margin="dense"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              '& label.Mui-focused': {
                color: '#ba9fe3',
              },
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#ba9fe3',
                }
              }
            }}
          />
          <TextField
            fullWidth
            label="이메일"
            variant="outlined"
            margin="dense"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              '& label.Mui-focused': {
                color: '#ba9fe3',
              },
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#ba9fe3',
                }
              }
            }}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              bgcolor: '#ba9fe3',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#a17de3'
              }
            }}
            onClick={handleJoin}
          >
            가입하기
          </Button>
        </Paper>

        <Paper elevation={1} sx={{ p: 2, mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            계정이 있으신가요?{' '}
            <Link
              href="/login"
              underline="hover"
              sx={{
                color: '#ba9fe3',
                '&:hover': {
                  color: '#a17de3'
                }
              }}
            >
              로그인
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default Join;
