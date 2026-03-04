import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, FileText, CheckCircle, Zap, File, X, Download } from 'lucide-react';

type Category = 'regulations' | 'manuals' | 'emergency';

interface DocItem {
  id: string;
  title: string;
  type: 'pdf' | 'docx';
  size: string;
  category: Category;
  downloaded: boolean;
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'regulations', label: '国家及行业规程' },
  { id: 'manuals', label: '设备原厂手册' },
  { id: 'emergency', label: '应急处置预案' },
];

const MOCK_DOCS: DocItem[] = [
  { id: '1', title: 'GB/T 42287-2022 局部放电诊断规范', type: 'pdf', size: '2.4 MB', category: 'regulations', downloaded: true },
  { id: '2', title: 'DL/T 596-2021 电力设备预防性试验规程', type: 'pdf', size: '5.1 MB', category: 'regulations', downloaded: true },
  { id: '3', title: 'Q/GDW 11060-2013 交流金属封闭开关设备暂态地电压局部放电带电测试技术现场应用导则', type: 'pdf', size: '1.8 MB', category: 'regulations', downloaded: true },
  { id: '4', title: 'ABB UniGear ZS1 开关柜操作手册', type: 'pdf', size: '8.5 MB', category: 'manuals', downloaded: true },
  { id: '5', title: 'Siemens NXAIR S 断路器维护指南', type: 'pdf', size: '6.2 MB', category: 'manuals', downloaded: false },
  { id: '6', title: 'Schneider MVnex 施耐德中压柜安装说明书', type: 'docx', size: '3.4 MB', category: 'manuals', downloaded: true },
  { id: '7', title: '10kV 开关柜火灾应急处置预案', type: 'docx', size: '0.5 MB', category: 'emergency', downloaded: true },
  { id: '8', title: '变电站全站停电现场处置方案', type: 'pdf', size: '1.2 MB', category: 'emergency', downloaded: true },
  { id: '9', title: '人身触电急救措施与流程', type: 'pdf', size: '0.8 MB', category: 'emergency', downloaded: true },
];

const Offline_Knowledge_Base_View: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>('regulations');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDoc, setPreviewDoc] = useState<DocItem | null>(null);

  const filteredDocs = MOCK_DOCS.filter(doc => 
    doc.category === activeCategory && 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDocClick = (doc: DocItem) => {
    setPreviewDoc(doc);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-600 active:scale-90 transition-transform">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-800">规程与知识库</h1>
        </div>
        
        {/* Offline Status Bar */}
        <div className="bg-emerald-50 px-4 py-2 flex items-center gap-2 border-b border-emerald-100">
          <Zap size={14} className="text-emerald-600 fill-emerald-600" />
          <span className="text-xs font-medium text-emerald-700">已开启离线缓存，断网可用</span>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs transition-colors"
              placeholder="搜索故障现象或规程编号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex px-4 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap pb-2 pt-1 px-1 mr-4 text-xs font-medium border-b-2 transition-colors ${
                activeCategory === cat.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredDocs.map(doc => (
          <div 
            key={doc.id}
            onClick={() => handleDocClick(doc)}
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-start gap-4 active:scale-[0.99] transition-transform cursor-pointer"
          >
            {/* File Icon */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              doc.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
            }`}>
              <FileText size={20} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-800 leading-tight mb-1.5 line-clamp-2">
                {doc.title}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{doc.size}</span>
                {doc.downloaded && (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    <CheckCircle size={10} />
                    <span>已下载</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Arrow or Action */}
            <div className="self-center text-slate-300">
              {!doc.downloaded ? <Download size={18} /> : null}
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <File size={48} className="mb-4 opacity-20" />
            <p className="text-sm">未找到相关文档</p>
          </div>
        )}
      </div>

      {/* Document Preview Modal (Skeleton) */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
          {/* Preview Header */}
          <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3 overflow-hidden">
              <button onClick={() => setPreviewDoc(null)} className="p-1 -ml-1 text-slate-600">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-sm font-bold text-slate-800 truncate">{previewDoc.title}</h2>
            </div>
            <button onClick={() => setPreviewDoc(null)} className="p-2 text-slate-400">
              <X size={20} />
            </button>
          </div>

          {/* Preview Skeleton Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <div className="max-w-3xl mx-auto bg-white shadow-sm border border-slate-200 min-h-full p-8 sm:p-12">
              {/* Fake PDF Page */}
              <div className="w-3/4 h-8 bg-slate-200 rounded mb-8"></div>
              
              <div className="space-y-4 mb-12">
                <div className="w-full h-4 bg-slate-100 rounded"></div>
                <div className="w-full h-4 bg-slate-100 rounded"></div>
                <div className="w-5/6 h-4 bg-slate-100 rounded"></div>
                <div className="w-full h-4 bg-slate-100 rounded"></div>
              </div>

              <div className="w-1/2 h-6 bg-slate-200 rounded mb-6"></div>

              <div className="space-y-4">
                <div className="w-full h-4 bg-slate-100 rounded"></div>
                <div className="w-11/12 h-4 bg-slate-100 rounded"></div>
                <div className="w-full h-4 bg-slate-100 rounded"></div>
                <div className="w-4/5 h-4 bg-slate-100 rounded"></div>
                <div className="w-full h-4 bg-slate-100 rounded"></div>
              </div>
              
              {/* Page Number */}
              <div className="mt-20 flex justify-center">
                <div className="w-8 h-4 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offline_Knowledge_Base_View;
