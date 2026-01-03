import React from 'react';
import { ViewState } from '../types';
import { Ghost, Radio, Aperture } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center py-6 px-4 pointer-events-none">
      <div className="bg-glass-dark backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl pointer-events-auto transition-all duration-300 hover:border-nothing-red/50">
        
        <button 
          onClick={() => setView(ViewState.LANDING)}
          className={`flex items-center gap-2 transition-colors duration-300 ${currentView === ViewState.LANDING ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Aperture size={20} />
          <span className="hidden md:block font-mono text-xs tracking-widest uppercase">Index</span>
        </button>

        <div className="w-[1px] h-4 bg-zinc-800"></div>

        <button 
          onClick={() => setView(ViewState.FEED)}
          className={`flex items-center gap-2 transition-colors duration-300 ${currentView === ViewState.FEED ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Radio size={20} />
          <span className="hidden md:block font-mono text-xs tracking-widest uppercase">Feed</span>
        </button>

        <div className="w-[1px] h-4 bg-zinc-800"></div>

        <button 
          onClick={() => setView(ViewState.CHAT)}
          className={`group flex items-center gap-2 transition-colors duration-300 ${currentView === ViewState.CHAT ? 'text-nothing-red' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Ghost size={20} className="group-hover:animate-pulse" />
          <span className="hidden md:block font-mono text-xs tracking-widest uppercase">Signal</span>
        </button>
      </div>
    </nav>
  );
};