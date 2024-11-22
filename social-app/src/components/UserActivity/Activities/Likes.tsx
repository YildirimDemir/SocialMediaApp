"use client";

import React from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Style from '../useractivity.module.css'
import { getPostById } from '@/services/apiPosts'; 
import { requestUser } from '@/services/apiUsers'; 
import { IPost } from '@/models/postModel';
import { useRouter } from 'next/navigation';
import { FaHeart, FaRegComment } from 'react-icons/fa';
import Loader from '@/components/ui/Loader';


export default function Likes() {
    const { data: session } = useSession();
    const router = useRouter();

    const { data: user, isLoading: userLoading, error: userError } = useQuery({
        queryKey: ['request-user', session?.user?.email],
        queryFn: async () => {
            if (!session?.user?.email) {
                throw new Error('No email found in session');
            }
            return await requestUser(session.user.email);
        }
    });

    const { data: posts, isLoading: postsLoading, error: postsError } = useQuery({
        queryKey: ['likedPosts', user?.likes],
        queryFn: async () => {
            if (!user?.likes || user.likes.length === 0) {
                return [];
            }
            const postFetchPromises = (user.likes as string[]).map(id => getPostById(id));
            return Promise.all(postFetchPromises);
        }
    });

    const handlePostClick = (postId: string) => {
      router.push(`/p/${postId}`);
    };

    if (userLoading || postsLoading) return <Loader />;
    if (userError) return <div>Error loading user: {userError.message}</div>;
    if (postsError) return <div>Error loading liked posts: {postsError.message}</div>;

    return (
        <div className={Style.likesArea}>
            <h2>Liked Posts</h2>
            {posts && posts.length > 0 ? (
                <div className={Style.likes}>
                    {posts.map((post: IPost) => (
                    <a
                    key={typeof post._id === 'string' ? post._id : undefined}
                    href={`${process.env.WEBSITE_API_URL}/p/${post._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={Style.likeBox}
                >
                    <div className={Style.imageContainer}>
                        <Image
                            src={post.image}
                            alt={post.content}
                            layout="fill"
                            objectFit="cover"
                            className={Style.postImage}
                        />
                    </div>

                    <div className={Style.overlay}>
                <div className={Style.iconContainer}>
                  <FaHeart className={Style.icon} />
                  <span>{post.likes?.length}</span>
                </div>
                <div className={Style.iconContainer}>
                  <FaRegComment className={Style.icon} />
                  <span>{post.comments?.length}</span>
                </div>
              </div>


                </a>                
                    ))}
                </div>
            ) : (
                <p>No liked posts yet.</p>
            )}
        </div>
    );
}
