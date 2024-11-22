import { IMessage } from '@/models/messageModel';

export async function sendMessage(chatId: string, text?: string, image?: string): Promise<IMessage> {
  try {
    const response = await fetch(`/api/messages/${chatId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, image }), 
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const message: IMessage = await response.json();
    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function getMessages(chatId: string): Promise<IMessage[]> {
  try {
    const response = await fetch(`/api/messages/${chatId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const messages: IMessage[] = await response.json();
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

export async function deleteMessage(chatId: string, messageId: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`/api/messages/${chatId}/${messageId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete message');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}