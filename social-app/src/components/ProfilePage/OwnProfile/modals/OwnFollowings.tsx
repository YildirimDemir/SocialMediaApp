'use client';

import React, { useEffect, useState } from 'react';
import Style from '../../profilepage.module.css';
import { IUser } from '@/models/userModel';
import Image from 'next/image';
import userIcon from '../../../../../public/images/user-icon.jpg';
import { getFollowersByUserId, getFollowingByUserId, toggleFollow } from '@/services/apiUsers';
import mongoose from 'mongoose';
import { useRouter } from 'next/navigation';

interface FollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser;
  sessionUser: IUser;
}

const OwnFollowings: React.FC<FollowingModalProps> = ({ isOpen, onClose, user, sessionUser }) => {
  const router = useRouter();
  const [followings, setFollowings] = useState<IUser[]>([]);
  const [isFollowingMap, setIsFollowingMap] = useState<Record<string, boolean>>({});
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  useEffect(() => {
    const fetchFollowings= async () => {
      if (isOpen && user?._id) {
        try {
          const data = await getFollowingByUserId(user._id);
          setFollowings(data);

          const followingStatus = data.reduce((acc, following) => {
            acc[following._id] = false;
            return acc;
          }, {} as Record<string, boolean>);

          setIsFollowingMap(followingStatus);
        } catch (error) {
          console.error('Error fetching followings:', error);
        }
      }
    };
    fetchFollowings();
  }, [isOpen, user?._id]);

  const handleFollowingClick = (followingId: string) => {
    router.push(`/${followingId}`); 
  };

  const handleFollowToggle = async (followingId: string) => {
    const isFollowing = isFollowingMap[followingId];
    const action = isFollowing ? 'remove' : 'add';

    try {
        await toggleFollow(user._id, followingId, action);
        setIsFollowingMap(prev => ({ ...prev, [followingId]: !isFollowing }));
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
        {followings.length > 0 ? (
          followings.map(following => (
            <div key={following._id} className={Style.followerBox}>
              <div className={Style.followerImage}>
                <Image 
                  src={following.profilePhoto || userIcon.src} 
                  alt='' 
                  width={50}
                  height={50}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div className={Style.followerUsername}>
                <p onClick={() => handleFollowingClick(following._id)}>@{following.username}</p>
              </div>
              <div className={Style.followToFollower}>
                <button onClick={() => handleFollowToggle(following._id)}>
                  {isFollowingMap[following._id] ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No Following</p>
        )}
        <button className={Style.closeBtn} onClick={onClose}>
          X
        </button>
      </div>
    </div>
  );
};

export default OwnFollowings