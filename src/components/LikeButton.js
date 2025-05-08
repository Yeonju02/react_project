import React, { useState } from 'react';
import heartEmpty from '../assets/heart-empty.png';
import heartFilled from '../assets/heart-filled.png';
import '../styles/likeButton.css'; // 애니메이션용 CSS

function LikeButton({ postNo, initialLiked, initialCount }) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount || 0);
  const [animate, setAnimate] = useState(false);

  // 좋아요 토글
  const toggleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = "http://localhost:4000/like/" + postNo;
      const options = {
        method: liked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          "authorization" : "Bearer " + token
        }
      };

      const res = await fetch(url, options);
      const data = await res.json();
      if (data.success) {
        setLiked(!liked);
        setLikeCount((prev) => prev + (liked ? -1 : 1));
        if (!liked) triggerAnimation();
      }
    } catch (err) {
      console.error('좋아요 처리 오류:', err);
    }
  };

  // 애니메이션 트리거
  const triggerAnimation = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 500);
  };

  return (
    <>
        <div className="like-container">
            <img
                src={liked ? heartFilled : heartEmpty}
                alt="like"
                className={'heart-icon' + (animate ? ' animate' : '')}
                onClick={toggleLike}
            />
        </div>
        <div className="like-count">{likeCount}개</div>
    </>
    
  );
}

export default LikeButton;
