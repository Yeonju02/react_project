import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { useState } from 'react';

import Login from './pages/Login';
import Join from './pages/Join';
import Main from './pages/Main';
import MyPage from './pages/MyPage';
import PostAdd from './pages/PostAdd';
import PostEdit from './pages/PostEdit';
import PostView from './pages/PostView';
import Dm from './pages/Dm';
import EditProfile from './pages/EditProfile';
import UserPage from './pages/UserPage';

import Menu from './components/Menu';

function App() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/join' ||
    location.pathname === '/';

  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {!isAuthPage && <Menu unreadCount={unreadCount} setUnreadCount={setUnreadCount} />}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/main" element={<Main />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/user/:userId" element={<UserPage />} />
          <Route path="/post/add" element={<PostAdd />} />
          <Route path="/post/edit/:postNo" element={<PostEdit />} />
          <Route path="/post/:postNo" element={<PostView />} />
          <Route path="/dm" element={<Dm setUnreadCount={setUnreadCount} />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
