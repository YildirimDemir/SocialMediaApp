'use client';

import React, { useEffect, useState } from 'react';
import Style from '../../profilepage.module.css';
import { IUser } from '@/models/userModel';
import Image from 'next/image';
import userIcon from '../../../../../public/images/user-icon.jpg';
import { getFollowersByUserId, toggleFollow } from '@/services/apiUsers';
import mongoose from 'mongoose';
import { useRouter } from 'next/navigation';

interface FollowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser;
  sessionUser: IUser;
}

const OthersFollowers: React.FC<FollowerModalProps> = ({ isOpen, onClose, user, sessionUser }) => {
  const router = useRouter();
  const [followers, setFollowers] = useState<IUser[]>([]);
  const [isFollowingMap, setIsFollowingMap] = useState<Record<string, boolean>>({});
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  useEffect(() => {
    const fetchFollowers = async () => {
      if (isOpen && user?._id) {
        try {
          const data = await getFollowersByUserId(user._id);
          setFollowers(data);

          const followingStatus = data.reduce((acc, follower) => {
            acc[follower._id] = false;
            return acc;
          }, {} as Record<string, boolean>);

          setIsFollowingMap(followingStatus);
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

  const handleFollowToggle = async (followerId: string) => {
    const isFollowing = isFollowingMap[followerId];
    const action = isFollowing ? 'remove' : 'add';

    try {
      await toggleFollow(sessionUser._id, followerId, action); 
      setIsFollowingMap(prev => ({ ...prev, [followerId]: !isFollowing }));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  useEffect(() => {
    if (user && sessionUser) {
      if (Array.isArray(sessionUser.following) && user._id) {
        const isCurrentlyFollowing = sessionUser.following.includes(user._id as unknown as mongoose.Types.ObjectId);
        setIsFollowing(isCurrentlyFollowing);
      }
    }
  }, [user, sessionUser]);

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
                <button onClick={() => handleFollowToggle(follower._id)}>
                  {isFollowingMap[follower._id] ? 'Unfollow' : 'Follow'}
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

export default OthersFollowers;