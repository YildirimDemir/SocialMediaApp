import { IPost } from "@/models/postModel";
import { getSession } from "next-auth/react";

export async function getPosts() {
    try {
        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/posts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch posts");
        }

        return data.posts;
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
}


export async function getPostsOfFollowedUsers(userId: string): Promise<IPost[]> {
    try {
      const res = await fetch(`/api/posts/followed?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch posts");
      }
  
      return data.posts as IPost[]; 
    } catch (error: any) {
      console.error('Error fetching posts of followed users:', error.message);
      throw error; 
    }
  }
  
  
  




export async function getPostById(id: string) {
    try {
        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/posts/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch post");
        }

        return data;
    } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
    }
}

export async function createPost(newPost: { content: string; image: string; category: string }) {
    try {
        const session = await getSession();
        if (!session || !session.user || !session.user.email) {
            throw new Error('User not authenticated');
        }

        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/posts`, {
            method: "POST",
            body: JSON.stringify({
                ...newPost,
                author: session.user.email 
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to create post");
        }

        return data;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

export async function updatePost(id: string, updatedData: { title?: string; content?: string; image?: string; category?: string }) {
    try {
        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/posts/${id}`, {
            method: "PATCH",
            body: JSON.stringify(updatedData),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to update post");
        }

        return data;
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }
}

export async function deletePost(id: string) {
    try {
        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/posts/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to delete post");
        }

        return data;
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
}