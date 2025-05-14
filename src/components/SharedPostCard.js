import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';

export default function SharedPostCard({ postUserId, content, image }) {
  const hasImage = !!image;

  return (
    <Card sx={{ width: 260, borderRadius: 2 }}>
      {hasImage ? (
        <CardMedia
          component="img"
          height="160"
          image={`http://localhost:4000${image}`}
          alt="공유된 게시글"
        />
      ) : (
        <Box
          height="160px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ backgroundColor: '#f0f0f0', color: '#888', fontSize: 14 }}
        >
          이미지 없음
        </Box>
      )}

      <CardContent sx={{ p: 1 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          @{postUserId}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            whiteSpace: 'pre-line'
          }}
        >
          {content}
        </Typography>
      </CardContent>
    </Card>
  );
}
