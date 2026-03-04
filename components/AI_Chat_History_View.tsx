import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, MessageSquare } from 'lucide-react';

interface ChatSession {
  id: string;
  summary: string;
  timestamp: string; // ISO string or formatted string for sorting
  displayTime: string; // "15:30", "昨天 10:20", "2023-10-01"
}

// Mock Data
const MOCK_SESSIONS: ChatSession[] = [
  // Today
  { id: '1', summary: '10kV开关柜巡检标准是什么...', timestamp: new Date().toISOString(), displayTime: '15:30' },
  { id: '2', summary: '变压器油温过高怎么处理...', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), displayTime: '13:15' },
  // Past 7 Days
  { id: '3', summary: '查询上周的巡检记录...', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), displayTime: '昨天 09:45' },
  { id: '4', summary: '分析断路器拒动原因...', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), displayTime: '周二 16:20' },
  { id: '5', summary: '生成月度运维报告...', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), displayTime: '周日 11:00' },
  // Earlier
  { id: '6', summary: 'GIS设备局部放电检测...', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), displayTime: '2026-02-15' },
  { id: '7', summary: '安全工器具试验周期...', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), displayTime: '2026-02-05' },
];

const AI_Chat_History_View: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>(MOCK_SESSIONS);

  // Grouping Logic
  const groupedSessions = {
    today: sessions.filter(s => {
      const date = new Date(s.timestamp);
      const today = new Date();
      return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }),
    week: sessions.filter(s => {
      const date = new Date(s.timestamp);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7;
    }),
    earlier: sessions.filter(s => {
      const date = new Date(s.timestamp);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 7;
    })
  };

  const handleClear = () => {
    if (window.confirm('确定要清空所有历史会话吗？')) {
      setSessions([]);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    // Navigate back to Home with sessionId to restore context
    navigate('/', { state: { restoreSessionId: sessionId } });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-600 active:scale-90 transition-transform">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-800">历史临时会话</h1>
        </div>
        <button 
          onClick={handleClear}
          className="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-md active:bg-slate-100"
        >
          清空
        </button>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 pb-20">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="text-sm">暂无历史会话</p>
          </div>
        ) : (
          <div className="pb-10">
            {/* Today Group */}
            {groupedSessions.today.length > 0 && (
              <div>
                <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100/50">
                  今天
                </div>
                <div className="bg-white border-y border-slate-100">
                  {groupedSessions.today.map((session, index) => (
                    <SessionItem 
                      key={session.id} 
                      session={session} 
                      onClick={() => handleSessionClick(session.id)}
                      isLast={index === groupedSessions.today.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past 7 Days Group */}
            {groupedSessions.week.length > 0 && (
              <div className="mt-6">
                <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100/50">
                  过去 7 天
                </div>
                <div className="bg-white border-y border-slate-100">
                  {groupedSessions.week.map((session, index) => (
                    <SessionItem 
                      key={session.id} 
                      session={session} 
                      onClick={() => handleSessionClick(session.id)}
                      isLast={index === groupedSessions.week.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Earlier Group */}
            {groupedSessions.earlier.length > 0 && (
              <div className="mt-6">
                <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100/50">
                  更早
                </div>
                <div className="bg-white border-y border-slate-100">
                  {groupedSessions.earlier.map((session, index) => (
                    <SessionItem 
                      key={session.id} 
                      session={session} 
                      onClick={() => handleSessionClick(session.id)}
                      isLast={index === groupedSessions.earlier.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SessionItem: React.FC<{ session: ChatSession; onClick: () => void; isLast: boolean }> = ({ session, onClick, isLast }) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-start gap-4 px-4 py-4 active:bg-slate-50 transition-colors cursor-pointer group"
    >
      <div className="mt-0.5 w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
        <MessageSquare size={16} strokeWidth={2} />
      </div>
      
      <div className={`flex-1 min-w-0 ${!isLast ? 'border-b border-slate-50 pb-4' : ''}`}>
        <h3 className="text-sm font-medium text-slate-800 truncate mb-1">
          {session.summary}
        </h3>
        <p className="text-[10px] text-slate-400 font-medium">
          {session.displayTime}
        </p>
      </div>
    </div>
  );
};

export default AI_Chat_History_View;
