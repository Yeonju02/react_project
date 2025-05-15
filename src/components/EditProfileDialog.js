import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Avatar, Box
} from '@mui/material';

export default function EditProfileDialog({ open, onClose, user }) {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setBio(user.bio || '');
            setPreview(user.profile_img ? `http://localhost:4000/${user.profile_img}` : '');
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('bio', bio);
        if (image) formData.append('profile_img', image);

        const token = localStorage.getItem('token');
        await fetch('http://localhost:4000/user/profile', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle sx={{ textAlign: 'center', color: '#5e35b1' }}>
                프로필 수정
            </DialogTitle>
            <DialogContent
                sx={{
                    pb: 3
                }}
            >
                <Box display="flex" flexDirection="column" alignItems="center" gap={2} sx={{ mt: 1 }}>
                    <Avatar
                        src={preview || '/assets/profile.jpg'}
                        sx={{ width: 100, height: 100, border: '2px solid #d1c4e9' }}
                    />
                    <Button
                        variant="outlined"
                        component="label"
                        sx={{
                            borderColor: '#b39ddb',
                            color: '#5e35b1',
                            '&:hover': {
                                backgroundColor: '#ede7f6',
                                borderColor: '#9575cd'
                            }
                        }}
                    >
                        프로필 사진 변경
                        <input type="file" hidden onChange={handleImageChange} />
                    </Button>
                    <TextField
                        label="이름"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#d1c4e9' },
                                '&:hover fieldset': { borderColor: '#b39ddb' },
                                '&.Mui-focused fieldset': { borderColor: '#9575cd' }
                            },
                            '& label': { color: '#b39ddb' },
                            '& label.Mui-focused': { color: '#9575cd' }
                        }}
                    />
                    <TextField
                        label="자기소개"
                        fullWidth
                        multiline
                        minRows={2}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#d1c4e9' },
                                '&:hover fieldset': { borderColor: '#b39ddb' },
                                '&.Mui-focused fieldset': { borderColor: '#9575cd' }
                            },
                            '& label': { color: '#b39ddb' },
                            '& label.Mui-focused': { color: '#9575cd' }
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={{ color: '#5e35b1' }}>취소</Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    sx={{
                        backgroundColor: '#b39ddb',
                        '&:hover': {
                            backgroundColor: '#9575cd'
                        }
                    }}
                >
                    저장
                </Button>
            </DialogActions>
        </Dialog>
    );
}
