import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Image as ImageIcon, FileText, X, Mic, Check, ChevronRight, Scan, 
  Brain, Activity, CheckCircle, AlertTriangle, Send, Edit, Archive, ArrowRight, Sparkles,
  FileCheck, AlertOctagon
} from 'lucide-react';

// --- Types ---

export interface DiagnosisSession {
  id: string;
  step: number;
  data: {
    nameplatePhotos: string[];
    diagramPhotos: string[];
    doorGapPhotos: string[];
    cableCompartmentPhotos: string[];
    audioTranscript: string;
    tags: string[];
    extraSlots: { id: string; title: string; photos: string[] }[];
    iotDeviceName?: string;
    assetPlateName?: string;
    equipmentAge?: string;
  };
}

// --- Helper Functions ---

export const generateDiagnosisId = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DIA-${dateStr}-${randomStr}`;
};

// --- Components ---

interface CameraOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photo: string) => void;
  hintText: string;
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({ isOpen, onClose, onCapture, hintText }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      console.error("Camera access error:", err);
      setError('无法访问摄像头，请检查权限或使用文件上传');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
        onClose();
      }
    } else if (error) {
       // Fallback for demo if camera fails
       // In a real app, we'd trigger a file input click here
       alert("模拟拍摄：已生成示例图片");
       onCapture("https://picsum.photos/400/300"); // Placeholder
       onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-end z-10">
        <button onClick={onClose} className="text-white p-2">
          <X size={24} />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-gray-900">
        {stream ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-center p-4">
            <p className="mb-2">{error || "正在启动摄像头..."}</p>
            {error && <p className="text-xs text-gray-400">点击下方拍照按钮模拟拍摄</p>}
          </div>
        )}
        
        {/* Guide Frame */}
        <div className="absolute inset-8 border-2 border-white/30 rounded-lg pointer-events-none flex flex-col justify-between p-4">
           <div className="flex justify-between">
             <div className="w-4 h-4 border-t-2 border-l-2 border-yellow-400"></div>
             <div className="w-4 h-4 border-t-2 border-r-2 border-yellow-400"></div>
           </div>
           <div className="flex justify-between">
             <div className="w-4 h-4 border-b-2 border-l-2 border-yellow-400"></div>
             <div className="w-4 h-4 border-b-2 border-r-2 border-yellow-400"></div>
           </div>
        </div>

        {/* Hint Text */}
        <div className="absolute bottom-4 left-0 right-0 text-center px-4">
          <p className="text-white text-sm bg-black/50 py-1 px-3 rounded-full inline-block backdrop-blur-sm">
            {hintText}
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="h-32 bg-black flex items-center justify-between px-10 pb-4">
        {/* Album */}
        <button className="flex flex-col items-center gap-1 text-white/80 active:scale-95 transition-transform">
          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-700">
            <ImageIcon size={20} />
          </div>
          <span className="text-[10px]">相册</span>
        </button>

        {/* Shutter */}
        <button 
          onClick={handleCapture}
          className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          <div className="w-14 h-14 rounded-full border-2 border-black"></div>
        </button>

        {/* File */}
        <button className="flex flex-col items-center gap-1 text-white/80 active:scale-95 transition-transform">
          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-700">
            <FileText size={20} />
          </div>
          <span className="text-[10px]">文件</span>
        </button>
      </div>
    </div>
  );
};

interface TaskSlotProps {
  title: string;
  hint: string;
  photos: string[];
  onAddPhoto: () => void;
  maxPhotos?: number;
}

const TaskSlot: React.FC<TaskSlotProps> = ({ title, hint, photos, onAddPhoto, maxPhotos = 4 }) => {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-slate-700">{title}</h4>
        <span className="text-[10px] text-slate-400">{photos.length}/{maxPhotos}</span>
      </div>
      <p className="text-[10px] text-slate-500 mb-3 leading-tight">{hint}</p>
      
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {photos.map((photo, idx) => (
          <div key={idx} className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 relative">
            <img src={photo} alt={`Evidence ${idx}`} className="w-full h-full object-cover" />
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <button 
            onClick={onAddPhoto}
            className="w-16 h-16 flex-shrink-0 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <Scan size={20} />
            <span className="text-[8px] mt-1">采集</span>
          </button>
        )}
      </div>
    </div>
  );
};

// --- New Components for Step 4 & 5 ---

const InteractiveAnalysisView: React.FC<{ onNext: () => void, onExit: () => void }> = ({ onNext, onExit }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isReasoningFinished, setIsReasoningFinished] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const logMessages = [
      '提取单线图拓扑...',
      '结合高湿与跃变...',
      '确诊为凝露沿面放电'
    ];

    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < logMessages.length) {
        setLogs(prev => [...prev, logMessages[currentLog]]);
        currentLog++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsReasoningFinished(true), 1000);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-indigo-600 p-3 flex items-center justify-between">
        <h3 className="text-white font-bold text-sm">📍 Step 4：互动分析</h3>
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-xs">02 · 互动分析</span>
          <button 
            onClick={onExit} 
            className="px-2 py-0.5 rounded-full border border-white/30 text-white text-[10px] hover:bg-white/10 transition-colors"
          >
            退出
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Fusion Panel */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Brain size={14} className="text-indigo-500" /> 融合推理中...
            </span>
            <Activity size={14} className="text-indigo-500 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">M2M 机理特征</span>
                <span className="text-xs font-bold text-slate-700">TEV 跃变确认</span>
              </div>
              <CheckCircle size={14} className="text-green-500 ml-auto" />
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">H2M 现场特征</span>
                <span className="text-xs font-bold text-slate-700">高湿录音</span>
              </div>
              <CheckCircle size={14} className="text-green-500 ml-auto" />
            </div>
          </div>
        </div>

        {/* CoT Log Area */}
        <div className="bg-slate-900 rounded-xl p-3 mb-4 font-mono text-xs text-green-400 min-h-[80px]">
          {logs.map((log, idx) => (
            <div key={idx} className="mb-1 animate-in fade-in slide-in-from-left-2">
              <span className="opacity-50 mr-2">{'>'}</span>{log}
            </div>
          ))}
          {!isReasoningFinished && (
            <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-2 align-middle" />
          )}
        </div>

        {/* AI Interaction Area */}
        {isReasoningFinished && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 border border-indigo-200">
                <img 
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo&backgroundColor=transparent" 
                  alt="AI" 
                  className="w-8 h-8"
                />
              </div>
              <div className="bg-indigo-50 p-3 rounded-2xl rounded-tl-none border border-indigo-100 text-sm text-slate-700 leading-relaxed shadow-sm">
                <p>王工，结合边缘特征与现场表象，初步推断为<span className="font-bold text-indigo-700">「凝露引发的沿面放电」</span>。</p>
                <p className="mt-2">请问现场是否还有其他异常（如特殊气味）需要补充？如果没有，可直接生成工作票。</p>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="space-y-3">
              <button 
                onClick={onNext}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Sparkles size={16} />
                没有补充，生成诊断报告与工作票
              </button>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-10 bg-slate-50 rounded-full border border-slate-200 flex items-center px-3">
                   <input 
                     type="text" 
                     value={inputValue}
                     onChange={(e) => setInputValue(e.target.value)}
                     placeholder="输入补充信息..."
                     className="flex-1 bg-transparent border-none outline-none text-xs text-slate-700"
                   />
                </div>
                <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:bg-slate-200">
                  <Mic size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white active:bg-indigo-700 shadow-md">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DiagnosticAdviceView: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-green-600 p-3 flex items-center justify-between">
        <h3 className="text-white font-bold text-sm">📍 Step 5：诊断建议</h3>
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-xs">03 · 诊断建议</span>
          <button 
            onClick={onExit} 
            className="px-2 py-0.5 rounded-full border border-white/30 text-white text-[10px] hover:bg-white/10 transition-colors"
          >
            退出
          </button>
        </div>
      </div>

      <div className="p-4 pb-20 relative">
        {/* Conclusion Card */}
        <div className="bg-orange-50 rounded-xl p-4 border-l-4 border-orange-500 mb-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-bold text-orange-800 flex items-center gap-2">
              <AlertTriangle size={16} />
              确诊结论
            </h4>
            <span className="bg-orange-200 text-orange-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              AI 置信度 96%
            </span>
          </div>
          <p className="text-lg font-black text-slate-800 mb-1">
            绝缘件受潮引发沿面放电
          </p>
          <p className="text-xs text-slate-500">
            综合 TEV 幅值跃变与现场高湿环境，特征匹配度极高。
          </p>
        </div>

        {/* Work Ticket Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-md p-0 overflow-hidden mb-4 relative">
          {/* Ticket Header */}
          <div className="bg-slate-50 p-3 border-b border-slate-100 border-dashed flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <FileCheck size={14} className="text-blue-500" />
              AI 辅助消缺工作票
            </span>
            <span className="text-[10px] font-mono text-slate-400">NO.20260225-001</span>
          </div>
          
          {/* Ticket Body */}
          <div className="p-4 space-y-4">
             <div>
               <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-1">隔离点建议</h5>
               <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 text-xs text-blue-800 flex items-start gap-2">
                 <AlertOctagon size={14} className="mt-0.5 flex-shrink-0" />
                 <div>
                   <p className="font-bold">建议断开 10kV 进线柜断路器</p>
                   <p className="opacity-80 mt-0.5">需同步确认备自投状态，防止非预期合闸。</p>
                 </div>
               </div>
             </div>

             <div>
               <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-1">标准消缺步骤</h5>
               <ul className="space-y-2">
                 {[
                   '穿戴绝缘防护装备，开启柜门',
                   '使用工业热风枪对绝缘子表面进行干燥处理',
                   '检查加热器回路是否正常工作',
                   '复测 TEV 数值，确认下降至 20dBmV 以下'
                 ].map((step, i) => (
                   <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                     <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">
                       {i + 1}
                     </span>
                     {step}
                   </li>
                 ))}
               </ul>
             </div>
          </div>

          {/* Ticket Footer (Perforation) */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent to-transparent bg-[length:10px_100%] bg-repeat-x border-t border-slate-200 border-dashed"></div>
        </div>

        {/* Bottom Operation Bar */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-3">
          <button className="flex-1 bg-white border border-blue-200 text-blue-600 font-bold py-3 rounded-xl shadow-sm active:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm">
            <Edit size={16} />
            修改内容
          </button>
          <button 
            onClick={onExit}
            className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Archive size={16} />
            确认签发并归档
          </button>
        </div>
      </div>
    </div>
  );
};

interface DiagnosisStepCardProps {
  step: number;
  data: DiagnosisSession['data'];
  onUpdateData: (newData: Partial<DiagnosisSession['data']>) => void;
  onNext: () => void;
  onOpenCamera: (hint: string, targetField: keyof DiagnosisSession['data']) => void;
  isActive?: boolean;
  onExit: () => void;
}

export const DiagnosisStepCard: React.FC<DiagnosisStepCardProps> = ({ 
  step, data, onUpdateData, onNext, onOpenCamera, isActive = true, onExit
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const handleRecordStart = () => {
    setIsRecording(true);
    setRecordingTime(0);
    // Simulate recording logic in parent or here
  };

  const handleRecordEnd = () => {
    setIsRecording(false);
    // Simulate transcription
    const mockText = "这两天一直下大雨，没闻到什么味道，但靠近下门缝能听到轻微的嗞嗞声。";
    onUpdateData({ 
      audioTranscript: mockText,
      tags: ['连续降雨/高湿', '嗞嗞声/噼啪声', '无明显异味']
    });
  };

  // Timer for recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  if (step === 1) {
    return (
      <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-blue-600 p-3 flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">📍 Step 1：档案与电气拓扑采集</h3>
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-xs">1/3</span>
            <button 
              onClick={onExit} 
              className="px-2 py-0.5 rounded-full border border-white/30 text-white text-[10px] hover:bg-white/10 transition-colors"
            >
              退出
            </button>
          </div>
        </div>
        <div className="p-4">
          <TaskSlot 
            title="拍摄设备铭牌" 
            hint="用于 OCR 提取型号、服役年限与生产厂家"
            photos={data.nameplatePhotos}
            onAddPhoto={() => onOpenCamera("请对准设备铭牌，保证文字清晰", 'nameplatePhotos')}
          />
          <TaskSlot 
            title="拍摄一次主接线图 / 二次接线图" 
            hint="请拍摄贴在柜门上的单线图，或从资料夹拍摄。AI 将据此评估停电影响范围与安全隔离点。"
            photos={data.diagramPhotos}
            onAddPhoto={() => onOpenCamera("请拍摄单线图，保证线条清晰", 'diagramPhotos')}
          />
          <button 
            onClick={isActive ? onNext : undefined}
            className={`w-full mt-2 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${isActive ? 'bg-blue-600 text-white active:scale-[0.98]' : 'bg-blue-600/80 text-white/90'}`}
          >
            {isActive ? "下一步" : "修改"}
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-indigo-600 p-3 flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">📍 Step 2：表观病理特征取证</h3>
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-xs">2/3</span>
            <button 
              onClick={onExit} 
              className="px-2 py-0.5 rounded-full border border-white/30 text-white text-[10px] hover:bg-white/10 transition-colors"
            >
              退出
            </button>
          </div>
        </div>
        <div className="p-4">
          <TaskSlot 
            title="拍摄下门缝及观察窗" 
            hint="请重点对焦是否生锈、是否有水珠凝露"
            photos={data.doorGapPhotos}
            onAddPhoto={() => onOpenCamera("请对准下门缝或观察窗", 'doorGapPhotos')}
          />
          <TaskSlot 
            title="拍摄电缆室/母线室外部" 
            hint="观察是否有放电留下的白色/黑色粉末痕迹"
            photos={data.cableCompartmentPhotos}
            onAddPhoto={() => onOpenCamera("请寻找白色或黑色粉末痕迹", 'cableCompartmentPhotos')}
          />
          <button 
            onClick={isActive ? onNext : undefined}
            className={`w-full mt-2 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${isActive ? 'bg-indigo-600 text-white active:scale-[0.98]' : 'bg-indigo-600/80 text-white/90'}`}
          >
            {isActive ? "下一步" : "修改"}
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-purple-600 p-3 flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">📍 Step 3：现场多维感官排查</h3>
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-xs">3/3</span>
            <button 
              onClick={onExit} 
              className="px-2 py-0.5 rounded-full border border-white/30 text-white text-[10px] hover:bg-white/10 transition-colors"
            >
              退出
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4 flex flex-col items-center justify-center">
            <p className="text-xs text-slate-500 mb-4 text-center">
              请口述：<br/>1. 是否有嗞嗞声/噼啪声？<br/>2. 是否有臭氧味或焦糊味？<br/>3. 近期是否连雨天或高湿？
            </p>
            
            <button 
              onMouseDown={handleRecordStart}
              onMouseUp={handleRecordEnd}
              onTouchStart={handleRecordStart}
              onTouchEnd={handleRecordEnd}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-red-500 scale-110' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              <Mic size={32} className="text-white" />
            </button>
            <p className="text-[10px] text-slate-400 mt-2">
              {isRecording ? `正在录音... ${recordingTime}s` : "按住描述现场异况"}
            </p>
          </div>

          {data.audioTranscript && (
            <div className="mb-4 animate-in fade-in zoom-in duration-300">
              <div className="text-xs text-slate-600 bg-slate-100 p-3 rounded-lg mb-3 italic">
                "{data.audioTranscript}"
              </div>
              <div className="flex flex-wrap gap-2">
                {['连续降雨/高湿', '嗞嗞声/噼啪声', '无明显异味'].map(tag => (
                  <span key={tag} className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded-full flex items-center gap-1 border border-green-200">
                    <Check size={10} /> {tag}
                  </span>
                ))}
                {['焦糊味', '臭氧味'].map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-400 text-[10px] rounded-full flex items-center gap-1 border border-slate-200">
                    <X size={10} /> {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={isActive ? onNext : undefined}
            disabled={isActive && !data.audioTranscript}
            className={`w-full mt-2 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${isActive ? (data.audioTranscript ? 'bg-purple-600 text-white active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed') : 'bg-purple-600/80 text-white/90'}`}
          >
            {isActive ? "完成采集，开始诊断" : "修改"}
          </button>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return <InteractiveAnalysisView onNext={onNext} onExit={onExit} />;
  }

  if (step === 5) {
    return <DiagnosticAdviceView onExit={onExit} />;
  }

  return null;
};
