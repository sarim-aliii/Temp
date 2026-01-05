import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useApi } from '../../hooks/useApi';
import { Button } from '../ui/Button';
import OtpInput from '../ui/OtpInput';
import { Loader } from '../ui/Loader';
import { resendVerification } from '../../services/api'; 
import { ShieldCheck, Radio, RefreshCcw, Wifi, AlertTriangle } from 'lucide-react';

interface VerifyEmailPageProps {
  email: string;
  onSuccess: () => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ email, onSuccess }) => {
  const { verifyEmail } = useAppContext();
  
  const [token, setToken] = useState('');
  const [timer, setTimer] = useState(60);
  const [successMsg, setSuccessMsg] = useState('');

  // 2. Setup Hooks
  const { 
    execute: verify, 
    loading: isLoading, 
    error: verifyError 
  } = useApi(verifyEmail);

  const { 
    execute: resend, 
    loading: isResending 
  } = useApi(resendVerification);

  // Timer Countdown Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Main Verification Logic
  const handleVerification = async (code: string) => {
    setSuccessMsg('');
    
    if (!code || code.length < 6) return;

    try {
      await verify(code);
      onSuccess();
    } catch (err) {
      // Error handled by hook
    }
  };

  // Resend Logic
  const handleResend = async () => {
    setSuccessMsg('');
    try {
      await resend(email);
      setSuccessMsg('SIGNAL_REFRESHED: CHECK_INBOX');
      setTimer(60); 
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerification(token);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black text-white selection:bg-red-500/30 selection:text-red-200 overflow-hidden">

      {/* 1. Global Noise Texture */}
      <div className="fixed inset-0 z-[1] opacity-[0.04] pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* 2. Ambient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-zinc-800/20 blur-[120px] rounded-full animate-pulse duration-[10s]" />
      </div>

      {/* Dot Matrix Overlay */}
      <div className="fixed inset-0 dot-matrix opacity-[0.03] z-0 pointer-events-none" />

      {/* 3. Tech Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference text-zinc-500">
         <div className="flex items-center gap-2">
            <Wifi size={16} className={`text-red-500 ${isLoading ? 'animate-pulse' : ''}`} />
            <span className="font-mono text-xs tracking-[0.2em]">WAITING_FOR_SIGNAL</span>
         </div>
         <div className="flex gap-2">
            <span className="font-mono text-[10px] hidden sm:block">ENCRYPTION_LAYER_3</span>
            <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 w-full max-w-md p-6">
        
        {/* Aesthetic Border Container */}
        <div className="relative group">
            {/* Animated Glow Border */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-zinc-700 via-red-900/50 to-zinc-800 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            
            <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-lg shadow-2xl">
                
                {/* Header Section */}
                <div className="mb-8 flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-2 relative">
                        <div className="absolute inset-0 bg-red-500/10 animate-ping rounded-full opacity-50"></div>
                        <Radio size={20} className="text-white relative z-10" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">VERIFY IDENTITY</h2>
                    <p className="text-sm text-zinc-500 font-mono tracking-wide">
                        CODE SENT TO <span className="text-white border-b border-white/20 pb-0.5">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* OTP Input Wrapper */}
                    <div className="flex justify-center py-4">
                        <OtpInput 
                            length={6} 
                            onComplete={(code) => {
                                setToken(code);
                                handleVerification(code);
                            }} 
                        />
                    </div>

                    {/* Messages */}
                    {verifyError && (
                        <div className="p-3 bg-red-900/20 border border-red-500/20 rounded flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle size={14} className="text-red-500 shrink-0" />
                            <span className="text-xs text-red-200 font-mono uppercase tracking-wide">{verifyError}</span>
                        </div>
                    )}
                    {successMsg && (
                        <div className="p-3 bg-green-900/20 border border-green-500/20 rounded flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <ShieldCheck size={14} className="text-green-500 shrink-0" />
                            <span className="text-xs text-green-200 font-mono uppercase tracking-wide">{successMsg}</span>
                        </div>
                    )}

                    {/* Verify Button */}
                    <Button 
                        type="submit" 
                        disabled={isLoading || token.length < 6} 
                        className="w-full h-12 bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all font-mono tracking-widest text-xs font-bold rounded flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader spinnerClassName="w-4 h-4 text-black" /> : (
                            <>
                                <span>AUTHENTICATE</span>
                                <ShieldCheck size={14} />
                            </>
                        )}
                    </Button>
                </form>

                {/* Resend Logic */}
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <div className="flex flex-col items-center gap-3">
                         <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Signal Lost?</span>
                         
                         {timer > 0 ? (
                            <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs">
                                <RefreshCcw size={12} className="animate-spin duration-[3000ms]" />
                                <span>RETRY IN {timer}s</span>
                            </div>
                          ) : (
                            <button
                              onClick={handleResend}
                              disabled={isResending}
                              className="group flex items-center gap-2 text-xs font-mono text-white hover:text-red-400 transition-colors uppercase tracking-widest"
                            >
                              <RefreshCcw size={12} className={`group-hover:rotate-180 transition-transform duration-500 ${isResending ? 'animate-spin' : ''}`} />
                              <span>{isResending ? 'TRANSMITTING...' : 'RESEND SIGNAL'}</span>
                            </button>
                          )}
                    </div>
                </div>

            </div>
            
             {/* Decorative Tech Corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30 rounded-tl-sm"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30 rounded-tr-sm"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30 rounded-bl-sm"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30 rounded-br-sm"></div>
        </div>

      </div>
    </div>
  );
};