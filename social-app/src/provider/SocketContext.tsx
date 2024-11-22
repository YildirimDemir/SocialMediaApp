
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';


interface SocketContextType {
  socket: Socket | null;
}


interface SocketContextProviderProps {
  children: ReactNode;
  currentUser: { id: string } | null; 
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketContextProvider = ({ children, currentUser }: SocketContextProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {

    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);

    return () => {
      newSocket.close(); 
    };
  }, []);

  useEffect(() => {
    if (currentUser && socket) {
      socket.emit("newUser", currentUser.id); 
    }
  }, [currentUser, socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketContextProvider");
  }
  return context.socket;
};
