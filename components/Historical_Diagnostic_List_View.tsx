import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, Calendar, User, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface DiagnosisRecord {
  id: string;
  deviceName: string;
  conclusion: string;
  timestamp: string;
  status: 'critical' | 'severe' | 'warning' | 'normal';
  issuer: string;
  thumbnail?: string;
}

const MOCK_RECORDS: DiagnosisRecord[] = [
  {
    id: 'DIA-V8MB',
    deviceName: '10kV 04出线柜',
    conclusion: '绝缘件受潮引发沿面放电',
    timestamp: '2026-02-26 14:30',
    status: 'critical',
    issuer: '王*',
    thumbnail: 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?w=150&h=150&fit=crop'
  },
  {
    id: 'DIA-X9LC',
    deviceName: '10kV 02进线柜',
    conclusion: '接触不良导致局部过热',
    timestamp: '2026-02-25 09:15',
    status: 'severe',
    issuer: '李*',
    thumbnail: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=150&h=150&fit=crop'
  },
  {
    id: 'DIA-A1KD',
    deviceName: '10kV 母线PT柜',
    conclusion: '暂态地电压数值轻微异常',
    timestamp: '2026-02-24 16:45',
    status: 'warning',
    issuer: '张*',
    thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=150&h=150&fit=crop'
  },
  {
    id: 'DIA-B2JF',
    deviceName: '10kV 01进线柜',
    conclusion: '各项指标正常',
    timestamp: '2026-02-23 10:00',
    status: 'normal',
    issuer: '王*',
    thumbnail: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=150&h=150&fit=crop'
  },
  {
    id: 'DIA-C3HG',
    deviceName: '10kV 05出线柜',
    conclusion: '超声波信号未检出异常',
    timestamp: '2026-02-22 11:30',
    status: 'normal',
    issuer: '赵*',
    thumbnail: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=150&h=150&fit=crop'
  }
];

const Historical_Diagnostic_List_View: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'severe' | 'warning' | 'normal'>('all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">危急</span>;
      case 'severe':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 border border-orange-200">严重</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-600 border border-yellow-200">预警</span>;
      case 'normal':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-600 border border-green-200">正常</span>;
      default:
        return null;
    }
  };

  const filteredRecords = MOCK_RECORDS.filter(record => {
    const matchesSearch = 
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.conclusion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || record.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white px-4 py-2 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-600 active:scale-90 transition-transform">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-base font-bold text-slate-800">历史诊断台账</h1>
          <button className="ml-auto p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
            <Filter size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search size={14} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs transition-colors"
            placeholder="搜索单号、设备名称或缺陷关键词..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-medium transition-colors ${
              activeFilter === 'all' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setActiveFilter('critical')}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-medium transition-colors flex items-center gap-1 ${
              activeFilter === 'critical' 
                ? 'bg-red-500 text-white shadow-sm shadow-red-200' 
                : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
            }`}
          >
            <AlertCircle size={10} /> 三级危急
          </button>
          <button
            onClick={() => setActiveFilter('severe')}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-medium transition-colors flex items-center gap-1 ${
              activeFilter === 'severe' 
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-200' 
                : 'bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100'
            }`}
          >
            <AlertTriangle size={10} /> 二级严重
          </button>
          <button
            onClick={() => setActiveFilter('warning')}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-medium transition-colors flex items-center gap-1 ${
              activeFilter === 'warning' 
                ? 'bg-yellow-500 text-white shadow-sm shadow-yellow-200' 
                : 'bg-yellow-50 text-yellow-600 border border-yellow-100 hover:bg-yellow-100'
            }`}
          >
            <AlertTriangle size={10} /> 一级预警
          </button>
          <button
            onClick={() => setActiveFilter('normal')}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-medium transition-colors flex items-center gap-1 ${
              activeFilter === 'normal' 
                ? 'bg-green-500 text-white shadow-sm shadow-green-200' 
                : 'bg-green-50 text-green-600 border border-green-100 hover:bg-green-100'
            }`}
          >
            <CheckCircle size={10} /> 正常
          </button>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredRecords.map((record) => (
          <div 
            key={record.id}
            onClick={() => navigate(`/archive-detail/${record.id}`)}
            className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex gap-3 active:scale-[0.99] transition-transform cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="w-[60px] h-[60px] flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
              {record.thumbnail ? (
                <img src={record.thumbnail} alt={record.deviceName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Calendar size={24} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold text-slate-800 truncate pr-2">{record.deviceName}</h3>
                {getStatusBadge(record.status)}
              </div>
              
              <p className="text-xs font-medium text-indigo-600 truncate my-1">
                {record.conclusion}
              </p>
              
              <div className="flex justify-between items-end">
                <div className="text-[10px] text-slate-400 flex flex-col">
                  <span>{record.timestamp}</span>
                  <span>单号: {record.id}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                  <User size={10} />
                  <span>签发人: {record.issuer}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Search size={24} />
            </div>
            <p className="text-sm">未找到相关记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Historical_Diagnostic_List_View;
