import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, IconButton, Modal, Slider, Avatar
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { jwtDecode } from 'jwt-decode';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { useNavigate } from 'react-router-dom';
import TagUserDialog from '../components/TagUserDialog';

function PostAdd() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [croppedImages, setCroppedImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [tagNames, setTagNames] = useState([]);
  const [userTags, setUserTags] = useState([]);
  const [tagPos, setTagPos] = useState(null);
  const [openTagDialog, setOpenTagDialog] = useState(false);
  const [profileImg, setProfileImg] = useState('');

  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).userId : '';

  useEffect(() => {
    if (!userId) return;

    fetch('http://localhost:4000/user/info/' + userId)
      .then(res => res.json())
      .then(data => {
        setProfileImg(data.profile_img);
      })
      .catch(err => {
        console.error('프로필 이미지 불러오기 실패:', err);
        setProfileImg('/default/profile.png');
      });
  }, [userId]);

  const onCropComplete = useCallback((_, area) => {
    setCroppedAreaPixels(area);
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const imageURLs = selectedFiles.map(file => URL.createObjectURL(file));
    setImages(imageURLs);
    setCroppedImages([]);
    setCurrentIndex(0);
    setZoom(1);
    setOpen(true);
  };

  const handleCropDone = async () => {
    const croppedBlob = await getCroppedImg(images[currentIndex], croppedAreaPixels);
    const croppedUrl = URL.createObjectURL(croppedBlob);
    const updated = [...croppedImages];
    updated[currentIndex] = { blob: croppedBlob, url: croppedUrl };
    setCroppedImages(updated);

    if (currentIndex + 1 < images.length) {
      setCurrentIndex(currentIndex + 1);
      setZoom(1);
    } else {
      setOpen(false);
    }
  };

  const handleUpload = async () => {
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    const formData = new FormData();
    croppedImages.forEach((img, idx) => {
      formData.append('files', img.blob, "image" + idx + ".png");
    });
    formData.append('userId', userId);
    formData.append('content', content);
    formData.append('taggedUsers', JSON.stringify(userTags));

    try {
      const res = await fetch('http://localhost:4000/post', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        const postNo = data.postNo;

        const tags = extractHashtags(content);
        setTagNames(tags);

        // 해시태그 저장
        if (tags.length > 0) {
          await fetch('http://localhost:4000/post/hashtags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postNo, tagNames: tags })
          });
        }

        alert('게시글이 등록되었습니다.');
        setImages([]);
        setCroppedImages([]);
        setContent('');
        setCurrentIndex(0);
        navigate("/main");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('서버 오류');
      console.error(err);
    }
  };

  const extractHashtags = (text) => {
    const tags = text.match(/#[^\s#]+/g);
    if (!tags) return [];
    return [...new Set(tags.map(tag => tag.replace('#', '')))];
  };

  const showPrev = () => {
    setCurrentIndex(prev => (prev === 0 ? croppedImages.length - 1 : prev - 1));
  };

  const showNext = () => {
    setCurrentIndex(prev => (prev === croppedImages.length - 1 ? 0 : prev + 1));
  };

  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTagPos({ x, y, imageIndex: currentIndex });
    setOpenTagDialog(true);
  };

  const handleRemoveTag = (index) => {
    setUserTags(prev => prev.filter((_, i) => i !== index));
  };


  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      {/* 프로필 영역 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar src={`http://localhost:4000/${profileImg || '/default/profile.png'}`} sx={{mr: 1}} />
        <Typography variant="subtitle1"> @{userId}</Typography>
      </Box>

      <Typography variant="h5" mb={2}>게시글 작성</Typography>

      {/* 파일 업로드 */}
      <Button
        variant="outlined"
        component="label"
        startIcon={<PhotoCamera />}
        sx={{
          mb: 2,
          color: '#7e6ae8',
          borderColor: '#c7b8f5',
          '&:hover': {
            borderColor: '#a18df2',
            backgroundColor: '#f3efff'
          }
        }}
      >
        사진 선택
        <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
      </Button>

      {/* 이미지 미리보기 */}
      {croppedImages.length > 0 && (
        <Box sx={{ position: 'relative', mb: 2 }} onClick={handleImageClick}>
          <img
            src={croppedImages[currentIndex]?.url}
            alt={`preview-${currentIndex}`}
            style={{ width: '100%', height: 400, objectFit: 'cover' }}
          />
          {userTags
            .filter(tag => tag.imageIndex === currentIndex)
            .map((tag, idx) => (
              <Box
                key={idx}
                onClick={() => handleRemoveTag(idx)}
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
                  cursor: 'pointer',
                  zIndex: 10,
                  '&:hover': {
                    bgcolor: 'rgba(255,0,0,0.6)', // hover 시 빨간색으로 경고
                  },
                }}
              >
                @{tag.userId} ✕
              </Box>
            ))}
          <IconButton onClick={showPrev} sx={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', color: '#7e6ae8' }}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <IconButton onClick={showNext} sx={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', color: '#7e6ae8' }}>
            <ArrowForwardIosIcon />
          </IconButton>
          <Box sx={{ position: 'absolute', bottom: 8, width: '100%', display: 'flex', justifyContent: 'center', gap: 1 }}>
            {croppedImages.map((_, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: idx === currentIndex ? '#7e6ae8' : '#e0d8f9'
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* 내용 입력 */}
      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder="오늘 어떤 일이 있었나요?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        sx={{
          border: '1px solid #c7b8f5',
          borderRadius: 2,
          p: 1,
          bgcolor: '#faf8ff',
          mb: 1,
          '& .MuiOutlinedInput-root': {
            '& fieldset': { border: 'none' },
          }
        }}
      />

      {/* 해시태그 추천 */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {['#맛집', '#하루기록', '#OOTD'].map(tag => (
          <Button
            key={tag}
            size="small"
            sx={{
              backgroundColor: '#f0eaff',
              color: '#7e6ae8',
              fontSize: 12,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#e0d8f9' }
            }}
            onClick={() => setContent(prev => prev + ` ${tag} `)}
          >
            {tag}
          </Button>
        ))}
      </Box>

      {/* 업로드 버튼 */}
      <Button
        variant="contained"
        fullWidth
        onClick={handleUpload}
        disabled={!content.trim()}
        sx={{
          mt: 2,
          backgroundColor: '#c7b8f5',
          '&:hover': { backgroundColor: '#a18df2' },
          '&.Mui-disabled': { backgroundColor: '#e2dcf6', color: '#fff' }
        }}
      >
        업로드
      </Button>

      {/* 자르기 모달 */}
      <Modal open={open}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, bgcolor: '#fff', p: 2 }}>
          <Typography variant="subtitle1" mb={1}>사진 {currentIndex + 1} / {images.length}</Typography>
          <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
            <Cropper
              image={images[currentIndex]}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </Box>
          <Slider min={1} max={3} step={0.1} value={zoom} onChange={(e, val) => setZoom(val)} sx={{ mt: 2, color: '#c7b8f5' }} />
          <Button fullWidth variant="contained" sx={{ mt: 2, backgroundColor: '#c7b8f5', '&:hover': { backgroundColor: '#a18df2' } }} onClick={handleCropDone}>
            {currentIndex + 1 < images.length ? '다음 사진' : '자르기 완료'}
          </Button>
        </Box>
      </Modal>

      <TagUserDialog
        open={openTagDialog}
        onClose={() => setOpenTagDialog(false)}
        onSelect={(user) => {
          setUserTags(prev => [...prev, {
            userId: user.userId,
            nickname: user.nickname,
            x: tagPos.x,
            y: tagPos.y,
            imageIndex: tagPos.imageIndex
          }]);
          setOpenTagDialog(false);
        }}
      />
    </Box>
  );
}

export default PostAdd;
