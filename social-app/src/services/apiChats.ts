import { IChat } from "@/models/chatModel";
import { getSession } from "next-auth/react";


export async function getChats(): Promise<IChat[]> {
    try {

        const session = await getSession();

        
        if (!session || !session.user || !session.user.email) {
            throw new Error("User not logged in");
        }

        const res = await fetch('/api/chats', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch chats");
        }

        return data;
    } catch (error) {
        console.error('Error fetching chats:', error);
        throw error;
    }
}




export async function getChatById(chatId: string) {
    try {
        const session = await getSession();
        if (!session || !session.user || !session.user.email) {
            throw new Error('User not authenticated');
        }

        const res = await fetch(`/api/chats/${chatId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch chat");
        }

        return data;
    } catch (error) {
        console.error('Error fetching chat:', error);
        throw error;
    }
}


export async function createChat(participants: string[]) {
    try {
        const session = await getSession();
        if (!session || !session.user || !session.user.email) {
            throw new Error('User not authenticated');
        }

        const res = await fetch('/api/chats', {
            method: "POST",
            body: JSON.stringify({ participants }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to create chat");
        }

        return data;
    } catch (error) {
        console.error('Error creating chat:', error);
        throw error;
    }
}


export async function deleteChat(chatId: string) {
    try {
        const session = await getSession();
        if (!session || !session.user || !session.user.email) {
            throw new Error('User not authenticated');
        }

        console.log('Attempting to delete chat with ID:', chatId); 

        const res = await fetch(`/api/chats/${chatId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to delete chat");
        }

        return data;
    } catch (error) {
        console.error('Error deleting chat:', error);
        throw error;
    }
}



type Participants = string[];


export async function checkExistingChat(participants: Participants): Promise<IChat | null> {
  try {
    const sortedParticipants = participants.sort(); 
    const res = await fetch(`/api/chats/check`, {
      method: "POST",
      body: JSON.stringify({ participants: sortedParticipants }),
      headers: {
      "Content-Type": "application/json",
     },
    });

    const data = await res.json();

    if (res.ok && data.chat) {
      return data.chat as IChat; 
    }
    return null; 
  } catch (error) {
    console.error('Error checking existing chat:', error);
    return null;
  }
}