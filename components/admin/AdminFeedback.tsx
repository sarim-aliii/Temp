import React from 'react';
import { MessageSquare, Bug, Lightbulb, User as UserIcon, Calendar } from 'lucide-react';

interface FeedbackItem {
  _id: string;
  type: 'bug' | 'feature' | 'other';
  message: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export const AdminFeedback: React.FC<{ data: FeedbackItem[] }> = ({ data }) => {
  if (data.length === 0) {
      return (
          <div className="text-center py-20 text-zinc-500">
              <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
              <p>No feedback received yet.</p>
          </div>
      );
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/40 border-b border-zinc-800 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="p-5">Type</th>
              <th className="p-5">User</th>
              <th className="p-5 w-1/2">Message</th>
              <th className="p-5 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {data.map((item) => (
              <tr key={item._id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="p-5 align-top">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    item.type === 'bug' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    item.type === 'feature' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}>
                    {item.type === 'bug' && <Bug size={10} />}
                    {item.type === 'feature' && <Lightbulb size={10} />}
                    {item.type === 'other' && <MessageSquare size={10} />}
                    {item.type.toUpperCase()}
                  </span>
                </td>
                <td className="p-5 align-top">
                  <div className="flex items-center gap-3">
                    {item.user.avatar ? (
                        <img src={item.user.avatar} className="w-8 h-8 rounded-full bg-zinc-800" alt="" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                            <UserIcon size={14} className="text-zinc-500" />
                        </div>
                    )}
                    <div>
                        <p className="text-zinc-200 font-bold text-xs">{item.user.name}</p>
                        <p className="text-zinc-500 text-[10px]">{item.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-5 align-top text-zinc-300 whitespace-pre-wrap">
                    {item.message}
                </td>
                <td className="p-5 align-top text-right text-zinc-500 text-xs">
                    <div className="flex items-center justify-end gap-1.5">
                        <Calendar size={12} />
                        {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};