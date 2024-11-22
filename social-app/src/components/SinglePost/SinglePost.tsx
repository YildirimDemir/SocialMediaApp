'use client';

import React, { useEffect, useState } from 'react';
import Style from './singlepost.module.css';
import Image from 'next/image';
import { FaComment, FaHeart, FaLink, FaShare } from 'react-icons/fa';
import { deletePost, getPostById } from '@/services/apiPosts';
import { useParams, useRouter } from 'next/navigation';
import userIcon from '../../../public/images/user-icon.jpg';
import { getSession } from 'next-auth/react';
import { requestUser, toggleLike, toggleFollow } from '@/services/apiUsers';
import { createComment, deleteComment } from '@/services/apiComments';
import EditPost from './modals/EditPost';
import SinglePostMenu from './modals/SinglePostMenu';
import toast from 'react-hot-toast';
import calculateTimeAgo from '@/lib/calculateTimeAgo';

export default function SinglePost() {
    const [post, setPost] = useState<any>(null);
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [userSession, setUserSession] = useState<any>(null);
    const [newComment, setNewComment] = useState('');
    const { postId } = useParams();
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [openMenuModal, setOpenMenuModal] = useState<boolean>(false)
    const [isEditPostOpen, setIsEditPostOpen] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    const fetchPost = async () => {
        if (postId) {
            try {
                const postData = await getPostById(postId as string);
                setPost(postData);
            } catch (error) {
                console.error('Error fetching post:', error);
            }
        }
    };

    const fetchUserSession = async () => {
        try {
            const session = await getSession();
            if (!session?.user?.email) throw new Error('User email not found');

            const user = await requestUser(session.user.email);
            setUserSession(user);

          
            if (post && user) {
                const isCurrentlyFollowing = user.following.includes(post.author._id);
                setIsFollowing(isCurrentlyFollowing);
            }
        } catch (error) {
            console.error('Error fetching user session:', error);
        }
    };

    useEffect(() => {
        fetchPost();
        fetchUserSession();
    }, [postId]);

    useEffect(() => {
       
        if (post && userSession) {
            const isCurrentlyFollowing = userSession.following.includes(post.author._id);
            setIsFollowing(isCurrentlyFollowing);
        }
    }, [post, userSession]);

    if (!post) {
        return <div>Loading...</div>;
    }

    const handleLikeToggle = async () => {
        if (!userSession) {
            setError('You must be logged in to like a post.');
            return;
        }
    
        try {
            const id = Array.isArray(postId) ? postId[0] : postId;
            const isLiked = post.likes.includes(userSession._id);
            const updatedUser = await toggleLike(userSession._id, id, isLiked ? 'remove' : 'add');
    
            setPost((prevPost: any) => {
                if (!prevPost) return prevPost;
    
                const updatedLikes = isLiked
                    ? prevPost.likes.filter((like: string) => like !== userSession._id)
                    : [...prevPost.likes, userSession._id];
    
                return {
                    ...prevPost,
                    likes: updatedLikes,
                };
            });
    
            setError(null);
        } catch (error) {
            console.error('Failed to toggle like:', error);
            setError('Failed to toggle like');
        }
    };

    const handleFollowToggle = async () => {
        if (!userSession) {
            setError('You must be logged in to follow a user.');
            return;
        }

        try {
            const action = isFollowing ? 'remove' : 'add';
            await toggleFollow(userSession._id, post.author._id, action);
            
            // UI güncelle
            setIsFollowing(prev => !prev);
        } catch (error) {
            console.error('Failed to toggle follow:', error);
            setError('Failed to toggle follow');
        }
    };

    const handleAuthorClick = () => {
        if (userSession?._id === post.author._id) {
            router.push('/profile'); 
        } else {
            router.push(`/${post.author._id}`); 
        }
    };
    const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewComment(event.target.value);
    };

    const handleCommentSubmit = async () => {
        if (!userSession) {
            setError('You must be logged in to comment.');
            return;
        }

        if (newComment.trim() === '') {
            setError('Comment cannot be empty.');
            return;
        }

        try {
            const id = Array.isArray(postId) ? postId[0] : postId;
            const addedComment = await createComment(id as string, newComment);

            setPost((prevPost: any) => {
                if (!prevPost) return prevPost;
                return {
                    ...prevPost,
                    comments: [...prevPost.comments, addedComment],
                };
            });

            setNewComment('');
            setError(null);
        } catch (error) {
            console.error('Failed to create comment:', error);
            setError('Failed to add comment');
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteComment(commentId);

            setPost((prevPost: any) => {
                if (!prevPost) return prevPost;
                return {
                    ...prevPost,
                    comments: prevPost.comments.filter((comment: any) => comment._id !== commentId),
                };
            });
        } catch (error) {
            console.error('Failed to delete comment:', error);
            setError('Failed to delete comment');
        }
    };

    const toggleMenuModal = () => {
        setOpenMenuModal(prevOpen => !prevOpen);
    };
    
    const toggleEditPostModal = () => {
        setIsEditPostOpen(prevOpen => !prevOpen);
    };

    const handleUpdatePost = (updatedPost: any) => {
        setPost((prevPost: any) => ({
          ...prevPost,
          ...updatedPost,
        }));
      };

    const handleDeletePost = async () => {
        try {
            await deletePost(post._id);
            toast.success('Post deleted successfully');
            router.push('/profile')
            console.log('Post deleted');
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };


    const handleCopyLink = async () => {
        try {
            const postUrl = `${process.env.WEBSITE_API_URL}/p/${post._id}`;
            await navigator.clipboard.writeText(postUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000); 
        } catch (error) {
            console.error('Failed to copy link:', error);
            setError('Failed to copy link');
        }
    };    
    
    return (
        <div className={Style.singlePostArea}>

           <SinglePostMenu 
                isOpen={openMenuModal} 
                onClose={toggleMenuModal} 
                onEdit={toggleEditPostModal} 
                onDelete={handleDeletePost}
            />
            <EditPost 
                isOpen={isEditPostOpen} 
                onClose={toggleEditPostModal} 
                post={post}
                onUpdate={handleUpdatePost} 
            />

            <div className={Style.singlePostBox}>
                <div className={Style.postDetailArea}>
                    <div className={Style.postBox}>
                        <div className={Style.authorInfo}>
                            <div className={Style.author}>
                                <Image
                                    alt={post.author.username}
                                    src={post.author.profilePhoto}
                                    height={33}
                                    width={33}
                                    style={{ borderRadius: '50%', objectFit: 'cover', marginRight: '8px' }} 
                                />
                                <p className={Style.username} onClick={handleAuthorClick}>@{post.author.username}</p>
                                {userSession?._id !== post.author._id && (
                                    <button className={Style.followBtn} onClick={handleFollowToggle}>
                                        {isFollowing ? 'Unfollow' : 'Follow'}
                                    </button>
                                )}
                            </div>
                            {userSession?._id === post.author._id && (
                              <button className={Style.postMore} onClick={toggleMenuModal}>
                                ● ● ●
                              </button>
                            )}
                        </div>
                        <div className={Style.imageArea}>
                            {post.image ? (
                                <Image
                                    src={post.image}
                                    alt="Post image"
                                    width={800}
                                    height={600} 
                                    className={Style.postImage} 
                                    style={{ objectFit: 'cover' }} 
                                />
                            ) : (
                                <p>No Image</p> 
                            )}
                        </div>
                        <div className={Style.postContent}>
                            <div className={Style.postStats}>
                                <div className={Style.postStat} onClick={handleLikeToggle}>
                                    <FaHeart className={post.likes.includes(userSession?._id) ? Style.likedIcon : Style.icon} />
                                    <p>{post.likes.length}</p>
                                </div>
                                <div className={Style.postStat}>
                                    <FaComment className={Style.icon} />
                                    <p>{post.comments.length}</p>
                                </div>
                                <div className={Style.postStat}>
                                <FaLink className={Style.icon} onClick={handleCopyLink} />
                                     <p className={Style.linkText}>
                                         {copied ? 'Copied' : 'Link'}
                                     </p>
                                </div>
                            </div>
                            <div className={Style.postText}>
                                <p>
                                    <span className={Style.postContentUsername}>@{post.author.username}</span>
                                    {post.content}
                                </p>
                            </div>
                            <div className={Style.publishDate}>
                                <p>{calculateTimeAgo(post.createdAt)}</p>
                            </div>
                            <div className={Style.commentsArea}>
                                <div className={Style.addComment}>
                                    {userSession ? (
                                        <>
                                            <input
                                                type="text"
                                                placeholder="Write your comment..."
                                                value={newComment}
                                                onChange={handleCommentChange}
                                            />
                                            <button onClick={handleCommentSubmit}>Send</button>
                                        </>
                                    ) : (
                                        <p>You must be logged in to comment.</p>
                                    )}
                                </div>
                                <div className={Style.postsComments}>
                                 {post?.comments?.length ? (
                                  post.comments.map((comment: any) => (
                                    <div key={comment._id} className={Style.commentBox}>
                                      <div className={Style.commentHeader}>
                                         <span>@{comment.user?.username || 'Unknown'}</span>
                                         {userSession?._id === comment.user?._id && (
                                           <button onClick={() => handleDeleteComment(comment._id)}>X</button>
                                         )}
                                       </div>
                                       <p className={Style.commentText}>{comment.text || 'No Comment Text'}</p>
                                     </div>
                                   ))
                                 ) : (
                                   <p>No comments yet</p>
                                 )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {error && <p className={Style.error}>{error}</p>}
            </div>
        </div>
    );
}
