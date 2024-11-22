import { getSession } from "next-auth/react";

export async function createComment(postId: string, text: string) {
    try {
        const session = await getSession();
        if (!session || !session.user || !session.user.email) {
            throw new Error('User not authenticated');
        }

        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/comments`, {
            method: "POST",
            body: JSON.stringify({ postId, text }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.user.email}`
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to create comment");
        }

        return data;
    } catch (error) {
        throw error;
    }
}

export async function getCommentById(commentId: string) {
    try {
        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/comments/${commentId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch comment");
        }

        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching comment:', error.message);
        } else {
            console.error('An unknown error occurred');
        }
        throw error;
    }
}


export async function fetchCommentsByPostId(postId: string) {
    try {
        const session = await getSession();
        if (!session || !session.user || !session.user.email) {
            throw new Error('User not authenticated');
        }

        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/comments/${postId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.user.email}` 
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch comments");
        }

        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching comments:', error.message);
        } else {
            console.error('An unknown error occurred');
        }
        throw error;
    }
}

export async function deleteComment(commentId: string) {
    try {
        const session = await getSession();
        if (!session || !session.user || !session.user.email) {
            throw new Error('User not authenticated');
        }

        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/comments/${commentId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.user.email}`
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to delete comment");
        }

        return data;
    } catch (error) {
        throw error;
    }
}
