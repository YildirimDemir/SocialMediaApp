'use client';

import React from 'react';
import Style from './story.module.css';
import Image from 'next/image';
import { IStory } from '@/models/storyModel';
import calculateTimeAgo from '@/lib/calculateTimeAgo';

interface StoryModal {
  isOpen: boolean;
  onClose: () => void;
  stories: IStory[];
}

const FollowingStory: React.FC<StoryModal> = ({ isOpen, onClose, stories }) => {
  const filteredStories = stories.filter((story) => {
    const currentTime = new Date();
    const storyTime = new Date(story.createdAt);
    const timeDiff = currentTime.getTime() - storyTime.getTime();
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000; 

    return timeDiff <= twentyFourHoursInMs;
  });

  return (
    <div className={`${Style.storyArea} ${isOpen ? '' : Style.closed}`}>
      {filteredStories.length > 0 ? (
        <div className={Style.storyContainer}>
          {filteredStories.map((story) => (
            <div className={Style.storyUpload} key={story?._id?.toString()}>
              <Image
                src={story.image || '/placeholder.png'} 
                height={300}
                width={300}
                className={Style.storyImage}
                alt="Story Image"
              />
              <div className={Style.storyTextAdd}>
                <p>{story.text}</p>
              </div>
              <p className={Style.timeAgo}>{calculateTimeAgo(story.createdAt)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'white', textAlign: 'center', fontSize: '2rem' }}>
          No Stories
        </p>
      )}
      <button onClick={onClose} className={Style.closeBtn}>
        X
      </button>
    </div>
  );
};

export default FollowingStory;