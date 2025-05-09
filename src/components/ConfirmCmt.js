import React from 'react';
import {
  Dialog, Button, Box
} from '@mui/material';

function ConfirmCmt({ open, onClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 360,
          borderRadius: 3,
          overflow: 'hidden',
        }
      }}
    >
      <Box>
        <Button
          fullWidth
          onClick={onConfirm}
          sx={{
            color: 'red',
            fontWeight: 'bold',
            fontSize: 16,
            borderBottom: '1px solid #ddd',
            py: 2
          }}
        >
          삭제
        </Button>
        <Button
          fullWidth
          onClick={onClose}
          sx={{
            fontSize: 16,
            py: 2
          }}
        >
          취소
        </Button>
      </Box>
    </Dialog>
  );
}

export default ConfirmCmt;
