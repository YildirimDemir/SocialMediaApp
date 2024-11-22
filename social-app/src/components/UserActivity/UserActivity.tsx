'use client';

import React, { useState } from 'react';
import Style from './useractivity.module.css';
import Likes from './Activities/Likes';
import Comments from './Activities/Comments';

export default function UserActivity() {
  
  const [selectedActivity, setSelectedActivity] = useState<string>('likes');

  return (
    <div className={Style.activityPage}>
      <div className={Style.activitySidebar}>
        <button
          className={Style.chooseBtn}
          onClick={() => setSelectedActivity('likes')}
        >
          Likes
        </button>
        <button
          className={Style.chooseBtn}
          onClick={() => setSelectedActivity('comments')}
        >
          Comments
        </button>
      </div>
      <div className={Style.selectedActivityArea}>
        {selectedActivity === 'likes' && <Likes />}
        {selectedActivity === 'comments' && <Comments />}
      </div>
    </div>
  );
}
