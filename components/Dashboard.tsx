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
    const token = localStorage.getItem('token');// Ensure this matches key in AppContext
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
        timestamp: new Date()
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
     window.location.reload(); // Simple reload to refresh context/socket
  };

  // 1. If not paired, show Pairing View
  if (!currentUser?.pairedWithUserId) {
      // We wrap PairingView in the aesthetic container just in case it's transparent
      return (
        <div className="relative min-h-screen w-full bg-black text-white selection:bg-red-500/30 selection:text-red-200 overflow-hidden">
             {/* Background Texture */}
             <div className="fixed inset-0 z-[1] opacity-[0.04] pointer-events-none mix-blend-overlay" 
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
             </div>
             {/* Content */}
             {currentUser ? <PairingView user={currentUser} onPaired={onPairedSuccess} /> : null}
        </div>
      );
  }

  // 2. If paired, show Main Dashboard
  return (
    <div className="relative min-h-screen w-full bg-black text-white selection:bg-red-500/30 selection:text-red-200 overflow-x-hidden">
      
      {/* 1. Global Noise Texture */}
      <div className="fixed inset-0 z-[1] opacity-[0.03] pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* 2. Ambient Background (Subtle for Dashboard) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-zinc-800/10 blur-[120px] rounded-full animate-pulse duration-[10s]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-red-900/05 blur-[150px] rounded-full" />
      </div>

      {/* Dot Matrix Overlay */}
      <div className="fixed inset-0 dot-matrix opacity-[0.02] z-0 pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar currentView={view} setView={setView} />
          
          <main className="flex-1 w-full max-w-7xl mx-auto">
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
    </div>
  );
};