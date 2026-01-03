import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Navbar } from './Navbar';
import { Feed } from './Feed';
import { Chat } from './Chat';
import { PairingView } from './PairingView';
import { ViewState, Message } from '../types';
import { connectSocket, getSocket } from '../services/socket';


export const Dashboard: React.FC = () => {
  const { currentUser, updateUserAvatar } = useAppContext(); // updateUserAvatar if needed
  const [view, setView] = useState<ViewState>(ViewState.FEED);
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize Socket when component mounts (and user is paired)
  useEffect(() => {
    const token = localStorage.getItem('authToken'); // Ensure this matches key in AppContext
    if (token && currentUser?.pairedWithUserId) {
      connectSocket(token);
    }
  }, [currentUser?.pairedWithUserId]);

  // Handle Socket Events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
      const incomingMsg: Message = {
        id: Math.random().toString(),
        senderId: msg.senderId || 'partner', 
        text: msg.text || msg.content,
        timestamp: new Date() // Ideally timestamp comes from server
      };
      setMessages(prev => [...prev, incomingMsg]);
    };

    socket.on('newChatMessage', handleNewMessage);
    return () => {
      socket.off('newChatMessage', handleNewMessage);
    };
  }, [currentUser?.pairedWithUserId]);

  const handleSendMessage = (text: string) => {
    const socket = getSocket();
    if (socket && currentUser) {
      socket.emit('clientAction', {
        type: 'SEND_MESSAGE',
        payload: {
          text,
          senderId: currentUser.id || currentUser._id, // Handle _id vs id inconsistency
          timestamp: Date.now()
        }
      });
    }
  };
  
  // Handling manual update of user context after pairing
  const onPairedSuccess = () => {
     window.location.reload(); // Simple reload to refresh context/socket, or create a refresh method in Context
  };

  // 1. If not paired, show Pairing View
  if (!currentUser?.pairedWithUserId) {
      return currentUser ? <PairingView user={currentUser} onPaired={onPairedSuccess} /> : null;
  }

  // 2. If paired, show Main Dashboard
  return (
    <div className="bg-black min-h-screen text-white selection:bg-nothing-red selection:text-white">
      <Navbar currentView={view} setView={setView} />
      
      <main className="w-full">
        {view === ViewState.FEED && <Feed onUserClick={() => setView(ViewState.CHAT)} />}
        
        {view === ViewState.CHAT && (
          <Chat 
            recipient={{ 
               id: currentUser.pairedWithUserId, 
               name: 'Partner', 
               handle: '@connected', 
               avatar: 'https://picsum.photos/200',
               email: 'partner@example.com' 
            }} 
            messages={messages} 
            onSendMessage={handleSendMessage}
          />
        )}
      </main>
    </div>
  );
};