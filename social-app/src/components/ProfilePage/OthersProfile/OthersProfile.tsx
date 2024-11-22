'use client';

import { FaHeart, FaRegComment } from 'react-icons/fa';
import Style from '../profilepage.module.css';
import Image from 'next/image';
import imageIcon from '../../../../public/images/image-icon.png';
import { IUser } from '@/models/userModel';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';  
import { getUserById, requestUser, toggleFollow } from '@/services/apiUsers';  
import { getPosts } from '@/services/apiPosts';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/firebase';
import { useRouter } from 'next/navigation';
import { getSession, useSession } from 'next-auth/react'; 
import { useQuery } from '@tanstack/react-query';
import mongoose from 'mongoose';
import Loader from '@/components/ui/Loader';
import OthersFollowers from './modals/OthersFollowers';
import OwnFollowers from '../OwnProfile/modals/OwnFollowers';
import OthersFollowings from './modals/OthersFollowings';
import { checkExistingChat, createChat } from '@/services/apiChats';

export default function OthersProfile() {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [sessionUser, setSessionUser] = useState<IUser | undefined>(undefined);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFollowers, setOpenFollowers] = useState(false);
  const [openFollowings, setOpenFollowings] = useState(false);
  const { userId } = useParams();  
  const router = useRouter();


  const { data: userData, error } = useQuery<IUser | undefined, Error>({
    queryKey: ["request-user", session?.user?.email],
    queryFn: async () => {
        if (!session?.user?.email) {
            throw new Error("No email found in session");
        }
        const sessionUser = await requestUser(session.user.email);
        return sessionUser;
    },
    initialData: session?.user as IUser | undefined,
});

useEffect(() => {
    if (userData) {
        setSessionUser(userData); 
    }
}, [userData]);



  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {  
        try {
          const fetchedUser = await getUserById(userId as string);  
          setUser(fetchedUser);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
    };
    fetchUser();
  }, [userId]);

  useEffect(() => {
    const fetchPosts = async () => {
        try {
            const data = await getPosts();
            if (Array.isArray(data)) {
                const userPosts = data.filter(post => post.author._id === user?._id);
                const postsWithImages = await Promise.all(
                    userPosts.map(async (post) => {
                        if (post.image) {
                            try {
                                const imageRef = ref(storage, post.image);
                                post.imageUrl = await getDownloadURL(imageRef);
                            } catch (error) {
                                console.error('Image fetch error:', error);
                                post.imageUrl = '';
                            }
                        }
                        return post;
                    })
                );
                const sortedPosts = postsWithImages.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                setPosts(sortedPosts);
            } else {
                throw new Error('Data is not an array');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    fetchPosts();
  }, [user?._id]);

  const handlePostClick = (postId: string) => {
    router.push(`/p/${postId}`);
  };

useEffect(() => {
  if (user && sessionUser) {
      if (Array.isArray(sessionUser.following) && user._id) {
          const isCurrentlyFollowing = sessionUser.following.includes(user._id as unknown as mongoose.Types.ObjectId);
          setIsFollowing(isCurrentlyFollowing);
      }
  }
}, [user, sessionUser]);


  const handleFollowToggle = async () => {
    if (!sessionUser) {
        return;
    }

    if (!user) { 
        console.error('User not found');
        return;
    }

    try {
        const action = isFollowing ? 'remove' : 'add';
        await toggleFollow(sessionUser._id, user._id, action); 
        
        // UI güncelle
        setIsFollowing(prev => !prev);
    } catch (error) {
        console.error('Failed to toggle follow:', error);
    }
};


const toggleFollowersModal = () => {
  setOpenFollowers(!openFollowers)
}

const toggleFollowingModal = () => {
  setOpenFollowings(!openFollowings)
}


const handleSendMessage = async () => {
  if (!sessionUser || !user) {
    console.error('User session or profile user is not available');
    return;
  }

  try {

    const participants = [sessionUser._id, user._id];
    console.log("Participants:", participants); 

    // Mevcut sohbeti kontrol et
    const existingChat = await checkExistingChat(participants);

    if (existingChat) {
 
      console.log('Existing chat found:', existingChat);
      router.push(`/chats/${existingChat._id}`); 
    } else {
      // Yeni chat oluştur
      const newChat = await createChat(participants);
      console.log('New chat created:', newChat);

     
      router.push(`/chats/${newChat._id}`); 
    }
  } catch (error) {
    console.error('Failed to create chat:', error);
  }
};

  return (
    <div className={Style.profilePage}>
       <OthersFollowers isOpen={openFollowers} onClose={toggleFollowersModal} user={user as IUser} sessionUser={sessionUser as IUser} />
       <OthersFollowings isOpen={openFollowings} onClose={toggleFollowingModal} user={user as IUser} sessionUser={sessionUser as IUser}/>
      <div className={Style.profileContainer}>
        <div className={Style.profileInfoArea}>
          <div className={Style.profileImage}>
            <div className={Style.imageWrapper}>
              <Image 
                src={user?.profilePhoto || imageIcon.src} 
                alt={user ? user.username : 'User'} 
                width={140} 
                height={140} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
          </div>
          <div className={Style.userAccountInfo}>
            <div className={Style.othersProfileMenu}>
              <p>@{user?.username || 'username'}</p>
              <button className={Style.followBtn} onClick={handleFollowToggle}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button onClick={handleSendMessage}>Send Message</button>
            </div>
            <div className={Style.profileStats}>
              <p>{user?.posts?.length || 0} posts</p>
              <p onClick={toggleFollowersModal} style={{cursor: 'pointer'}}>{user?.followers?.length || 0} followers</p>
              <p onClick={toggleFollowingModal} style={{cursor: 'pointer'}}>{user?.following?.length || 0} follows</p>
            </div>
            <div className={Style.profileName}>
              <p>{user?.name || 'User Name'}</p>
            </div>
            <div className={Style.profileBio}>
              <p>{user?.bio || ''}</p>
            </div>
          </div>
        </div>

        <div className={Style.line}></div>

        <div className={Style.postArea}>
          <h3>POSTS</h3>
          <div className={Style.profilePostsArea}>
             {loading ? (
                <Loader />
             ) : posts.length > 0 ? (
                 posts.map(post => (
                    <div key={post._id} className={Style.postBox} onClick={() => handlePostClick(post._id)}>
                        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                            <Image
                                src={post.imageUrl || imageIcon.src}
                                alt="Post image"
                                layout="fill"
                                objectFit="cover"
                                objectPosition="center"
                            />
                        </div>
                        <div className={Style.overlay}>
                            <div className={Style.iconContainer}>
                                <FaHeart className={Style.icon} />
                                <span>{post.likes.length || 0}</span>
                            </div>
                            <div className={Style.iconContainer}>
                                <FaRegComment className={Style.icon} />
                                <span>{post.comments.length || 0}</span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p>No posts available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
