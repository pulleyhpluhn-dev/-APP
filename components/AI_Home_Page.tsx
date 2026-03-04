import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Menu, Bell, Mic, Plus, Camera, ChevronRight, 
  BarChart3, BookOpen, Clock, Bot, X, Loader2, Send,
  Stethoscope, Activity, ScanLine,
  User, Edit, FileText, MessageSquare, Book, Tag, Settings, LogOut, Zap
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MOCK_DEVICES } from '../constants';
import { AlarmLevel } from '../types';
import { GoogleGenAI, Part } from "@google/genai";
import { 
  CameraOverlay, DiagnosisStepCard, generateDiagnosisId, DiagnosisSession 
} from './DiagnosisComponents';
import Unified_Diagnostic_Task_View from './Unified_Diagnostic_Task_View';

const LeftDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 w-[75%] max-w-[280px] bg-white z-50 transform transition-transform duration-300 ease-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* User Profile Area */}
        <div className="p-5 pt-10 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
          <div className="flex items-start justify-between mb-3">
            <div className="w-14 h-14 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden">
               <img 
                 src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                 alt="User Avatar" 
                 className="w-full h-full object-cover"
               />
            </div>
            <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-100">
              <Edit size={14} />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 mb-0.5">王工</h3>
            <p className="text-[10px] font-medium text-slate-500 bg-slate-100 inline-block px-1.5 py-0.5 rounded-md">
              变电运维二班
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          
          {/* Core Business */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">核心业务</div>
            <button 
              onClick={() => { navigate('/historical-diagnosis'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold transition-all active:scale-[0.98]"
            >
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm text-indigo-600">
                <FileText size={16} />
              </div>
              <span className="text-sm">历史诊断与工作票</span>
            </button>
            <button 
              onClick={() => { navigate('/chat-history'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-all active:scale-[0.98]"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                <MessageSquare size={16} />
              </div>
              <span className="text-sm">历史 AI 会话</span>
            </button>
          </div>

          {/* Tools & Settings */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">工具与设置</div>
            <button 
              onClick={() => { navigate('/knowledge-base'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-all active:scale-[0.98]"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                <Book size={16} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm">规程与知识库</span>
                <span className="text-[9px] text-emerald-600 font-medium flex items-center gap-0.5">
                  <Zap size={8} className="fill-current" /> 离线可用
                </span>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-all active:scale-[0.98]">
              <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                <Tag size={16} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">专家标注工作台</span>
                <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">PRO</span>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-all active:scale-[0.98]">
              <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                <Settings size={16} />
              </div>
              <span className="text-sm">系统设置</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-xs">
            <LogOut size={16} />
            退出登录
          </button>
        </div>

      </div>
    </>
  );
};

const AI_Home_Page: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<{
    role: 'user' | 'ai', 
    content: string, 
    image?: string, 
    timestamp: string, 
    type?: 'text' | 'diagnosis-card' | 'diagnosis-step' | 'reference-card' | 'interactive-card',
    diagnosisId?: string,
    step?: number,
    // Context for diagnosis card
    contextDeviceName?: string,
    contextTaskId?: string,
    // Context for reference card
    subtext?: string,
    // Context for interactive card
    actions?: { label: string; type: 'quick-reply' | 'action'; text?: string; action?: string; payload?: any }[]
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Global State Mock
  const [deviceName, setDeviceName] = useState<string | null>('10kV-04出线柜'); 
  const [taskId, setTaskId] = useState<string>('');

  // Diagnosis State
  const [diagnosisSession, setDiagnosisSession] = useState<DiagnosisSession | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraHint, setCameraHint] = useState('');
  const [cameraTargetField, setCameraTargetField] = useState<keyof DiagnosisSession['data'] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Initialize Task ID and Handle Navigation State
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Generate a random Task ID on mount
    const newTaskId = `DIA-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
    setTaskId(newTaskId);

    // Check for navigation state
    const state = location.state as { 
      mode?: string; 
      deviceName?: string; 
      deviceId?: string;
      restoreSessionId?: string;
      chatContextPayload?: {
        equipmentName: string;
        chartType: string;
        conclusion: string;
        timestamp: number;
      }
    };
    
    if (state?.restoreSessionId) {
      const sessionId = state.restoreSessionId;
      setMessages([
        { role: 'user', content: '10kV开关柜巡检标准是什么？', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { role: 'ai', content: `[已恢复会话 ID: ${sessionId}] 正在为您加载历史记录...`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      // Clear state to prevent re-trigger
      window.history.replaceState({}, document.title);
      return;
    }
    
    if (state?.mode === 'diagnosis') {
      // Auto-trigger welcome card with context
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '',
        type: 'diagnosis-card',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        contextDeviceName: state.deviceName,
        contextTaskId: newTaskId
      }]);
    } else if (state?.chatContextPayload) {
      // Handle Chat Context Payload from Analysis Modal
      const { equipmentName, chartType, conclusion } = state.chatContextPayload;
      
      // 1. User Reference Card
      const refMsg = {
        role: 'user' as const,
        type: 'reference-card' as const,
        content: `引用分析：${equipmentName} 的 ${chartType}`,
        subtext: conclusion.split('\n').filter(line => line.trim().length > 0 && !line.startsWith('#'))[0] || "点击查看详情",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // 2. AI Interactive Card
      const aiMsg = {
        role: 'ai' as const,
        type: 'interactive-card' as const,
        content: `王工，我已经接收了关于【${equipmentName}】的分析记录。您可以直接点击下方按钮进行追问，或调起正式的标准化诊断流程。`,
        actions: [
          { label: '❓ 追问劣化机理', type: 'quick-reply' as const, text: '请解释一下该设备的劣化机理。' },
          { label: '🚀 发起设备诊断', type: 'action' as const, action: 'start-diagnosis', payload: { equipmentName } }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, refMsg, aiMsg]);
      
      // Clear state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  // Calculate device stats
  const stats = useMemo(() => {
    const counts = {
      [AlarmLevel.NORMAL]: 0,
      [AlarmLevel.WARNING]: 0,
      [AlarmLevel.DANGER]: 0,
      [AlarmLevel.CRITICAL]: 0,
      [AlarmLevel.NO_DATA]: 0,
    };
    
    MOCK_DEVICES.forEach(d => {
      if (counts[d.status] !== undefined) {
        counts[d.status]++;
      }
    });
    
    return counts;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const handleStartFormalSOP = () => {
    navigate('/legacy-dashboard');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setSelectedFile(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachmentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImage(reader.result as string);
          setSelectedFile(null);
        };
        reader.readAsDataURL(file);
      } else {
        setSelectedFile(file);
        setSelectedImage(null);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerAttachmentInput = () => {
    attachmentInputRef.current?.click();
  };

  const clearImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (overrideContent?: string) => {
    const contentToSend = overrideContent || inputValue;
    if ((!contentToSend.trim() && !selectedImage) || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: contentToSend,
      image: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text' as const
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const parts: Part[] = [];
      
      if (userMessage.image) {
        // Extract base64 data (remove "data:image/png;base64," prefix)
        const base64Data = userMessage.image.split(',')[1];
        const mimeType = userMessage.image.split(';')[0].split(':')[1];
        
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      }

      if (userMessage.content) {
        parts.push({ text: userMessage.content });
      } else if (userMessage.image) {
        parts.push({ text: "请分析这张图片中的局放情况。" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: parts },
        config: {
          systemInstruction: "你是一个高压电力设备局放诊断专家。请根据用户的描述和上传的图片（如果有），分析局放的类型、严重程度，并给出处理建议。回答要专业、简洁。",
        }
      });

      const aiMessage = {
        role: 'ai' as const,
        content: response.text || "抱歉，我无法分析该内容。",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text' as const
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "抱歉，连接服务器时出现错误，请稍后再试。",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text' as const
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiagnosisStart = (index: number, specificTaskId?: string, specificDeviceName?: string) => {
    // Generate ID or use provided one
    const newId = specificTaskId || generateDiagnosisId();
    
    // Initialize Session
    setDiagnosisSession({
      id: newId,
      step: 1,
      data: {
        iotDeviceName: specificDeviceName || '', // Initialize with device name if available
        assetPlateName: '',
        nameplatePhotos: [],
        diagramPhotos: [],
        doorGapPhotos: [],
        cableCompartmentPhotos: [],
        audioTranscript: '',
        tags: [],
        extraSlots: []
      }
    });

    // Update the card to show ID (optional, but good for record)
    setMessages(prev => {
      const newMsgs = [...prev];
      newMsgs[index] = { ...newMsgs[index], diagnosisId: newId };
      return newMsgs;
    });
  };

  const handleSessionUpdate = (updates: Partial<DiagnosisSession> & { data?: Partial<DiagnosisSession['data']> }) => {
    if (diagnosisSession) {
      setDiagnosisSession(prev => {
        if (!prev) return null;
        const newData = updates.data ? { ...prev.data, ...updates.data } : prev.data;
        return { ...prev, ...updates, data: newData };
      });
    }
  };

  const handleDiagnosisExit = (index?: number, force: boolean = false) => {
    if (diagnosisSession) {
      if (force || window.confirm("注意：诊断任务未完成，退出后所有数据将被清空")) {
        // Remove all messages related to this diagnosis session
        setMessages(prev => prev.filter(msg => msg.diagnosisId !== diagnosisSession.id));
        
        // Reset session state
        setDiagnosisSession(null);
        setIsCameraOpen(false);
      }
    } else if (index !== undefined) {
      // No active session (e.g. guide card before start), just remove the card
      setMessages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleNextStep = () => {
    if (!diagnosisSession) return;
    
    const nextStep = diagnosisSession.step + 1;
    setDiagnosisSession(prev => prev ? ({ ...prev, step: nextStep }) : null);
  };

  const handleOpenCamera = (hint: string, targetField: keyof DiagnosisSession['data']) => {
    setCameraHint(hint);
    setCameraTargetField(targetField);
    setIsCameraOpen(true);
  };

  const handleCameraCapture = (photo: string) => {
    if (diagnosisSession && cameraTargetField) {
      const currentPhotos = diagnosisSession.data[cameraTargetField] as string[];
      handleSessionUpdate({
        data: { [cameraTargetField]: [...currentPhotos, photo] }
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden relative">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 bg-transparent z-10">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="p-1 text-slate-800 active:scale-90 transition-transform"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-3">
          <button className="p-1 text-slate-800 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <button 
            onClick={() => {
              const newTaskId = `DIA-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
              setTaskId(newTaskId);
              setMessages(prev => [...prev, {
                role: 'ai',
                content: '',
                type: 'diagnosis-card',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                contextTaskId: newTaskId
              }]);
            }}
            className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-md hover:bg-indigo-600 transition-colors"
          >
            <Stethoscope size={16} />
          </button>
        </div>
      </header>

      {/* Left Drawer */}
      <LeftDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-24 no-scrollbar">
        
        {/* Hero Section */}
        <div className="flex items-center justify-between mt-2 mb-6 px-1">
          <div>
            <h2 className="text-xl font-black text-slate-800 mb-1">嗨，我是您的智能助手</h2>
            <p className="text-slate-400 text-xs font-medium flex items-center gap-1">
              今天也要闪闪发光 <span className="text-yellow-400">✨</span>
            </p>
          </div>
          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-orange-100 to-white p-0.5 shadow-md relative flex-shrink-0">
             <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white">
                {/* Placeholder Avatar - Using a Bot icon as fallback if no image */}
                <img 
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo&backgroundColor=e0e7ff" 
                  alt="AI Avatar" 
                  className="w-full h-full object-cover"
                />
             </div>
             <div className="absolute bottom-0 right-0 bg-orange-400 text-white p-1 rounded-full border border-white shadow-sm">
                <Bot size={8} fill="currentColor" />
             </div>
          </div>
        </div>

        {/* Project Card */}
        <div 
          onClick={handleStartFormalSOP}
          className="w-full bg-white rounded-xl p-4 border border-slate-100 shadow-sm mb-6 cursor-pointer active:scale-[0.99] transition-transform relative overflow-hidden group"
        >
          <div className="flex items-center justify-between relative z-10 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <BarChart3 size={16} className="text-blue-600" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 mb-0">当前项目</div>
                <div className="font-bold text-sm text-slate-800">西湖区高压变电站监测</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="grid grid-cols-5 gap-2 relative z-10">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 mb-1 scale-90">正常</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span className="text-sm font-bold text-slate-700">{stats[AlarmLevel.NORMAL]}</span>
              </div>
            </div>
            <div className="flex flex-col items-center border-l border-slate-100">
              <span className="text-[10px] text-slate-400 mb-1 scale-90">一级</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                <span className="text-sm font-bold text-slate-700">{stats[AlarmLevel.WARNING]}</span>
              </div>
            </div>
            <div className="flex flex-col items-center border-l border-slate-100">
              <span className="text-[10px] text-slate-400 mb-1 scale-90">二级</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                <span className="text-sm font-bold text-slate-700">{stats[AlarmLevel.DANGER]}</span>
              </div>
            </div>
            <div className="flex flex-col items-center border-l border-slate-100">
              <span className="text-[10px] text-slate-400 mb-1 scale-90">三级</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span className="text-sm font-bold text-slate-700">{stats[AlarmLevel.CRITICAL]}</span>
              </div>
            </div>
            <div className="flex flex-col items-center border-l border-slate-100">
              <span className="text-[10px] text-slate-400 mb-1 scale-90">无数据</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span className="text-sm font-bold text-slate-700">{stats[AlarmLevel.NO_DATA]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions List */}
        <div className="space-y-3 mb-8">
          {[
            { icon: <BarChart3 size={16} className="text-indigo-500" />, text: '总结今天的设备告警信息', bg: 'bg-indigo-50' },
            { icon: <BookOpen size={16} className="text-purple-500" />, text: '10kV开关柜的巡检标准是什么？', bg: 'bg-purple-50' },
            { icon: <Clock size={16} className="text-orange-500" />, text: '显示上周的消缺工单', bg: 'bg-orange-50' },
          ].map((item, idx) => (
            <button 
              key={idx}
              onClick={() => setInputValue(item.text)}
              className="w-full bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between active:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-slate-700">{item.text}</span>
              </div>
              <ChevronRight size={14} className="text-slate-300" />
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="space-y-6 pb-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-1 w-full`}>
              {msg.type === 'diagnosis-card' ? (
                <div className="max-w-[85%] w-full bg-white rounded-2xl overflow-hidden shadow-md border border-indigo-100 animate-in slide-in-from-bottom-2 fade-in duration-300">
                    {/* Card Header */}
                    <div className="bg-indigo-600 p-4 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
                       <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-6 -mb-6 blur-lg"></div>
                       
                       <div className="relative z-10 flex items-center justify-between mb-4">
                         <div className="flex items-center gap-2">
                           <div>
                             <h3 className="text-base font-bold text-white">准备开始智能诊断</h3>
                             <div className="text-[10px] text-white/60 font-mono mt-0.5">
                               TASK ID: {msg.contextTaskId || taskId || 'Generating...'}
                             </div>
                           </div>
                         </div>
                         <button 
                           onClick={() => handleDiagnosisExit(index)}
                           className="px-2 py-0.5 rounded-full border border-white/30 text-white text-[10px] hover:bg-white/10 transition-colors self-start"
                         >
                           退出
                         </button>
                       </div>
                       
                       <div className="flex flex-col items-center justify-center gap-3">
                          {/* Device Badge */}
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold shadow-sm backdrop-blur-sm ${
                            msg.contextDeviceName 
                              ? 'bg-white/20 border-white/30 text-white' 
                              : 'bg-slate-800/30 border-white/10 text-slate-300'
                          }`}>
                            <ScanLine size={12} />
                            {msg.contextDeviceName 
                              ? `🎯 目标设备：${msg.contextDeviceName}` 
                              : '🎯 目标设备：新设备 (待确定)'}
                          </div>

                          <img 
                            src="https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo&backgroundColor=transparent" 
                            alt="Doctor" 
                            className="w-20 h-20 object-contain drop-shadow-lg"
                          />
                       </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 pt-6">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-6 px-1">
                        <div className="text-slate-800">01 · 信息收集</div>
                        <div className="text-slate-300">»</div>
                        <div>02 · 互动分析</div>
                        <div className="text-slate-300">»</div>
                        <div>03 · 诊断建议</div>
                      </div>

                      <div className="mb-6 text-sm text-slate-600 leading-relaxed text-center">
                        <p>你好，现在进入AI诊室。我将深度了解设备当前情况。</p>
                        <p className="mt-2">首先需要您按照操作指导提供尽可能详细的信息，这有助于我提供更明确、更准确的诊断建议</p>
                      </div>

                      <button 
                        onClick={() => handleDiagnosisStart(index, msg.contextTaskId, msg.contextDeviceName)}
                        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all text-sm"
                      >
                        🚀 发起设备诊断
                      </button>
                    </div>
                </div>
              ) : msg.type === 'reference-card' ? (
                 <div className="max-w-[85%] bg-slate-100 rounded-2xl rounded-tr-none p-3 text-sm text-slate-600 border border-slate-200 shadow-sm animate-in slide-in-from-right-2 fade-in duration-300">
                    <div className="flex items-center gap-2 mb-1 text-indigo-600 font-bold">
                       <span className="w-4 h-4 flex items-center justify-center bg-indigo-100 rounded-full">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                       </span>
                       <span>{msg.content}</span>
                    </div>
                    <div className="text-xs text-slate-500 bg-white p-2 rounded-lg border border-slate-100 leading-relaxed">
                       {msg.subtext}
                    </div>
                 </div>
              ) : msg.type === 'interactive-card' ? (
                 <div className="max-w-[85%] flex flex-col gap-2 animate-in slide-in-from-left-2 fade-in duration-300">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700 leading-relaxed">
                       {msg.content}
                    </div>
                    {msg.actions && (
                       <div className="flex gap-2 flex-wrap pl-1">
                          {msg.actions.map((action, i) => (
                             <button 
                                key={i}
                                onClick={() => {
                                   if (action.type === 'quick-reply') {
                                      handleSendMessage(action.text);
                                   } else if (action.type === 'action' && action.action === 'start-diagnosis') {
                                      handleDiagnosisStart(index, undefined, action.payload?.equipmentName);
                                   }
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 border flex items-center gap-1 ${
                                   action.type === 'action' 
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 hover:bg-indigo-700' 
                                      : 'bg-slate-50 text-indigo-600 border-slate-200 hover:bg-slate-100'
                                }`}
                             >
                                {action.label}
                             </button>
                          ))}
                       </div>
                    )}
                 </div>
              ) : msg.type === 'diagnosis-step' ? null : (
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-white border border-gray-100' : 'bg-indigo-500 text-white'} p-4 rounded-2xl ${msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'} shadow-sm text-sm leading-relaxed`}>
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded" className="mb-3 rounded-lg max-h-48 object-cover w-full" />
                  )}
                  {msg.content}
                </div>
              )}
              <span className="text-[10px] text-slate-300 mx-1">{msg.timestamp}</span>
            </div>
          ))}
          {isLoading && (
            <div className="flex flex-col items-start gap-1">
              <div className="bg-indigo-500 text-white p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">正在分析...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

      </div>

      {/* Bottom Input Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[30px] z-20">
        {/* Image/File Preview */}
        {(selectedImage || selectedFile) && (
          <div className="mb-3 relative inline-block">
            {selectedImage ? (
              <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-slate-200" />
            ) : (
              <div className="h-16 w-16 flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200">
                <FileText size={24} className="text-slate-400" />
              </div>
            )}
            <button 
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-0.5 shadow-md"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 h-12 bg-slate-50 rounded-full flex items-center px-2 border border-slate-100 focus-within:border-indigo-300 transition-colors">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-200 transition-colors">
              <div className="flex gap-0.5 items-center h-4">
                 <span className="w-0.5 h-2 bg-slate-800 rounded-full"></span>
                 <span className="w-0.5 h-4 bg-slate-800 rounded-full"></span>
                 <span className="w-0.5 h-2 bg-slate-800 rounded-full"></span>
              </div>
            </button>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={selectedImage || selectedFile ? "请描述这个文件..." : "对话内容已开启隐私保护"}
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 h-full px-2"
            />
            {inputValue || selectedImage || selectedFile ? (
               <button 
                onClick={() => handleSendMessage()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors"
               >
                 <Send size={20} />
               </button>
            ) : (
               <button 
                 onClick={triggerAttachmentInput}
                 className="w-10 h-10 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-200 transition-colors"
               >
                 <Plus size={20} strokeWidth={2.5} />
               </button>
            )}
          </div>
          
          {/* Camera Input */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          
          {/* Attachment Input */}
          <input 
            type="file" 
            className="hidden" 
            ref={attachmentInputRef}
            onChange={handleAttachmentUpload}
          />

          <button 
            onClick={triggerFileInput}
            className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800 shadow-sm hover:bg-slate-100 active:scale-95 transition-all"
          >
            <Camera size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Unified Diagnostic Task View Overlay */}
      {diagnosisSession && (
        <Unified_Diagnostic_Task_View 
          session={diagnosisSession}
          onUpdateSession={handleSessionUpdate}
          onNextStep={handleNextStep}
          onExit={() => handleDiagnosisExit(undefined, true)}
          onOpenCamera={handleOpenCamera}
        />
      )}

      {/* Camera Overlay */}
      <CameraOverlay 
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        hintText={cameraHint}
      />

    </div>
  );
};

export default AI_Home_Page;
