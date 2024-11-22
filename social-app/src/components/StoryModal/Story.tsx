'use client';

import React from 'react';
import Style from './story.module.css';
import Image from 'next/image';
import { IStory } from '@/models/storyModel';
import calculateTimeAgo from '@/lib/calculateTimeAgo'; 
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { deleteStory } from '@/services/apiStories';

interface StoryModal {
  isOpen: boolean;
  onClose: () => void;
  stories: IStory[];
}

const Story: React.FC<StoryModal> = ({ isOpen, onClose, stories }) => {
  const router = useRouter()
  const filteredStories = stories.filter((story) => {
    const currentTime = new Date();
    const storyTime = new Date(story.createdAt); 
    const timeDiff = currentTime.getTime() - storyTime.getTime();
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

    return timeDiff <= twentyFourHoursInMs;
  });

  const handleDeleteStory = async (storyId: string) => {
    try {
        await deleteStory(storyId);
        toast.success('Story deleted successfully');
        console.log('Story deleted');
    } catch (error) {
        console.error('Error deleting story:', error);
    }
};

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
              <button
                className={Style.deleteStoryBtn}
                onClick={() => {
                  if (story?._id) {
                    handleDeleteStory(story._id.toString());
                  } else {
                    console.error("Story ID is undefined.");
                  }
                }}
              >
                X
              </button>

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

export default Story;
