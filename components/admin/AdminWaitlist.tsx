import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Lock, RefreshCw, ClipboardList, Users, Clock, 
  CheckCircle, Shield, Crown, Search, Copy, Calendar, TrendingUp,
  MessageSquare
} from 'lucide-react';
import { AdminFeedback } from './AdminFeedback';


// --- Types ---
interface WaitlistEntry {
  _id: string;
  email: string;
  position: number;
  approved: boolean;
  createdAt: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  isPremium: boolean;
  createdAt: string;
  provider?: string;
}

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  revenue: number;
  waitlistCount: number;
}

// --- Utility: Time Ago Formatter ---
const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return "Just now";
};

const AdminDashboard = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'waitlist' | 'users' | 'feedback'>('waitlist');
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<any[]>([]);
  
  // Auth & UI State
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // --- Initial Load ---
  useEffect(() => {
    const savedKey = localStorage.getItem('admin_key');
    if (savedKey) {
        setKey(savedKey);
        fetchData(savedKey);
    }
  }, []);

  // --- Actions ---
  const fetchData = async (adminKey: string) => {
    setLoading(true);
    setError('');
    try {
      const headers = { 'x-admin-key': adminKey };
      const [waitlistRes, usersRes, statsRes, feedbackRes] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/waitlist', { headers }),
        axios.get('http://localhost:8080/api/admin/users', { headers }),
        axios.get('http://localhost:8080/api/admin/stats', { headers }),
        axios.get('http://localhost:8080/api/admin/feedback', { headers })
      ]);

      setWaitlist(waitlistRes.data.data);
      setUsers(usersRes.data.data);
      setStats(statsRes.data);
      setFeedback(feedbackRes.data.data);
      localStorage.setItem('admin_key', adminKey);
    } catch (err) {
      setError('ACCESS_DENIED: Invalid Key or Server Error');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!key) return;
    setProcessingId(id);
    try {
        await axios.put(
            `http://localhost:8080/api/admin/waitlist/${id}/approve`, 
            {}, 
            { headers: { 'x-admin-key': key } }
        );
        setWaitlist(prev => prev.map(entry => 
            entry._id === id ? { ...entry, approved: true } : entry
        ));
    } catch (err) {
        alert("Action failed");
    } finally {
        setProcessingId(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // --- Filtering Logic ---
  const filteredWaitlist = useMemo(() => {
    return waitlist.filter(entry => 
      entry.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [waitlist, searchTerm]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleLogin = () => fetchData(key);

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans p-4 md:p-8 pt-20 selection:bg-zinc-800">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* === HEADER SECTION === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-900 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white text-black p-1.5 rounded-md">
                <Shield size={20} fill="black" />
              </div>
              <h1 className="text-3xl text-white font-bold tracking-tight">Admin Console</h1>
            </div>
            <p className="text-sm text-zinc-500 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
              SYSTEM ONLINE // RESTRICTED ACCESS
            </p>
          </div>

          {/* Stats Grid */}
          {stats && (
             <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Waitlist</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-white">{stats.waitlistCount}</span>
                        <Clock size={14} className="text-blue-500 mb-1.5" />
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Live Users</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-white">{stats.totalUsers}</span>
                        <Users size={14} className="text-indigo-500 mb-1.5" />
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10"><Crown size={40} /></div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Est. Revenue</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-green-500">${stats.revenue}</span>
                        <TrendingUp size={14} className="text-green-600 mb-1.5" />
                    </div>
                </div>
             </div>
          )}
        </div>

        {/* === AUTH FORM === */}
        {!stats && (
           <div className="max-w-md mx-auto mt-20 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl text-center">
              <Lock className="mx-auto text-zinc-600 mb-4" size={32} />
              <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
              <p className="text-zinc-500 text-sm mb-6">Please enter your master administration key to proceed.</p>
              
              <div className="flex gap-2 relative">
                  <input
                      type="password"
                      placeholder="Enter Admin Key"
                      value={key}
                      className="flex-1 bg-black border border-zinc-800 text-white px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-white/20 focus:border-white focus:outline-none transition-all"
                      onChange={(e) => setKey(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button 
                    onClick={handleLogin} 
                    disabled={loading}
                    className="bg-white hover:bg-zinc-200 text-black px-6 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center min-w-[80px]"
                  >
                      {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Unlock'}
                  </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-4 bg-red-500/10 py-2 rounded border border-red-500/20">{error}</p>}
           </div>
        )}

        {/* === MAIN DASHBOARD === */}
        {stats && (
            <div className="space-y-6 animate-in fade-in duration-500">
                
                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row justify-between gap-4 bg-zinc-900/30 p-2 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
                    {/* Tabs */}
                    <div className="flex bg-black/50 p-1 rounded-lg border border-zinc-800 w-full md:w-auto overflow-x-auto">
                        <button 
                            onClick={() => setActiveTab('waitlist')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                                activeTab === 'waitlist' 
                                ? 'bg-zinc-800 text-white shadow-lg' 
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <ClipboardList size={14} /> Waitlist <span className="text-xs bg-black px-1.5 rounded-full text-zinc-400">{waitlist.length}</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                                activeTab === 'users' 
                                ? 'bg-zinc-800 text-white shadow-lg' 
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <Users size={14} /> Users <span className="text-xs bg-black px-1.5 rounded-full text-zinc-400">{users.length}</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('feedback')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                                activeTab === 'feedback' 
                                ? 'bg-zinc-800 text-white shadow-lg' 
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <MessageSquare size={14} /> Feedback <span className="text-xs bg-black px-1.5 rounded-full text-zinc-400">{feedback.length}</span>
                        </button>
                    </div>

                    {/* Search - Hide for feedback tab if desired, or keep generic */}
                    {activeTab !== 'feedback' && (
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-2.5 text-zinc-600" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search by email or name..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black border border-zinc-800 text-zinc-300 text-sm pl-10 pr-4 py-2.5 rounded-lg focus:border-zinc-600 focus:outline-none placeholder:text-zinc-700"
                            />
                        </div>
                    )}

                    {/* Refresh */}
                    <button onClick={handleLogin} className="p-2.5 bg-black border border-zinc-800 rounded-lg text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Content Area */}
                {activeTab === 'feedback' ? (
                    <AdminFeedback data={feedback} />
                ) : (
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm min-h-[400px]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                {/* Table Header */}
                                <thead className="bg-black/40 border-b border-zinc-800 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                                    <tr>
                                        {activeTab === 'waitlist' ? (
                                            <>
                                                <th className="p-5 w-20">#</th>
                                                <th className="p-5">Candidate</th>
                                                <th className="p-5">Status</th>
                                                <th className="p-5">Joined</th>
                                                <th className="p-5 text-right">Actions</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="p-5">User Profile</th>
                                                <th className="p-5">Access Tier</th>
                                                <th className="p-5">Joined</th>
                                                <th className="p-5 text-right">Method</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>

                                {/* Table Body */}
                                <tbody className="divide-y divide-zinc-800/50">
                                    {activeTab === 'waitlist' ? (
                                        filteredWaitlist.length > 0 ? filteredWaitlist.map((entry) => (
                                            <tr key={entry._id} className="hover:bg-zinc-800/30 transition-colors group">
                                                <td className="p-5 text-zinc-600 font-mono text-xs">#{entry.position}</td>
                                                <td className="p-5">
                                                    <div 
                                                        onClick={() => handleCopy(entry.email)}
                                                        className="flex items-center gap-2 cursor-pointer group/email w-fit"
                                                    >
                                                        <span className="text-zinc-200 font-medium group-hover/email:text-white transition-colors">
                                                            {entry.email}
                                                        </span>
                                                        {copiedText === entry.email ? (
                                                            <CheckCircle size={12} className="text-green-500" />
                                                        ) : (
                                                            <Copy size={12} className="text-zinc-600 opacity-0 group-hover/email:opacity-100 transition-opacity" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    {entry.approved ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                                            <CheckCircle size={10} /> APPROVED
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                            <Clock size={10} /> WAITING
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-5 text-zinc-500 text-xs">
                                                    {timeAgo(entry.createdAt)}
                                                </td>
                                                <td className="p-5 text-right">
                                                    {!entry.approved && (
                                                        <button 
                                                            onClick={() => handleApprove(entry._id)}
                                                            disabled={processingId === entry._id}
                                                            className="bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black text-[10px] font-bold px-4 py-1.5 rounded-full inline-flex items-center gap-1 transition-all"
                                                        >
                                                            {processingId === entry._id ? <RefreshCw className="animate-spin" size={10} /> : 'APPROVE'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : <EmptyState />
                                    ) : (
                                        filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                            <tr key={user._id} className="hover:bg-zinc-800/30 transition-colors">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <img 
                                                                src={user.avatar} 
                                                                className="w-9 h-9 rounded-full bg-zinc-800 object-cover ring-2 ring-black" 
                                                                alt="" 
                                                            />
                                                            {user.isPremium && (
                                                                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 ring-2 ring-black">
                                                                    <Crown size={8} fill="black" className="text-black" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-zinc-200 font-bold text-xs">{user.name}</p>
                                                            <div 
                                                                onClick={() => handleCopy(user.email)}
                                                                className="flex items-center gap-1.5 cursor-pointer group/email"
                                                            >
                                                                <p className="text-zinc-500 text-[10px] group-hover/email:text-zinc-300 transition-colors">{user.email}</p>
                                                                {copiedText === user.email && <CheckCircle size={8} className="text-green-500" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    {user.isPremium 
                                                        ? <span className="text-yellow-500 text-[10px] font-bold bg-yellow-900/20 px-2 py-1 rounded border border-yellow-500/20">PREMIUM PRO</span> 
                                                        : <span className="text-zinc-500 text-[10px] font-bold bg-zinc-800/50 px-2 py-1 rounded border border-zinc-700">FREE TIER</span>
                                                    }
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                                                        <Calendar size={12} />
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="p-5 text-right">
                                                    <span className="text-[10px] font-mono bg-black border border-zinc-800 px-2 py-1 rounded text-zinc-400 uppercase">
                                                        {user.provider || 'EMAIL'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : <EmptyState />
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

// Simple sub-component for empty states
const EmptyState = () => (
    <tr>
        <td colSpan={5} className="py-20 text-center">
            <div className="flex flex-col items-center justify-center text-zinc-600">
                <Search size={32} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">No results found matching your criteria</p>
            </div>
        </td>
    </tr>
);

export default AdminDashboard;