'use client';

import { FaHeart, FaPlus, FaRegComment, FaSignOutAlt } from 'react-icons/fa';
import Style from '../profilepage.module.css';
import Image from 'next/image';
import imageIcon from '../../../../public/images/image-icon.png';
import { IUser } from '@/models/userModel';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { requestUser, userLogout } from '@/services/apiUsers';
import userIcon from '../../../../public/images/user-icon.jpg';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPosts } from '@/services/apiPosts';
import { storage } from '@/firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import toast from 'react-hot-toast';
import EditProfileModal from './modals/EditProfileModal';
import ProfilePhotoModal from './modals/ProfilePhotoModal';
import Loader from '@/components/ui/Loader';
import OwnFollowers from './modals/OwnFollowers';
import OthersFollowers from '../OthersProfile/modals/OthersFollowers';
import OwnFollowings from './modals/OwnFollowings';
import CreateStory from '@/components/StoryModal/CreateStory';

export default function ProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [openImageModal, setOpenImageModal] = useState(false);
    const [openFollowers, setOpenFollowers] = useState(false);
    const [openFollowings, setOpenFollowings] = useState(false);
    const [user, setUser] = useState<IUser | undefined>(undefined);
    const [openPostStoryModal, setOpenPostStoryModal] = useState(false);

    const { data: userData, error } = useQuery<IUser | undefined, Error>({
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

    useEffect(() => {
        if (userData) {
            setUser(userData); 
        }
    }, [userData]);

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

    const handleLogout = async () => {
        try {
            await userLogout();
            toast.success('Logged out successfully!');
            router.push('/login');
        } catch (error) {
            toast.error('Error logging out!');
        }
    };

    const toggleModal = () => {
        setOpenModal(!openModal);
    };

    const toggleImageModal = () => {
        setOpenImageModal(!openImageModal);
    };

    const handleUserUpdate = (updatedUser: IUser) => {
        setUser(updatedUser); 
    };

    const toggleFollowersModal = () => {
        setOpenFollowers(!openFollowers)
    }

    const toggleFollowingModal = () => {
        setOpenFollowings(!openFollowings)
    }

    const togglePostStoryModal = () => {
        setOpenPostStoryModal(!openPostStoryModal)
      }

    return (
        <div className={Style.profilePage}>
            <CreateStory onClose={togglePostStoryModal} isOpen={openPostStoryModal} />
            <ProfilePhotoModal isOpen={openImageModal} onClose={toggleImageModal} onUpdate={handleUserUpdate} user={user as IUser}/>
            <EditProfileModal isOpen={openModal} onClose={toggleModal} user={user as IUser} onUpdate={handleUserUpdate} />
            <OwnFollowers isOpen={openFollowers} onClose={toggleFollowersModal} user={user as IUser} sessionUser={user as IUser}/>
            <OwnFollowings isOpen={openFollowings} onClose={toggleFollowingModal}  user={user as IUser} sessionUser={user as IUser} />
            <div className={Style.profileContainer}>
                <div className={Style.profileInfoArea}>
                    <div className={Style.profileImage}>
                    <div className={Style.imageWrapper}>
                        <Image 
                            src={user?.profilePhoto || userIcon.src} 
                            alt={''} 
                            width={140} 
                            height={140} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    </div>
                        <div className={Style.addStoryBtn}>
                            <FaPlus onClick={togglePostStoryModal}/>
                        </div>
                        <button className={Style.updatePpBtn} onClick={toggleImageModal}>Update</button>
                    </div>
                    <div className={Style.userAccountInfo}>
                        <div className={Style.profileMenu}>
                            <p>@{user?.username}</p>
                            <button className={Style.btn} onClick={toggleModal}>Edit Profile</button>
                            <button className={Style.btn} onClick={handleLogout}>
                                <span><FaSignOutAlt /></span>Logout
                            </button>
                        </div>
                        <div className={Style.profileStats}>
                            <p>{user?.posts?.length} posts</p>
                            <p onClick={toggleFollowersModal} style={{cursor: 'pointer'}}>{user?.followers?.length} followers</p>
                            <p onClick={toggleFollowingModal} style={{cursor: 'pointer'}}>{user?.following?.length} follows</p>
                        </div>
                        <div className={Style.profileName}>
                            <p>{user?.name}</p>
                        </div>
                        <div className={Style.profileBio}>
                            <p>{user?.bio}</p>
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
                            <p style={{color: '#fff', fontFamily: 'var(--font-family-two)'}}>No posts available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
