'use client';

import React, { useEffect, useState } from 'react';
import Style from './storyarea.module.css';
import Image from 'next/image';
import userIcon from './../../../public/images/user-icon.jpg';
import Story from '../StoryModal/Story';
import { useQuery } from '@tanstack/react-query';
import { getFollowingByUserId, requestUser } from '@/services/apiUsers';
import { useSession } from 'next-auth/react';
import { IUser } from '@/models/userModel';
import { getStories } from '@/services/apiStories';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/firebase';
import { IStory } from '@/models/storyModel';
import FollowingStory from '../StoryModal/FollowingStory';
import Loader from '@/components/ui/Loader'; 
import StoriesAreaLoader from '../ui/Loaders/StoriesAreaLoader';

export default function StoryArea() {
  const [openStoryModal, setOpenStoryModal] = useState(false);
  const [openFollowingStoryModal, setOpenFollowingStoryModal] = useState(false);
  const [user, setUser] = useState<IUser | undefined>(undefined);
  const [userStories, setUserStories] = useState<IStory[]>([]);
  const [followingStories, setFollowingStories] = useState<IStory[]>([]);
  const { data: session } = useSession();
  const [followings, setFollowings] = useState<IUser[]>([]);

  const { data: userData, error, isLoading: isUserLoading } = useQuery<IUser | undefined, Error>({
    queryKey: ["request-user", session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) {
        throw new Error("No email found in session");
      }
      const user = await requestUser(session.user.email);
      return user;
    },
    initialData: session?.user as IUser | undefined,
  });

  const { data: storiesData, isLoading: isStoriesLoading } = useQuery<IStory[], Error>({
    queryKey: ['stories'],
    queryFn: getStories,
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  useEffect(() => {
    const fetchFollowings = async () => {
      if (user?._id) {
        try {
          const data = await getFollowingByUserId(user._id);
          setFollowings(data);
        } catch (error) {
          console.error('Error fetching followings:', error);
        }
      }
    };
    fetchFollowings();
  }, [user?._id]);

  useEffect(() => {
    const fetchUserStories = async () => {
      if (user?._id && storiesData) {
        const userStories = storiesData.filter((story: IStory) => story?.user?._id?.toString() === user?._id?.toString());

        const storiesWithImages = await Promise.all(
          userStories.map(async (story: IStory) => {
            if (story.image) {
              try {
                const imageRef = ref(storage, story.image);
                story.image = await getDownloadURL(imageRef);
              } catch (error) {
                console.error('Image fetch error:', error);
                story.image = '';
              }
            }
            return story;
          })
        );

        setUserStories(storiesWithImages);
        console.log('User Stories:', storiesWithImages);
      }
    };
    fetchUserStories();
  }, [user?._id, storiesData]);

  useEffect(() => {
    const fetchFollowingStories = async () => {
      if (followings.length > 0 && storiesData) {
        const followingStories = storiesData.filter((story: IStory) =>
          followings.some((following) => following?._id?.toString() === story?.user?._id?.toString())
        );

        const storiesWithImages = await Promise.all(
          followingStories.map(async (story: IStory) => {
            if (story.image) {
              try {
                const imageRef = ref(storage, story.image);
                story.image = await getDownloadURL(imageRef);
              } catch (error) {
                console.error('Image fetch error:', error);
                story.image = '';
              }
            }
            return story;
          })
        );
        setFollowingStories(storiesWithImages);
        console.log('Following Stories:', storiesWithImages);
      }
    };
    fetchFollowingStories();
  }, [followings, storiesData]);

  const togglePostStoryModal = () => {
    setOpenStoryModal(!openStoryModal);
  };

  const toggleFollowingStoryModal = () => {
    setOpenFollowingStoryModal(!openFollowingStoryModal);
  };

  if (isUserLoading || isStoriesLoading) {
    return <StoriesAreaLoader />; 
  }

  return (
    <div className={Style.storyArea}>
      <Story
        onClose={togglePostStoryModal}
        isOpen={openStoryModal}
        stories={userStories}
      />
      <FollowingStory
        onClose={toggleFollowingStoryModal}
        isOpen={openFollowingStoryModal}
        stories={followingStories}
      />

      <div className={Style.usersStory}>
        <div className={`${Style.profileImage} ${userStories.length > 0 ? '' : Style.noStories}`} onClick={togglePostStoryModal}>
          <Image alt='' src={user?.profilePhoto as string || '/images/user-icon.jpg'} width={73} height={73} />
        </div>
        <p>{user?.username}</p>
      </div>

      <div className={Style.line}></div>

      {followings.map((following) => (
        <div
          key={following?._id}
          className={Style.usersStory}
          onClick={() => {
            const storiesForFollowing = followingStories.filter(
              (story) => story?.user?._id?.toString() === following?._id?.toString()
            );
            setFollowingStories(storiesForFollowing);
            toggleFollowingStoryModal();
          }}
        >
          <div className={Style.profileImage}>
            <Image
              alt=""
              src={following.profilePhoto || '/images/user-icon.jpg'}
              width={73}
              height={73}
            />
          </div>
          <p>{following.username}</p>
        </div>
      ))}
    </div>
  );
}
