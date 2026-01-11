import React, { useState } from 'react';
import { ViewState } from '../types';
import { Ghost, Radio, LogOut, MessageSquarePlus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { FeedbackModal } from './FeedbackModal';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const { logout } = useAppContext();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center py-6 px-4 pointer-events-none">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl pointer-events-auto transition-all duration-300 hover:border-nothing-red/50">
          
          {/* VIEW: FEED */}
          <button 
            onClick={() => setView(ViewState.FEED)}
            className={`flex items-center gap-2 transition-colors duration-300 ${currentView === ViewState.FEED ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Radio size={20} />
            <span className="hidden md:block font-mono text-xs tracking-widest uppercase">Feed</span>
          </button>

          <div className="w-[1px] h-4 bg-zinc-800"></div>

          {/* VIEW: CHAT */}
          <button 
            onClick={() => setView(ViewState.CHAT)}
            className={`group flex items-center gap-2 transition-colors duration-300 ${currentView === ViewState.CHAT ? 'text-nothing-red' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Ghost size={20} className="group-hover:animate-pulse" />
            <span className="hidden md:block font-mono text-xs tracking-widest uppercase">Signal</span>
          </button>

          <div className="w-[1px] h-4 bg-zinc-800"></div>

          {/* ACTION: FEEDBACK */}
          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors duration-300"
            title="Send Feedback"
          >
            <MessageSquarePlus size={20} />
          </button>

          {/* ACTION: LOGOUT */}
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors duration-300"
            title="Disconnect"
          >
            <LogOut size={20} />
          </button>

        </div>
      </nav>

      {/* Render Modal outside the nav container */}
      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </>
  );
};