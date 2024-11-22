"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Style from '../useractivity.module.css';
import { requestUser } from '@/services/apiUsers'; 
import { getCommentById } from '@/services/apiComments'; 
import { IComment } from '@/models/commentModel';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';

export default function Comments() {
    const { data: session } = useSession();


    const { data: user, isLoading: userLoading, error: userError } = useQuery({
        queryKey: ['request-user', session?.user?.email],
        queryFn: async () => {
            if (!session?.user?.email) {
                throw new Error('No email found in session');
            }
            return await requestUser(session.user.email);
        }
    });


    const { data: comments, isLoading: commentsLoading, error: commentsError } = useQuery({
        queryKey: ['userComments', user?.comments],
        queryFn: async () => {
            if (!user?.comments || user.comments.length === 0) {
                return [];
            }
            const commentFetchPromises = (user.comments as string[]).map(id => getCommentById(id));
            return Promise.all(commentFetchPromises);
        }
    });

    if (userLoading || commentsLoading) return <Loader />;
    if (userError) return <div>Error loading user: {userError.message}</div>;
    if (commentsError) return <div>Error loading comments: {commentsError.message}</div>;
    console.log('Fetched Comments:', comments);


    return (
        <div className={Style.commentsArea}>
            <h2>Your Comments</h2>
            {comments && comments.length > 0 ? (
                <div className={Style.comments}>
                    {comments.map((comment: IComment) => (
                        <div key={typeof comment._id === 'string' ? comment._id : undefined} className={Style.commentBox}>
                            <p>
                                <Link 
                                    href={`/p/${comment.post}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {'<<View Post>>'}
                                </Link>
                            </p>
                            <p>{new Date(comment.createdAt).toLocaleString()}</p>
                            <p className={Style.commentText}>: {comment.text}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No comments yet.</p>
            )}
        </div>
    );
}
