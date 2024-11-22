'use client';

import React, { useEffect, useRef, useState } from 'react';
import Style from './messagespage.module.css';
import Image from 'next/image';
import { IChat } from '@/models/chatModel';
import { getChatById, getChats } from '@/services/apiChats';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { requestUser } from '@/services/apiUsers';
import { IUser } from '@/models/userModel';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { sendMessage, deleteMessage, getMessages } from '@/services/apiMessages';
import { IMessage } from '@/models/messageModel';
import { useSocket } from '@/provider/SocketContext';
import Loader from '../ui/Loader';
import { FaPaperclip } from 'react-icons/fa';
import { uploadFile } from '@/services/apiUpload';

export default function MessagesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<IChat[]>([]);
  const [chat, setChat] = useState<IChat | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<IUser | undefined>(undefined);
  const [messages, setMessages] = useState<IMessage[]>([]); 
  const [newMessage, setNewMessage] = useState('');

  const [image, setImage] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null); 

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setImage(file);
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click(); 
  };
  
  const { chatId } = useParams();
  const socket  = useSocket(); 

  const { data: userData } = useQuery<IUser | undefined, Error>({
    queryKey: ["request-user", session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) throw new Error("No email found in session");
      return await requestUser(session.user.email);
    },
    initialData: session?.user as IUser | undefined,
  });

  useEffect(() => {
    if (userData) setUser(userData);
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


  useEffect(() => {
    const fetchSingleChat = async () => {
      if (chatId && typeof chatId === 'string') {
        try {
          const chatData = await getChatById(chatId);
          setChat(chatData); 
          console.log("Fetched Chat by ID:", chatData);
        } catch (error) {
          console.error("Error fetching chat by ID:", error);
        }
      }
    };
  
    fetchSingleChat();
  }, [chatId]);
  

  const fetchChatMessages = async () => {
    if (chatId && typeof chatId === 'string') {
      try {
        const messagesData = await getMessages(chatId);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }
  };

  useEffect(() => {
    fetchChatMessages();
  }, [chatId]);

  useEffect(() => {
    if (socket && chatId && typeof chatId === 'string') {
      socket.emit("join_chat", chatId);

      socket.on("receive_message", (message: IMessage) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
      socket.on("message_deleted", (messageId: string) => { 
        setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
      });
    }

    return () => {
      if (socket) {
        socket.off("receive_message");
        socket.off("message_deleted")
      }
    };
  }, [socket, chatId]);
  

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      if (chatId && typeof chatId === 'string') {
        let imageUrl = '';
        if (image) {
          imageUrl = await uploadFile(image);
        }
       
        const message = await sendMessage(chatId, newMessage, imageUrl); 

        
        if (socket) {
          socket.emit("send_message", chatId, message);
        }

        console.log(`IMAGE: ${message.image}`)

       
        fetchChatMessages();

        setImage(null)

        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      if (chatId && typeof chatId === 'string') {
        await deleteMessage(chatId, messageId);
        if(socket){
          socket.emit("delete_message", chatId, messageId)
        }
        setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
        fetchChatMessages();
        console.log(`Chat: ${chatId} - Message deleted event received for messageId: ${messageId}`);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  useEffect(() => {
    const chatArea = document.getElementById('chatMessagesArea');
    if (chatArea) {
      chatArea.scrollTop = chatArea.scrollHeight;
    }
  }, [messages]);

  const truncateMessage = (message: string | undefined, maxLetters: number): string => {
    if (!message) return '';
    let letterCount = 0;
    let truncatedMessage = '';
  
    for (const char of message) {
      if (/[a-zA-ZğüşöçıİĞÜŞÖÇ]/.test(char)) { 
        letterCount++;
      }
      truncatedMessage += char;
  
      if (letterCount >= maxLetters) {
        return truncatedMessage + '...';
      }
    }
  
    return truncatedMessage;
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
              return typeof participant !== 'string' && participant._id.toString() !== user?._id?.toString();
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
                  <p className={Style.lastMessage}>
                    {truncateMessage(chat?.lastMessage, 25)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className={Style.chatArea}>
      <div className={Style.messagingUser}>
  <div className={Style.messagingUserImage}>
    {chat?.participants
      ?.filter((participant): participant is IUser => {
        return typeof participant !== 'string' && participant._id !== user?._id;
      })
      .map((participant) => (
        <Image
          key={participant._id.toString()}
          src={participant.profilePhoto || '/default-profile.png'}
          alt={participant.username || 'User'}
          width={45}
          height={45}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ))}
  </div>
  <div className={Style.messagingUserInfo}>
    {chat?.participants
      ?.filter((participant): participant is IUser => {
        return typeof participant !== 'string' && participant._id !== user?._id;
      })
      .map((participant) => (
        <p className={Style.messagingUsername} key={participant._id.toString()}>
          <Link href={`/${participant._id}`}>@{participant.username}</Link>
        </p>
      ))}
    <button className={Style.deleteChatBtn}>X</button>
  </div>
</div>

        <div className={Style.chatsMessagesArea} id="chatMessagesArea">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message?._id?.toString()}
                className={`${Style.message} ${message?.sender?._id?.toString() === user?._id?.toString() ? Style.sentMessage : Style.receivedMessage}`}
              >
                {message?.image ? (<img className={Style.messageImage} src={message.image} alt="" />) : ('')}
                {message?.text ? (<p>{message.text}</p>) : ('')}
                {message?.sender?._id?.toString() === user?._id?.toString() && (
                  <button className={Style.deleteButton} onClick={() => handleDeleteMessage(message._id.toString())}>
                    X
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className={Style.noMessagingText}>No Chats</p>
          )}
        </div>
        <div className={Style.inputArea}>
          <div className={Style.imageUpload} onClick={handleImageClick}>
            <span> <FaPaperclip/> </span>
            <input
             ref={imageInputRef}
             type="file"
             id='image'
             style={{ display: 'none' }} 
             onChange={handleImageChange}
           />
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
