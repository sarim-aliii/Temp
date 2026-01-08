import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { pairingApi, authApi } from '../services/api';

interface PairingViewProps {
  user: User;
  onPaired: (user: User) => void;
}

export const PairingView: React.FC<PairingViewProps> = ({ user, onPaired }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- NEW: Poll for connection status ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Only start polling if we have generated a code (waiting for partner)
    // OR if we are just sitting on this screen (passive waiting)
    const checkStatus = async () => {
      try {
        // We cast to 'any' because strict typing might mask the direct response
        const res = await authApi.getMe() as any;
        const updatedUser = res.user || res; // Handle structure variations

        // If the server says we are now paired...
        if (updatedUser.pairedWithUserId) {
          onPaired(updatedUser); // ...Enter the system automatically!
        }
      } catch (err) {
        // Silent error (don't disturb the user while polling)
        console.error("Polling check failed", err);
      }
    };

    // Check every 3 seconds
    interval = setInterval(checkStatus, 3000);

    // Cleanup when component unmounts
    return () => clearInterval(interval);
  }, [onPaired]);


  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await pairingApi.generateCode() as any;
      setGeneratedCode(res.inviteCode);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode) return;
    setLoading(true);
    setError('');
    try {
      const res = await pairingApi.linkPartner(inviteCode) as any;
      onPaired(res.user); 
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Invalid code';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-nothing-red to-transparent opacity-50"></div>
        
        <h2 className="text-3xl font-bold tracking-tighter mb-2">Establish Connection</h2>
        <p className="text-zinc-400 mb-8 text-sm">To enter the system, you must be paired with exactly one other user.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 text-red-200 text-xs rounded">
            {error}
          </div>
        )}

        <div className="space-y-8">
          <div className="text-center">
             <button 
               onClick={handleGenerate} 
               disabled={loading}
               className="text-xs font-mono tracking-widest uppercase border-b border-zinc-700 pb-1 hover:text-nothing-red hover:border-nothing-red transition-colors"
             >
               {loading ? 'Generating...' : 'Option A: Generate Invite Code'}
             </button>
             
             {generatedCode && (
               <div className="mt-4 p-4 bg-black border border-zinc-700 rounded-xl animate-in fade-in slide-in-from-top-2">
                 <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Share this code</p>
                 <p className="text-4xl font-mono font-bold tracking-widest text-white select-all">{generatedCode}</p>
                 <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">WAITING FOR PARTNER...</span>
                 </div>
               </div>
             )}
          </div>

          <div className="relative flex items-center justify-center">
            <div className="h-px bg-zinc-800 w-full"></div>
            <span className="absolute bg-zinc-900 px-2 text-zinc-600 text-xs uppercase">OR</span>
          </div>

          <form onSubmit={handleSubmitCode} className="space-y-4">
            <div className="space-y-2">
               <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Option B: Enter Partner's Code</label>
               <input 
                 value={inviteCode}
                 onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                 placeholder="XY7B2A"
                 className="w-full bg-black border border-zinc-800 p-4 text-center font-mono text-xl rounded-xl focus:border-nothing-red outline-none transition-colors placeholder:text-zinc-800"
                 maxLength={6}
               />
            </div>
            <button 
              type="submit" 
              disabled={loading || inviteCode.length < 6}
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'LINKING...' : 'INITIATE LINK'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};