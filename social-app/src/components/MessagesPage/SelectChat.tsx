'use client';

import React, { useEffect, useState } from 'react';
import Style from './messagespage.module.css';
import Image from 'next/image';
import { IChat } from '@/models/chatModel';
import { deleteChat, getChatById, getChats } from '@/services/apiChats';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { requestUser } from '@/services/apiUsers';
import { IUser } from '@/models/userModel';
import mongoose, { Types } from 'mongoose';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '../ui/Loader';

export default function SelectChat() {
  const { data: session } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<IChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<IUser | undefined>(undefined);

   const currentUserId = user?._id;

   const { chatId } = useParams();
   const [chat, setChat] = useState<IChat | null>(null);

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
    const fetchChats = async () => {
      setLoading(true); 
      try {
        const chatsData = await getChats();
        setChats(chatsData);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchChats();
  }, []);

  console.log(chats);

  const fetchChat = async () => {
    if (chatId) {
      try {
        const chatData = await getChatById(chatId as string);
        setChat(chatData);
      } catch (error) {
        console.error('Error fetching chat:', error);
      }
    }
  }

  useEffect(() => {
    fetchChat();
  }, [chatId]);

  console.log(chat);

  const deleteChatHandler = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      setChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  return (
    <div className={Style.messagesPage}>
      <div className={Style.allChatsArea}>
        <h3>Messages</h3>
        {loading ? (
          <Loader />
        ) : (
          chats.map((chat) => {
          
            const participants = chat.participants.filter((participant): participant is IUser => {
              return typeof participant !== 'string' && participant._id.toString() !== currentUserId?.toString();
            });

            return (
              <div className={Style.chatUser} key={chat._id.toString()}>
                {participants.map((participant) => (
                  <div className={Style.chatUserImage} key={participant._id.toString()}>
                    <Image
                      src={participant.profilePhoto || ''} 
                      alt={participant.username || 'User'} 
                      width={45}
                      height={45}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                ))}
                <div className={Style.chatUserInfo}>
                  {participants.map((participant) => (
                    <p className={Style.chatUsername} key={participant._id.toString()}>
                      <Link href={`/chats/${chat._id}`}>@{participant.username}</Link>
                    </p>
                  ))}
                  <p className={Style.lastMessage}>{chat.lastMessage}</p> 
                  <button onClick={() => deleteChatHandler(chat._id)} className={Style.deleteChat}>X</button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className={Style.chatArea}>
        <div className={Style.selectChatText}>
          <h2>Select Chat</h2>
        </div>
      </div>
    </div>
  );
}
