import { IStory } from "@/models/storyModel";
import { getSession } from "next-auth/react";


export async function getStories() {
    try {
        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/stories`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch stories");
        }

        return data.stories;
    } catch (error) {
        console.error('Error fetching stories:', error);
        throw error;
    }
}


export async function getStoriesByUser(userId: string): Promise<IStory[]> {
    try {
        const res = await fetch(`/api/stories/user/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch user's stories");
        }

        return data.stories as IStory[];
    } catch (error: any) {
        console.error('Error fetching user stories:', error.message);
        throw error;
    }
}


export async function getStoryById(storyId: string) {
    try {
        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/stories/${storyId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch story");
        }

        return data;
    } catch (error) {
        console.error('Error fetching story:', error);
        throw error;
    }
}


export async function createStory(newStory: { text?: string; image?: string }) {
    try {
        const session = await getSession();
        if (!session || !session.user || !session.user.email) {
            throw new Error('User not authenticated');
        }

        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/stories`, {
            method: "POST",
            body: JSON.stringify({
                ...newStory,
                user: session.user.email 
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to create story");
        }

        return data;
    } catch (error) {
        console.error('Error creating story:', error);
        throw error;
    }
}


export async function deleteStory(storyId: string) {
    try {
        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/stories/${storyId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to delete story");
        }

        return data;
    } catch (error) {
        console.error('Error deleting story:', error);
        throw error;
    }
}
