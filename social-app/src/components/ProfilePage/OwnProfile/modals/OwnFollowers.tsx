'use client';

import React, { useEffect, useState } from 'react';
import Style from '../../profilepage.module.css';
import { IUser } from '@/models/userModel';
import Image from 'next/image';
import userIcon from '../../../../../public/images/user-icon.jpg';
import { getFollowersByUserId, deleteFollower, toggleFollow } from '@/services/apiUsers';
import mongoose from 'mongoose';
import { useRouter } from 'next/navigation';

interface FollowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser;
  sessionUser: IUser;
}

const OwnFollowers: React.FC<FollowerModalProps> = ({ isOpen, onClose, user, sessionUser }) => {
  const router = useRouter();
  const [followers, setFollowers] = useState<IUser[]>([]);
  const [isFollowingMap, setIsFollowingMap] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const fetchFollowers = async () => {
      if (isOpen && user?._id) {
        try {
          const data = await getFollowersByUserId(user._id);
          setFollowers(data);
        } catch (error) {
          console.error('Error fetching followers:', error);
        }
      }
    };
    fetchFollowers();
  }, [isOpen, user?._id]);

  const handleFollowerClick = (followerId: string) => {
    router.push(`/${followerId}`); 
  };

  const handleRemoveFollower = async (followerId: string) => {
    try {
      await deleteFollower(user._id, followerId);
      
      setFollowers(prevFollowers => prevFollowers.filter(f => f._id !== followerId));
    } catch (error) {
      console.error('Error removing follower:', error);
    }
  };

  const handleFollowToggle = async (followerId: string) => {
    const isFollowing = isFollowingMap[followerId];
    const action = isFollowing ? 'remove' : 'add';

    try {
        await toggleFollow(user._id, followerId, action);
        setIsFollowingMap(prev => ({ ...prev, [followerId]: !isFollowing }));
    } catch (error) {
        console.error('Error toggling follow:', error);
    }
  };

  return (
    <div className={`${Style.editModal} ${isOpen ? '' : Style.closed}`}>
      <div className={Style.followerContainer}>
        {followers.length > 0 ? (
          followers.map(follower => (
            <div key={follower._id} className={Style.followerBox}>
              <div className={Style.followerImage}>
                <Image 
                  src={follower.profilePhoto || userIcon.src} 
                  alt='' 
                  width={50}
                  height={50}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div className={Style.followerUsername}>
                <p onClick={() => handleFollowerClick(follower._id)}>@{follower.username}</p>
              </div>
              <div className={Style.followToFollower}>
                <button onClick={() => handleRemoveFollower(follower._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No Followers</p>
        )}
        <button className={Style.closeBtn} onClick={onClose}>
          X
        </button>
      </div>
    </div>
  );
};

export default OwnFollowers;