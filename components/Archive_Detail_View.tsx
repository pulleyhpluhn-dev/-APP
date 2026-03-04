import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const Archive_Detail_View: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <div className="bg-white px-4 py-3 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-600 active:scale-90 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">诊断详情</h1>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">详情页占位符</h2>
          <p className="text-slate-500">正在查看诊断记录 ID: {id}</p>
        </div>
      </div>
    </div>
  );
};

export default Archive_Detail_View;
