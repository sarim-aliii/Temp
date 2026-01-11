import React, { useState } from 'react';
import { X, Send, Bug, Lightbulb, MessageSquare } from 'lucide-react';
import { feedbackApi } from '../services/api';
import { Loader } from './ui/Loader';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<'bug' | 'feature' | 'other'>('bug');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await feedbackApi.submit({ type, message });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMessage('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-nothing-red" size={24} />
            Feedback
          </h2>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="text-green-500" size={32} />
            </div>
            <h3 className="text-white font-bold text-lg">Thank You!</h3>
            <p className="text-zinc-400 mt-2">Your feedback has been received.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Type Selection */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('bug')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  type === 'bug' 
                    ? 'bg-red-500/10 border-red-500 text-red-500' 
                    : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <Bug size={20} />
                <span className="text-xs font-bold">Bug</span>
              </button>
              
              <button
                type="button"
                onClick={() => setType('feature')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  type === 'feature' 
                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' 
                    : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <Lightbulb size={20} />
                <span className="text-xs font-bold">Feature</span>
              </button>

              <button
                type="button"
                onClick={() => setType('other')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  type === 'other' 
                    ? 'bg-blue-500/10 border-blue-500 text-blue-500' 
                    : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <MessageSquare size={20} />
                <span className="text-xs font-bold">Other</span>
              </button>
            </div>

            {/* Message Input */}
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's on your mind..."
                className="w-full h-32 bg-black border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-nothing-red focus:ring-1 focus:ring-nothing-red resize-none transition-all"
                required
                minLength={10}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || message.length < 10}
              className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader size="sm" /> : (
                <>
                  <Send size={18} />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};