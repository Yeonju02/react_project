import React, { useState } from 'react';
import bookmarkEmpty from '../assets/bookmark-empty.png';
import bookmarkFilled from '../assets/bookmark-filled.png';

function SaveButton({ postNo, initialSaved }) {
  const [saved, setSaved] = useState(initialSaved);

  const toggleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = "http://localhost:4000/save/" + postNo;
      const options = {
        method: saved ? 'DELETE' : 'POST',
        headers: {
            "authorization" : "Bearer " + token
        }
      };

      const res = await fetch(url, options);
      const data = await res.json();
      if (data.success) {
        setSaved(!saved);
      }
    } catch (err) {
      console.error('저장 처리 오류:', err);
    }
  };

  return (
    <img
      src={saved ? bookmarkFilled : bookmarkEmpty}
      alt="저장"
      onClick={toggleSave}
      style={{ width: 22, height: 22, cursor: 'pointer' }}
    />
  );
}

export default SaveButton;
