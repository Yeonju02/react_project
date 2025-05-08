// PostAdd.js (slide dot indicator version)
import React, { useState, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, IconButton, Modal, Slider
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {jwtDecode} from 'jwt-decode';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { useNavigate } from 'react-router-dom';

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

  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).userId : '';

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
    const formData = new FormData();
    croppedImages.forEach((img, idx) => {
        formData.append('files', img.blob, "image" + idx + ".png")
    });
    formData.append('userId', userId);
    formData.append('content', content);

    try {
      const res = await fetch('http://localhost:4000/post', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
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

  const showPrev = () => {
    setCurrentIndex(prev => (prev === 0 ? croppedImages.length - 1 : prev - 1));
  };

  const showNext = () => {
    setCurrentIndex(prev => (prev === croppedImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>게시글 작성</Typography>

      <Button
        variant="outlined"
        component="label"
        startIcon={<PhotoCamera />}
        sx={{ mb: 2 }}
      >
        사진 선택
        <input
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
      </Button>

      {croppedImages.length > 0 && (
        <Box sx={{ position: 'relative', mb: 2 }}>
          <img
            src={croppedImages[currentIndex]?.url}
            alt={`preview-${currentIndex}`}
            style={{ width: '100%', height: 400, objectFit: 'cover' }}
          />
          <IconButton onClick={showPrev} sx={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)' }}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <IconButton onClick={showNext} sx={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)' }}>
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
                  backgroundColor: idx === currentIndex ? '#000' : '#ccc'
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      <TextField
        fullWidth
        multiline
        rows={4}
        label="내용을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleUpload}
      >
        업로드
      </Button>

      {/* Cropper 모달 */}
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
          <Slider min={1} max={3} step={0.1} value={zoom} onChange={(e, val) => setZoom(val)} sx={{ mt: 2 }} />
          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleCropDone}>
            {currentIndex + 1 < images.length ? '다음 사진' : '자르기 완료'}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}

export default PostAdd;