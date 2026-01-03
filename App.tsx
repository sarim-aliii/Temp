import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Landing } from './components/Landing';
import { Feed } from './components/Feed';
import { Chat } from './components/Chat';
import { ViewState, Message, User } from './types';
import { authApi, pairingApi } from './services/api';
import { connectSocket, getSocket } from './services/socket';



// --- COMPONENT: Auth Modal ---
const AuthModal = ({ onLogin }: { onLogin: (token: string, user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = isLogin 
        ? await authApi.login({ email, password }) 
        : await authApi.signup({ email, password });
      
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.token, res.data.user);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Enter System' : 'Initialize'}</h2>
        <p className="text-zinc-500 text-xs mb-6 uppercase tracking-wider">Identity Verification</p>
        
        {error && <div className="mb-4 text-nothing-red text-xs bg-red-900/10 p-2 rounded border border-nothing-red/20">{error}</div>}

        <input className="w-full mb-4 p-3 bg-black border border-zinc-700 rounded text-white focus:border-nothing-red outline-none transition-colors" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full mb-6 p-3 bg-black border border-zinc-700 rounded text-white focus:border-nothing-red outline-none transition-colors" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        
        <button className="w-full bg-nothing-red py-3 rounded text-white font-bold mb-4 hover:bg-red-600 transition-colors">Submit</button>
        <p className="text-zinc-500 text-sm cursor-pointer hover:text-white text-center" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Sign up' : 'Have an account? Login'}
        </p>
      </form>
    </div>
  );
};

// --- COMPONENT: Pairing View ---
const PairingView = ({ onPaired, user }: { onPaired: (user: User) => void, user: User }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await pairingApi.generateCode();
      setGeneratedCode(res.data.inviteCode);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate code');
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
      const res = await pairingApi.linkPartner(inviteCode);
      // Backend returns the updated user object with pairedWithUserId
      onPaired(res.data.user); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code');
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
          {/* Option A: Generate Code */}
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
               </div>
             )}
          </div>

          <div className="relative flex items-center justify-center">
            <div className="h-px bg-zinc-800 w-full"></div>
            <span className="absolute bg-zinc-900 px-2 text-zinc-600 text-xs uppercase">OR</span>
          </div>

          {/* Option B: Input Code */}
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

// --- COMPONENT: Main App ---
function App() {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // 1. Check for existing token on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.getMe().then(res => {
        const user = res.data;
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Only connect to socket if the user is already paired
        if (user.pairedWithUserId) {
          connectSocket(token);
        }
      }).catch(() => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      });
    }
  }, []);

  // 2. Handle Socket Events (Messages)
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
  }, [isAuthenticated, currentUser?.pairedWithUserId]); // Re-run when pairing status changes

  // 3. Handlers
  const handleLoginSuccess = (token: string, user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    // Logic: If paired, go to feed. If not, the UI will automatically show PairingView.
    if (user.pairedWithUserId) {
      connectSocket(token);
      setView(ViewState.FEED);
    }
  };

  const handlePairingSuccess = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    const token = localStorage.getItem('token');
    if (token) {
       connectSocket(token);
       setView(ViewState.FEED);
    }
  };

  const handleSendMessage = (text: string) => {
    const socket = getSocket();
    if (socket && currentUser) {
      socket.emit('clientAction', {
        type: 'SEND_MESSAGE',
        payload: {
          text,
          senderId: currentUser.id, 
          timestamp: Date.now()
        }
      });
    }
  };

  // 4. Render Logic
  return (
    <div className="bg-black min-h-screen text-white selection:bg-nothing-red selection:text-white">
      
      {/* A. Auth Modal - Shows if not logged in and not on Landing page */}
      {!isAuthenticated && view !== ViewState.LANDING && (
        <AuthModal onLogin={handleLoginSuccess} />
      )}

      {/* B. Pairing View - Intersects flow if logged in but NOT paired */}
      {isAuthenticated && currentUser && !currentUser.pairedWithUserId && (
         <PairingView user={currentUser} onPaired={handlePairingSuccess} />
      )}

      {/* C. Navbar - Only visible if paired */}
      {view !== ViewState.LANDING && isAuthenticated && currentUser?.pairedWithUserId && (
        <Navbar currentView={view} setView={setView} />
      )}
      
      <main className="w-full">
        {/* Landing Page */}
        {view === ViewState.LANDING && <Landing onEnter={() => setView(ViewState.FEED)} />}
        
        {/* Protected Routes (Feed/Chat) - Only if Paired */}
        {isAuthenticated && currentUser?.pairedWithUserId && (
            <>
                {view === ViewState.FEED && <Feed onUserClick={() => setView(ViewState.CHAT)} />}
                
                {view === ViewState.CHAT && currentUser && (
                <Chat 
                    recipient={{ 
                       id: currentUser.pairedWithUserId || 'partner', 
                       name: 'Partner', 
                       handle: '@connected', 
                       avatar: 'https://picsum.photos/200' 
                    }} 
                    messages={messages} 
                    onSendMessage={handleSendMessage}
                />
                )}
            </>
        )}
      </main>
    </div>
  );
}

export default App;