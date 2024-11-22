'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Style from './postsarea.module.css'
import Image from 'next/image';
import { FaComment, FaHeart, FaLink, FaShare } from 'react-icons/fa';
import { getPostsOfFollowedUsers } from '@/services/apiPosts'; 
import userIcon from '../../../public/images/user-icon.jpg';
import { getSession } from 'next-auth/react';
import { requestUser, toggleLike, toggleFollow } from '@/services/apiUsers';
import { createComment, deleteComment } from '@/services/apiComments';
import calculateTimeAgo from '@/lib/calculateTimeAgo';
import Loader from '../ui/Loader';

export default function PostsArea() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [userSession, setUserSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  const [isFollowing, setIsFollowing] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchPosts = async () => {
    if (userSession) {
      try {
        const fetchedPosts = await getPostsOfFollowedUsers(userSession._id);
        setPosts(fetchedPosts);
        console.log('Fetched Posts:', fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to fetch posts');
      }
    }
  };


  const fetchUserSession = async () => {
    try {
      const session = await getSession();
      if (!session?.user?.email) throw new Error('User email not found');

      const user = await requestUser(session.user.email);
      setUserSession(user);
    } catch (error) {
      console.error('Error fetching user session:', error);
    }
  };

  useEffect(() => {
    fetchUserSession();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [userSession]);

  if (!posts.length) {
    return <Loader />;
  }

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    if (!userSession) {
      setError('You must be logged in to like a post.');
      return;
    }

    try {
      const updatedUser = await toggleLike(userSession._id, postId, isLiked ? 'remove' : 'add');
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, likes: isLiked
                ? post.likes.filter((id: string) => id !== userSession._id)
                : [...post.likes, userSession._id]
              }
            : post
        )
      );
      setError(null);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      setError('Failed to toggle like');
    }
  };


  const handleFollowToggle = async (authorId: string) => {
    if (!userSession) {
      setError('You must be logged in to follow a user.');
      return;
    }

    try {
      const action = isFollowing ? 'remove' : 'add';
      await toggleFollow(userSession._id, authorId, action);
      

      setIsFollowing(prev => !prev);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      setError('Failed to toggle follow');
    }
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(event.target.value);
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!userSession) {
      setError('You must be logged in to comment.');
      return;
    }

    if (newComment.trim() === '') {
      setError('Comment cannot be empty.');
      return;
    }

    try {
      const addedComment = await createComment(postId, newComment);

      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, addedComment],
            };
          }
          return post;
        });
      });

      setNewComment('');
      setError(null);
    } catch (error) {
      console.error('Failed to create comment:', error);
      setError('Failed to add comment');
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await deleteComment(commentId);

      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: post.comments.filter((comment: any) => comment._id !== commentId),
            };
          }
          return post;
        });
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setError('Failed to delete comment');
    }
  };

  const handleAuthorClick = (authorId: string) => {
    router.push(`/${authorId}`); 
  };

  const handleCopyLink = async (postId: string) => {
    try {
        const postUrl = `${process.env.WEBSITE_API_URL}/p/${postId}`;
        await navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000); 
    } catch (error) {
        console.error('Failed to copy link:', error);
        setError('Failed to copy link');
    }
};    

  return (
    <div className={Style.postsArea}>
      {error && <div className={Style.error}>{error}</div>}
      {posts.map((post) => (
        <div key={post._id} className={Style.singlePostBox}>
          <div className={Style.postDetailArea}>
            <div className={Style.postBox}>
              <div className={Style.authorInfo}>
                <div className={Style.author}>
                  <Image
                    alt={post.author.username}
                    src={post.author.profilePhoto || userIcon} 
                    height={33}
                    width={33}
                    style={{ borderRadius: '50%', objectFit: 'cover', marginRight: '8px' }} 
                  />
                  <p className={Style.username} onClick={() => handleAuthorClick(post.author._id)}>
                    @{post.author.username}
                  </p>
                  {userSession?._id !== post.author._id && ( 
                    <button className={Style.followBtn} onClick={() => handleFollowToggle(post.author._id)}>
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
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
                  <div className={Style.postStat} onClick={() => handleLikeToggle(post._id, post.likes.includes(userSession?._id))}>
                    <FaHeart className={post.likes.includes(userSession?._id) ? Style.likedIcon : Style.icon} />
                    <p>{post.likes.length}</p>
                  </div>
                  <div className={Style.postStat}>
                    <FaComment className={Style.icon} />
                    <p>{post.comments.length}</p>
                  </div>
                  <div className={Style.postStat}>
                     <FaLink className={Style.icon} onClick={() => handleCopyLink(post._id)} />
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
                        <button onClick={() => handleCommentSubmit(post._id)}>Share</button> 
                      </>
                    ) : (
                      <p>Login to share a comment</p>
                    )}
                  </div>
                  <div className={Style.postsComments}>
                    {post?.comments?.length ? (
                     post.comments.map((comment: any) => (
                       <div key={comment._id} className={Style.commentBox}>
                         <div className={Style.commentHeader}>
                            <span>@{comment.user?.username || 'Unknown'}</span>
                            {userSession?._id === comment.user?._id && (
                              <button onClick={() => handleDeleteComment(post._id, comment._id)}>X</button>
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
        </div>
      ))}
    </div>
  );
}
