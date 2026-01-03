import React from 'react';
import { Reveal } from './Reveal';
import { ArrowRight } from 'lucide-react';
import { ViewState } from '../types';

interface LandingProps {
  onEnter: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onEnter }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start overflow-hidden bg-black pb-24">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nothing-red blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-900 blur-[150px] rounded-full opacity-50"></div>
      </div>

      <div className="absolute inset-0 dot-matrix opacity-10 z-0 pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center text-center px-4">
        <Reveal>
          <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-600">
            BLUR<span className="text-nothing-red">.</span>
          </h1>
        </Reveal>
        
        <Reveal delay={0.2}>
          <p className="text-xl md:text-3xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
            Unfilter your world. Connection in its rawest form.
          </p>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="mt-12 flex flex-col items-center gap-4">
             <button 
              onClick={onEnter}
              className="group relative px-8 py-4 bg-white text-black rounded-full font-mono text-sm font-bold tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                ENTER SYSTEM <ArrowRight size={16} />
              </span>
              <div className="absolute inset-0 bg-nothing-red transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out z-0"></div>
              <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                ENTER SYSTEM <ArrowRight size={16} />
              </span>
            </button>
            <span className="font-mono text-[10px] text-zinc-600 tracking-[0.2em] uppercase mt-4">
              Est. 2024 • Blur Labs
            </span>
          </div>
        </Reveal>
      </section>

      {/* Feature Section 1 */}
      <section className="relative z-10 w-full max-w-6xl mx-auto py-32 px-6 grid md:grid-cols-2 gap-16 items-center">
        <Reveal>
            <div className="aspect-square rounded-3xl overflow-hidden relative border border-white/10 group">
                <img 
                    src="https://picsum.photos/1000/1000?grayscale" 
                    alt="Couple" 
                    className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-80" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8">
                     <div className="inline-block px-2 py-1 border border-nothing-red text-nothing-red font-mono text-xs mb-2">
                        MODE: INTIMACY
                     </div>
                     <h3 className="text-3xl font-bold">Only for two.</h3>
                </div>
            </div>
        </Reveal>
        <Reveal delay={0.2}>
            <div className="space-y-6">
                <h2 className="text-5xl font-bold tracking-tight">Closer than <br/> close.</h2>
                <p className="text-xl text-zinc-400 leading-relaxed">
                    A dedicated space for your partner. Share moments, thoughts, and feelings in a channel encrypted by emotion.
                </p>
                <ul className="space-y-4 font-mono text-sm text-zinc-500">
                    <li className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-nothing-red rounded-full"></span>
                        Real-time presence
                    </li>
                    <li className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-zinc-700 rounded-full"></span>
                        AI-assisted expression
                    </li>
                    <li className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-zinc-700 rounded-full"></span>
                        Ephemeral sharing
                    </li>
                </ul>
            </div>
        </Reveal>
      </section>

       {/* Feature Section 2 (Inverted) */}
       <section className="relative z-10 w-full max-w-6xl mx-auto py-32 px-6 grid md:grid-cols-2 gap-16 items-center">
        <div className="order-2 md:order-1 space-y-6">
            <Reveal>
                <h2 className="text-5xl font-bold tracking-tight">Raw Data.<br/> Pure Signal.</h2>
                <p className="text-xl text-zinc-400 leading-relaxed mt-6">
                    No algorithm. No clutter. Just the raw feed of your circle. Designed with the precision of hardware, delivered with the fluidity of software.
                </p>
            </Reveal>
        </div>
        <Reveal delay={0.2} className="order-1 md:order-2">
            <div className="aspect-video rounded-3xl overflow-hidden relative border border-white/10 bg-zinc-900 flex items-center justify-center group">
                <div className="absolute inset-0 dot-matrix opacity-30"></div>
                <div className="w-64 h-32 border border-dashed border-zinc-600 rounded flex items-center justify-center group-hover:border-white transition-colors">
                    <span className="font-mono text-xs animate-pulse text-nothing-red">LIVE SIGNAL FEED</span>
                </div>
            </div>
        </Reveal>
      </section>

    </div>
  );
};