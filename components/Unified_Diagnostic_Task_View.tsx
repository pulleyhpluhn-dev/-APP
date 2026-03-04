import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronDown, CheckCircle, Camera, Mic, Brain, Activity, 
  Sparkles, AlertTriangle, FileCheck, AlertOctagon, Edit, Archive,
  ChevronRight, Play, Pause, Check, Plus, Trash2, RefreshCw, Send,
  Image as ImageIcon, Edit2, Save, ScanLine, Zap
} from 'lucide-react';
import { DiagnosisSession } from './DiagnosisComponents';

interface UnifiedDiagnosticTaskViewProps {
  session: DiagnosisSession;
  onUpdateSession: (updates: Partial<DiagnosisSession> & { data?: Partial<DiagnosisSession['data']> }) => void;
  onNextStep: () => void;
  onExit: () => void;
  onOpenCamera: (hint: string, targetField: keyof DiagnosisSession['data'], slotId?: string) => void;
}

const Unified_Diagnostic_Task_View: React.FC<UnifiedDiagnosticTaskViewProps> = ({
  session,
  onUpdateSession,
  onNextStep,
  onExit,
  onOpenCamera
}) => {
  const [isReasoningFinished, setIsReasoningFinished] = useState(false);
  const [cotLogs, setCotLogs] = useState<string[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [expandedStep, setExpandedStep] = useState(session.step);
  const [showToast, setShowToast] = useState<string | null>(null);
  
  // OCR State
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [showTopologyAlert, setShowTopologyAlert] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync expandedStep with session.step when progressing forward
  useEffect(() => {
    if (session.step > expandedStep) {
      setExpandedStep(session.step);
    }
  }, [session.step]);

  // Auto-scroll to active step
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = document.getElementById(`step-${expandedStep}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [expandedStep]);

  // Toast Timer
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleSaveAndExit = () => {
    console.log("Saving draft...", session);
    onExit();
  };

  // Wrapper for data updates to handle invalidation
  const handleDataChange = (newData: Partial<DiagnosisSession['data']>) => {
    // Check for invalidation: if we are editing a previous step (1, 2, 3) and current progress is beyond that (4 or 5)
    if (session.step > 3 && expandedStep <= 3) {
      // Invalidate Step 4 & 5
      onUpdateSession({
        step: 3, // Reset to Step 3
        data: newData
      });
      setShowToast("证据链已更新，为保证准确性，AI 需要重新进行融合推理。");
      setIsReasoningFinished(false);
      setCotLogs([]);
    } else {
      // Normal update
      onUpdateSession({ data: newData });
    }
  };

  const handleStepEdit = (step: number) => {
    setExpandedStep(step);
  };

  const handleSaveReturn = () => {
    // Collapse current, expand latest
    setExpandedStep(session.step);
  };

  // Simulate OCR when nameplate photo is added
  const handleNameplateAdd = () => {
    onOpenCamera("拍摄设备铭牌", 'nameplatePhotos');
  };

  // Watch for nameplate photos to trigger OCR
  useEffect(() => {
    if (session.data.nameplatePhotos.length > 0 && !session.data.assetPlateName && !isOcrProcessing) {
      setIsOcrProcessing(true);
      setTimeout(() => {
        handleDataChange({
          assetPlateName: '10kV-04出线柜',
          equipmentAge: '14年'
        });
        setIsOcrProcessing(false);
        setShowTopologyAlert(true);
        setShowToast("已自动识别设备台账信息");
      }, 1500);
    }
  }, [session.data.nameplatePhotos]);

  // Helper to determine stage
  const currentStage = session.step <= 3 ? 1 : session.step === 4 ? 2 : 3;

  // Render Functions for Steps
  const renderStep1Content = () => (
    <div className="space-y-4 mt-3">
      <MediaGridSlot 
        title="📷 拍摄设备铭牌"
        hint="用于 OCR 提取型号、服役年限与生产厂家"
        photos={session.data.nameplatePhotos}
        onAdd={handleNameplateAdd}
        onRemove={(idx) => {
          const newPhotos = [...session.data.nameplatePhotos];
          newPhotos.splice(idx, 1);
          handleDataChange({ nameplatePhotos: newPhotos });
        }}
        max={10}
        isProcessing={isOcrProcessing}
        processingText="正在提取台账..."
      />
      
      {/* Topology Mapping Alert */}
      {showTopologyAlert && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="bg-green-100 p-1 rounded-full text-green-600 mt-0.5">
            <ScanLine size={12} />
          </div>
          <div className="text-xs text-green-800 leading-relaxed">
            <span className="font-bold">🔗 全息拓扑映射已建立</span>
            <div className="mt-1 opacity-90">
              AI 已自动将监测节点 <span className="font-bold">[{session.data.iotDeviceName || '未知节点'}]</span> 与物理资产 <span className="font-bold">[{session.data.assetPlateName}]</span> 关联。
            </div>
          </div>
        </div>
      )}

      <MediaGridSlot 
        title="📷 拍摄一次主接线图"
        hint="用于提取电气拓扑结构"
        photos={session.data.diagramPhotos}
        onAdd={() => onOpenCamera("拍摄一次主接线图", 'diagramPhotos')}
        onRemove={(idx) => {
          const newPhotos = [...session.data.diagramPhotos];
          newPhotos.splice(idx, 1);
          handleDataChange({ diagramPhotos: newPhotos });
        }}
        max={10}
      />
    </div>
  );

  const renderStep2Content = () => (
    <div className="space-y-4 mt-3">
      <MediaGridSlot 
        title="📷 拍摄下门缝及观察窗"
        hint="请重点对焦是否生锈、是否有水珠凝露"
        photos={session.data.doorGapPhotos}
        onAdd={() => onOpenCamera("拍摄下门缝及观察窗", 'doorGapPhotos')}
        onRemove={(idx) => {
          const newPhotos = [...session.data.doorGapPhotos];
          newPhotos.splice(idx, 1);
          handleDataChange({ doorGapPhotos: newPhotos });
        }}
        max={10}
      />
      <MediaGridSlot 
        title="📷 拍摄电缆室外部"
        hint="拍摄电缆室外观全景"
        photos={session.data.cableCompartmentPhotos}
        onAdd={() => onOpenCamera("拍摄电缆室外部", 'cableCompartmentPhotos')}
        onRemove={(idx) => {
          const newPhotos = [...session.data.cableCompartmentPhotos];
          newPhotos.splice(idx, 1);
          handleDataChange({ cableCompartmentPhotos: newPhotos });
        }}
        max={10}
      />
      
      {/* Dynamic Slots */}
      {session.data.extraSlots?.map((slot, index) => (
        <MediaGridSlot 
          key={slot.id}
          title={`📷 ${slot.title || '其他异常部位'}`}
          hint="拍摄其他发现的异常点"
          photos={slot.photos}
          onAdd={() => onOpenCamera(slot.title, 'extraSlots', slot.id)}
          onRemove={(photoIdx) => {
            const newSlots = [...(session.data.extraSlots || [])];
            newSlots[index].photos.splice(photoIdx, 1);
            handleDataChange({ extraSlots: newSlots });
          }}
          onDeleteSlot={() => {
            const newSlots = [...(session.data.extraSlots || [])];
            newSlots.splice(index, 1);
            handleDataChange({ extraSlots: newSlots });
          }}
          max={10}
        />
      ))}

      <button 
        onClick={() => {
          const newSlot = { id: Date.now().toString(), title: '其他异常部位', photos: [] };
          handleDataChange({ extraSlots: [...(session.data.extraSlots || []), newSlot] });
        }}
        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.99]"
      >
        <Plus size={16} /> 添加其他异常部位 (选填)
      </button>
    </div>
  );

  const renderStep3Content = () => (
    <Step3_Sensory 
      session={session} 
      onUpdateData={handleDataChange} 
    />
  );

  const renderStep4Content = () => (
    <Step4_Interactive 
      session={session}
      onFinished={() => setIsReasoningFinished(true)}
    />
  );

  const renderStep5Content = () => (
    <Step5_Advice session={session} onExit={onExit} />
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-300">
           <RefreshCw size={14} className="animate-spin" />
           <span className="text-xs font-bold">{showToast}</span>
        </div>
      )}

      {/* Main Card Container - Bottom Sheet Style */}
      <div className="w-full h-[92vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom-full duration-500">
        
        {/* Sticky Header */}
        <div className="bg-white z-20 border-b border-slate-100 sticky top-0">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">TASK ID</span>
                <span className="text-xs font-bold text-slate-700 font-mono">{session.id}</span>
              </div>
              
              {/* Equipment Badge */}
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold transition-all duration-500 ${
                session.data.assetPlateName 
                  ? 'bg-blue-50 border-blue-100 text-blue-600 animate-in zoom-in spring-bounce' 
                  : 'bg-slate-50 border-slate-100 text-slate-400'
              }`}>
                <ScanLine size={10} />
                {(() => {
                  const { iotDeviceName, assetPlateName } = session.data;
                  if (iotDeviceName && assetPlateName) {
                    return `🎯 ${iotDeviceName} | 资产名: ${assetPlateName}`;
                  } else if (iotDeviceName) {
                    return `🎯 目标设备：${iotDeviceName}`;
                  } else if (assetPlateName) {
                    return `🎯 资产名：${assetPlateName}`;
                  } else {
                    return '🎯 目标设备：新设备 (待识别)';
                  }
                })()}
              </div>
            </div>
            <button onClick={() => setShowExitConfirm(true)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-500">
              <X size={16} />
            </button>
          </div>
          
          {/* Global Stage Indicator */}
          <div className="px-4 pb-3 flex items-center justify-between text-[10px] font-medium text-slate-400">
            <span className={currentStage === 1 ? 'text-blue-600 font-bold' : ''}>01·信息收集</span>
            <ChevronRight size={12} />
            <span className={currentStage === 2 ? 'text-indigo-600 font-bold' : ''}>02·互动分析</span>
            <ChevronRight size={12} />
            <span className={currentStage === 3 ? 'text-green-600 font-bold' : ''}>03·诊断建议</span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-1 bg-slate-100 w-full">
            <div 
              className={`h-full transition-all duration-500 ${
                currentStage === 1 ? 'bg-blue-500 w-1/3' : 
                currentStage === 2 ? 'bg-indigo-500 w-2/3' : 'bg-green-500 w-full'
              }`}
            />
          </div>
        </div>

        {/* Vertical Stepper Body */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth pb-32">
          
          {/* Step 1 */}
          <StepperItem 
            step={1} 
            expandedStep={expandedStep}
            title="档案与电气拓扑采集"
            isCompleted={session.step > 1}
            summary={`${session.data.nameplatePhotos.length + session.data.diagramPhotos.length} 张照片已采集`}
            onModify={() => handleStepEdit(1)}
            onSaveReturn={handleSaveReturn}
          >
            {renderStep1Content()}
          </StepperItem>

          {/* Step 2 */}
          <StepperItem 
            step={2} 
            expandedStep={expandedStep}
            title="表观病理特征取证"
            isCompleted={session.step > 2}
            summary={`${session.data.doorGapPhotos.length + session.data.cableCompartmentPhotos.length + (session.data.extraSlots?.reduce((acc, slot) => acc + slot.photos.length, 0) || 0)} 张照片已采集`}
            onModify={() => handleStepEdit(2)}
            onSaveReturn={handleSaveReturn}
          >
            {renderStep2Content()}
          </StepperItem>

          {/* Step 3 */}
          <StepperItem 
            step={3} 
            expandedStep={expandedStep}
            title="现场多维感官排查"
            isCompleted={session.step > 3}
            summary={session.data.audioTranscript ? "已完成录音与标签提取" : ""}
            onModify={() => handleStepEdit(3)}
            onSaveReturn={handleSaveReturn}
          >
            {renderStep3Content()}
          </StepperItem>

          {/* Step 4 (Only visible if stage >= 2) */}
          {session.step >= 4 && (
            <StepperItem 
              step={4} 
              expandedStep={expandedStep}
              title="互动分析与 CoT 推理"
              isCompleted={session.step > 4}
              summary="AI 推理完成"
              color="indigo"
            >
              {renderStep4Content()}
            </StepperItem>
          )}

          {/* Step 5 (Only visible if stage >= 3) */}
          {session.step >= 5 && (
            <StepperItem 
              step={5} 
              expandedStep={expandedStep}
              title="诊断建议与工作票"
              isCompleted={false}
              summary=""
              color="green"
            >
              {renderStep5Content()}
            </StepperItem>
          )}
          
        </div>

        {/* Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {expandedStep === 1 && (
             <ActionButton onClick={onNextStep} label="下一步" color="blue" />
          )}
          {expandedStep === 2 && (
             <ActionButton onClick={onNextStep} label="下一步" color="indigo" />
          )}
          {expandedStep === 3 && (
             <ActionButton 
               onClick={onNextStep} 
               label="完成采集，开始诊断" 
               color="purple" 
               disabled={!session.data.audioTranscript}
             />
          )}
          {expandedStep === 4 && (
             <ActionButton 
               onClick={onNextStep} 
               label="✨ 没有补充，进入诊断建议" 
               color="indigo" 
               icon={<Sparkles size={16} />} 
             />
          )}
          {expandedStep === 5 && (
             <div className="hidden"></div>
          )}
        </div>
      </div>

      {/* Exit Confirm Dialog */}
      {showExitConfirm && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 text-red-500">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">⚠️ 退出当前诊断任务？</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                您当前正在执行设备诊断任务。退出后，尚未生成的诊断结论和已采集的现场证据（照片、录音等）将会丢失。
              </p>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-slate-500 text-xs font-bold whitespace-nowrap active:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={onExit}
                className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold whitespace-nowrap active:bg-red-100 transition-colors"
              >
                直接退出
              </button>
              <button 
                onClick={handleSaveAndExit}
                className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 whitespace-nowrap active:scale-[0.98] transition-all"
              >
                暂存并退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-components ---

const MediaGridSlot: React.FC<{
  title: string;
  hint: string;
  photos: string[];
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onDeleteSlot?: () => void;
  max: number;
}> = ({ title, hint, photos, onAdd, onRemove, onDeleteSlot, max }) => (
  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 relative group">
    {onDeleteSlot && (
      <button 
        onClick={onDeleteSlot}
        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition-colors"
      >
        <Trash2 size={14} />
      </button>
    )}
    <div className="flex items-center justify-between mb-2">
      <div>
        <h4 className="text-xs font-bold text-slate-700">{title}</h4>
        <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>
      </div>
      <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-100">
        {photos.length}/{max}
      </span>
    </div>
    
    <div className="flex flex-wrap gap-2">
      {/* Add Button */}
      {photos.length < max && (
        <button 
          onClick={onAdd}
          className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all active:scale-95"
        >
          <Plus size={20} />
        </button>
      )}
      
      {/* Photo Thumbnails */}
      {photos.map((photo, idx) => (
        <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden relative border border-slate-200 shadow-sm group/photo animate-in fade-in zoom-in duration-300">
          <img src={photo} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
          <button 
            onClick={() => onRemove(idx)}
            className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors opacity-0 group-hover/photo:opacity-100"
          >
            <X size={10} />
          </button>
        </div>
      ))}
    </div>
  </div>
);

const Step3_Sensory: React.FC<{
  session: DiagnosisSession;
  onUpdateData: (data: Partial<DiagnosisSession['data']>) => void;
}> = ({ session, onUpdateData }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showTags, setShowTags] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  // Simulate Typewriter Effect
  useEffect(() => {
    if (transcript && !isRecording) {
      // If transcript is set but tags are not shown yet, trigger tag animation after delay
      if (!showTags) {
        const timer = setTimeout(() => {
          setShowTags(true);
          setTags(['🌧️ 连雨天气', '🔊 嗞嗞放电声', '👃 无异味']);
          onUpdateData({ 
            audioTranscript: transcript,
            tags: ['🌧️ 连雨天气', '🔊 嗞嗞放电声', '👃 无异味']
          });
        }, 1500); // Wait for typewriter to finish roughly
        return () => clearTimeout(timer);
      }
    }
  }, [transcript, isRecording, showTags]);

  const handleRecordStart = () => {
    setIsRecording(true);
    setTranscript('');
    setShowTags(false);
    setTags([]);
  };

  const handleRecordEnd = () => {
    setIsRecording(false);
    // Simulate typewriter effect
    const fullText = "这两天一直下雨，柜子里面有嗞嗞的放电声，没闻到什么味道。";
    let currentText = "";
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        currentText += fullText[i];
        setTranscript(currentText);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  const handleReset = () => {
    setTranscript('');
    setShowTags(false);
    setTags([]);
    onUpdateData({ audioTranscript: '', tags: [] });
  };

  return (
    <div className="mt-3">
      <p className="text-xs text-slate-500 mb-4 text-center">
        请按住麦克风，描述现场是否有以下情况：<br/>
        1. 嗞嗞声或噼啪声；2. 臭氧或焦糊味；3. 近期是否连雨天。
      </p>
      
      <div className="flex flex-col items-center justify-center mb-4 relative">
        {/* Ripple Effect */}
        {isRecording && (
          <div className="absolute w-24 h-24 bg-purple-200 rounded-full animate-ping opacity-75"></div>
        )}
        <button 
          onMouseDown={handleRecordStart}
          onMouseUp={handleRecordEnd}
          onTouchStart={handleRecordStart}
          onTouchEnd={handleRecordEnd}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all z-10 
            ${isRecording ? 'bg-purple-600 scale-110' : 'bg-purple-500 hover:bg-purple-600'}
          `}
        >
          <Mic size={32} className="text-white" />
        </button>
        <span className="text-[10px] text-slate-400 mt-2 font-bold">
          {isRecording ? "正在录音..." : "🎙️ 按住说话"}
        </span>
      </div>

      {/* Transcript Bubble */}
      {(transcript || isRecording) && (
        <div className="bg-slate-100 rounded-xl rounded-tl-none p-3 mb-3 text-xs text-slate-700 leading-relaxed relative animate-in fade-in slide-in-from-left-2">
          {transcript}
          {isRecording && <span className="inline-block w-1.5 h-3 bg-slate-400 animate-pulse ml-1 align-middle"/>}
        </div>
      )}

      {/* Tags Area */}
      {showTags && (
        <div className="flex flex-wrap gap-2 justify-center">
          {tags.map((tag, idx) => (
            <span 
              key={idx} 
              className={`px-3 py-1.5 text-[10px] font-bold rounded-full flex items-center gap-1 border shadow-sm animate-in zoom-in spring-bounce duration-500
                ${tag.includes('无') ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-green-100 text-green-700 border-green-200'}
              `}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Reset Button */}
      {transcript && !isRecording && (
        <div className="flex justify-center mt-4">
          <button onClick={handleReset} className="text-[10px] text-slate-400 flex items-center gap-1 hover:text-slate-600">
            <RefreshCw size={10} /> 重新录音
          </button>
        </div>
      )}
    </div>
  );
};

const Step4_Interactive: React.FC<{
  session: DiagnosisSession;
  onFinished: () => void;
}> = ({ session, onFinished }) => {
  const [messages, setMessages] = useState<{
    type: 'cot' | 'ai' | 'user';
    content?: string;
    logs?: string[];
    image?: string;
  }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fusionState, setFusionState] = useState({
    m2m: false,
    h2m: false,
    reasoning: false
  });

  // Initial Load
  useEffect(() => {
    if (messages.length === 0) {
      // 1. Activate Fusion Panel Animations
      setTimeout(() => setFusionState(prev => ({ ...prev, m2m: true })), 500);
      setTimeout(() => setFusionState(prev => ({ ...prev, h2m: true })), 1500);
      setTimeout(() => setFusionState(prev => ({ ...prev, reasoning: true })), 2500);

      // 2. Start CoT after fusion animations
      setTimeout(() => {
        setMessages([
          {
            type: 'cot',
            logs: ['提取单线图拓扑...', '结合高湿与跃变...', '确诊为沿面放电']
          }
        ]);
        
        // 3. Initial AI Message
        setTimeout(() => {
          setMessages(prev => [...prev, {
            type: 'ai',
            content: '王工，初步推断为凝露引发的沿面放电。请问还有需要补充的新线索吗？'
          }]);
          onFinished();
        }, 2000);
      }, 3500);
    }
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    // Add User Message
    setMessages(prev => [...prev, { type: 'user', content: inputValue }]);
    setInputValue('');
    setIsProcessing(true);

    // Simulate AI Response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'cot',
        logs: ['解析补充信息...', '更新风险权重...', '置信度提升']
      }]);
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'ai',
          content: '已收到补充信息，诊断模型已更新。还有其他情况吗？'
        }]);
        setIsProcessing(false);
      }, 2000);
    }, 1000);
  };

  const handleUpload = () => {
    // Simulate Upload
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: '图片：生锈的螺丝',
      image: 'https://images.unsplash.com/photo-1598517527670-36655c655976?auto=format&fit=crop&q=80&w=200' // Placeholder rust image
    }]);
    setIsProcessing(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'cot',
        logs: ['正在解析新图片...', '发现紧固件重度锈蚀...', '印证长期高湿渗水...', '更新风险权重...']
      }]);
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'ai',
          content: '已将紧固件锈蚀纳入证据链，诊断置信度提升至 98%。还需要补充吗？'
        }]);
        setIsProcessing(false);
      }, 3000);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[500px] relative">
      
      {/* Fusion Panel */}
      <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Brain size={12} className="text-indigo-500" /> 融合推理中...
          </h4>
          {fusionState.reasoning && (
             <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold animate-in zoom-in">
               完成
             </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {/* M2M Features */}
          <div className={`bg-white p-2 rounded-lg border border-slate-100 shadow-sm transition-all duration-500 ${fusionState.m2m ? 'border-green-200 bg-green-50/30' : ''}`}>
             <div className="flex items-center justify-between mb-1">
               <span className="text-[10px] font-bold text-slate-500">M2M 机理特征</span>
               {fusionState.m2m && <CheckCircle size={10} className="text-green-500 animate-in zoom-in spring-bounce" />}
             </div>
             <div className="text-[10px] text-slate-700 font-medium">TEV 跃变确认</div>
          </div>

          {/* H2M Features */}
          <div className={`bg-white p-2 rounded-lg border border-slate-100 shadow-sm transition-all duration-500 ${fusionState.h2m ? 'border-green-200 bg-green-50/30' : ''}`}>
             <div className="flex items-center justify-between mb-1">
               <span className="text-[10px] font-bold text-slate-500">H2M 现场特征</span>
               {fusionState.h2m && <CheckCircle size={10} className="text-green-500 animate-in zoom-in spring-bounce" />}
             </div>
             <div className="text-[10px] text-slate-700 font-medium">单线图 / 高湿录音</div>
          </div>
        </div>
      </div>

      {/* Chat Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-16 px-1">
        {messages.map((msg, idx) => (
          <div key={idx} className={`animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            
            {/* CoT Block */}
            {msg.type === 'cot' && (
              <div className="bg-slate-900 rounded-xl p-3 font-mono text-xs text-green-400 mb-2 shadow-sm">
                {msg.logs?.map((log, i) => (
                  <div key={i} className="mb-1 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 800}ms` }}>
                    <span className="opacity-50 mr-2">{'>'}</span>{log}
                  </div>
                ))}
              </div>
            )}

            {/* AI Message */}
            {msg.type === 'ai' && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 border border-indigo-200">
                  <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo" alt="AI" className="w-6 h-6" />
                </div>
                <div className="bg-indigo-50 p-3 rounded-2xl rounded-tl-none border border-indigo-100 text-xs text-slate-700 leading-relaxed shadow-sm max-w-[85%]">
                  {msg.content}
                </div>
              </div>
            )}

            {/* User Message */}
            {msg.type === 'user' && (
              <div className="flex justify-end">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tr-none text-xs text-slate-700 shadow-sm max-w-[85%]">
                  {msg.image && (
                    <div className="mb-2 rounded-lg overflow-hidden">
                      <img src={msg.image} alt="User Upload" className="w-full h-32 object-cover" />
                    </div>
                  )}
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}
        {isProcessing && (
           <div className="flex items-center gap-2 text-[10px] text-slate-400 pl-12">
             <Activity size={12} className="animate-spin text-indigo-500" /> 正在分析...
           </div>
        )}
      </div>

      {/* Embedded Chat Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 pt-3 pb-1 flex items-center gap-2">
        <button 
          onClick={handleUpload}
          className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
        >
          <Plus size={16} />
        </button>
        <div className="flex-1 h-9 bg-slate-50 rounded-full border border-slate-200 flex items-center px-3 focus-within:border-indigo-300 transition-colors">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="补充更多线索..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-700 placeholder-slate-400"
          />
        </div>
        <button 
          onClick={handleSend}
          className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
        >
          {inputValue ? <Send size={14} /> : <Mic size={14} />}
        </button>
      </div>
    </div>
  );
};

const Step5_Advice: React.FC<{
  session: DiagnosisSession;
  onExit: () => void;
}> = ({ session, onExit }) => {
  const INITIAL_TICKET_DATA = {
    conclusion: "绝缘件受潮引发沿面放电",
    isolationAdvice: "建议断开 10kV 进线柜断路器\n需同步确认备自投状态，防止非预期合闸。",
    steps: [
      '穿戴绝缘防护装备，开启柜门',
      '使用工业热风枪对绝缘子表面进行干燥处理',
      '检查加热器回路是否正常工作',
      '复测 TEV 数值，确认下降至 20dBmV 以下'
    ]
  };

  const [ticketData, setTicketData] = useState(INITIAL_TICKET_DATA);
  const [isEditingTicket, setIsEditingTicket] = useState(false);
  const [draftData, setDraftData] = useState(INITIAL_TICKET_DATA);
  const [humanModifiedFields, setHumanModifiedFields] = useState<Record<string, boolean>>({});

  const handleEdit = () => {
    setDraftData(JSON.parse(JSON.stringify(ticketData)));
    setIsEditingTicket(true);
  };

  const handleCancel = () => {
    setIsEditingTicket(false);
  };

  const handleSave = () => {
    const newModified = { ...humanModifiedFields };
    if (draftData.conclusion !== ticketData.conclusion) newModified.conclusion = true;
    if (draftData.isolationAdvice !== ticketData.isolationAdvice) newModified.isolationAdvice = true;
    if (JSON.stringify(draftData.steps) !== JSON.stringify(ticketData.steps)) newModified.steps = true;

    setHumanModifiedFields(newModified);
    setTicketData(draftData);
    setIsEditingTicket(false);
  };

  const handleStepChange = (idx: number, val: string) => {
    const newSteps = [...draftData.steps];
    newSteps[idx] = val;
    setDraftData({ ...draftData, steps: newSteps });
  };

  const handleDeleteStep = (idx: number) => {
    const newSteps = [...draftData.steps];
    newSteps.splice(idx, 1);
    setDraftData({ ...draftData, steps: newSteps });
  };

  const handleAddStep = () => {
    setDraftData({ ...draftData, steps: [...draftData.steps, ''] });
  };

  return (
    <div className={`mt-3 transition-all duration-300 ${isEditingTicket ? 'ring-4 ring-blue-50 rounded-xl' : ''}`}>
      {/* Conclusion Card */}
      <div className="bg-orange-50 rounded-xl p-3 border-l-4 border-orange-500 shadow-sm mb-3">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-xs font-bold text-orange-800 flex items-center gap-1">
            <AlertTriangle size={12} /> 
            确诊结论
            {humanModifiedFields.conclusion && !isEditingTicket && (
               <span className="text-[8px] bg-orange-100 text-orange-600 px-1 py-0.5 rounded border border-orange-200 flex items-center gap-1">
                 ✍️ 人工修正
               </span>
            )}
          </h4>
          <span className="bg-orange-200 text-orange-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            置信度 98%
          </span>
        </div>
        {isEditingTicket ? (
           <input 
             type="text" 
             value={draftData.conclusion}
             onChange={(e) => setDraftData({...draftData, conclusion: e.target.value})}
             className="w-full text-sm font-black text-slate-800 bg-white border border-orange-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-300"
           />
        ) : (
           <p className="text-sm font-black text-slate-800">{ticketData.conclusion}</p>
        )}
      </div>

      {/* Work Ticket */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="bg-slate-50 p-2 border-b border-slate-100 border-dashed flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
            <FileCheck size={12} className="text-blue-500" /> AI 辅助消缺工作票
          </span>
        </div>
        <div className="p-3 space-y-3">
          {/* Equipment Info Header - Dual Line */}
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
             <div className="flex items-center gap-2 mb-1">
                 <Zap size={12} className="text-slate-400" />
                 <span className="text-[10px] font-bold text-slate-600">监测节点：{session.data.iotDeviceName || '未知'}</span>
             </div>
             <div className="flex items-center gap-2">
                 <ScanLine size={12} className="text-slate-400" />
                 <span className="text-[10px] font-bold text-slate-600">物理台账：{session.data.assetPlateName || '待补充'} <span className="text-slate-400 font-normal">(投运 {session.data.equipmentAge || '未知'})</span></span>
             </div>
          </div>

          <div>
            <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-2">
              隔离点建议
              {humanModifiedFields.isolationAdvice && !isEditingTicket && (
                 <span className="text-[8px] bg-orange-100 text-orange-600 px-1 py-0.5 rounded border border-orange-200">
                   ✍️ 人工修正
                 </span>
              )}
            </h5>
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 text-[10px] text-blue-800 flex items-start gap-2">
              <AlertOctagon size={12} className="mt-0.5 flex-shrink-0" />
              {isEditingTicket ? (
                 <textarea 
                   value={draftData.isolationAdvice}
                   onChange={(e) => setDraftData({...draftData, isolationAdvice: e.target.value})}
                   className="w-full bg-white border border-blue-200 rounded p-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[60px]"
                 />
              ) : (
                 <div className="whitespace-pre-wrap font-bold">{ticketData.isolationAdvice}</div>
              )}
            </div>
          </div>
          <div>
            <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-2">
              标准消缺步骤
              {humanModifiedFields.steps && !isEditingTicket && (
                 <span className="text-[8px] bg-orange-100 text-orange-600 px-1 py-0.5 rounded border border-orange-200">
                   ✍️ 人工修正
                 </span>
              )}
            </h5>
            <ul className="space-y-1">
              {(isEditingTicket ? draftData.steps : ticketData.steps).map((step, i) => (
                <li key={i} className="flex items-center gap-2 text-[10px] text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 flex-shrink-0">{i + 1}</span>
                  {isEditingTicket ? (
                     <div className="flex-1 flex items-center gap-2">
                       <input 
                         type="text" 
                         value={step}
                         onChange={(e) => handleStepChange(i, e.target.value)}
                         className="flex-1 border border-slate-200 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                       />
                       <button onClick={() => handleDeleteStep(i)} className="text-slate-300 hover:text-red-500">
                         <X size={12} />
                       </button>
                     </div>
                  ) : (
                     <span>{step}</span>
                  )}
                </li>
              ))}
            </ul>
            {isEditingTicket && (
               <button 
                 onClick={handleAddStep}
                 className="w-full mt-2 border border-dashed border-slate-300 rounded-lg py-1.5 text-[10px] text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors flex items-center justify-center gap-1"
               >
                 <Plus size={12} /> 增加一条步骤
               </button>
            )}
          </div>
        </div>
        
        {/* Ticket Footer (Perforation) */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent to-transparent bg-[length:10px_100%] bg-repeat-x border-t border-slate-200 border-dashed"></div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex gap-3 mt-4">
        {isEditingTicket ? (
          <>
            <button 
              onClick={handleCancel}
              className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm active:bg-slate-50 transition-colors"
            >
              撤销修改
            </button>
            <button 
              onClick={handleSave}
              className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> 保存
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={handleEdit}
              className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm active:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 size={16} /> 修改
            </button>
            <button 
              onClick={onExit}
              className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Archive size={16} /> 确认签发并归档
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const StepperItem: React.FC<{
  step: number;
  expandedStep: number;
  title: string;
  children: React.ReactNode;
  isCompleted: boolean;
  summary?: string;
  color?: 'blue' | 'indigo' | 'green';
  onModify?: () => void;
  onSaveReturn?: () => void;
}> = ({ step, expandedStep, title, children, isCompleted, summary, color = 'blue', onModify, onSaveReturn }) => {
  const isActive = step === expandedStep;
  const isFuture = step > expandedStep && !isCompleted; 
  
  // Color mapping
  const colorClasses = {
    blue: { ring: 'border-blue-500', bg: 'bg-blue-500', text: 'text-blue-600' },
    indigo: { ring: 'border-indigo-500', bg: 'bg-indigo-500', text: 'text-indigo-600' },
    green: { ring: 'border-green-500', bg: 'bg-green-500', text: 'text-green-600' },
  }[color];

  return (
    <div id={`step-${step}`} className={`relative pl-6 transition-all duration-500 ${!isActive && !isCompleted ? 'opacity-40 grayscale' : 'opacity-100'}`}>
      {/* Timeline Line */}
      <div className={`absolute left-[11px] top-8 bottom-0 w-0.5 bg-slate-200 ${step === 5 ? 'hidden' : ''}`} />
      
      {/* Node Circle */}
      <div className={`absolute left-0 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors duration-300
        ${isActive ? `bg-white ${colorClasses.ring}` : (isCompleted ? 'border-green-500 bg-green-500' : 'border-slate-300 bg-white')}
      `}>
        <span className={`text-[10px] font-bold ${isActive ? colorClasses.text : (isCompleted ? 'text-white' : 'text-slate-400')}`}>{step}</span>
      </div>

      {/* Content Container */}
      <div className="mb-2">
        <div 
          className={`flex items-center justify-between mb-1 ${isCompleted && !isActive ? 'cursor-pointer hover:bg-slate-50 rounded-lg p-1 -ml-1 transition-colors group' : ''}`}
          onClick={isCompleted && !isActive && onModify ? onModify : undefined}
        >
          <h3 className={`text-sm font-bold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{title}</h3>
          
          {isCompleted && !isActive && summary && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle size={10} /> {summary}
              </span>
              {onModify && (
                <span className="text-[10px] text-blue-500 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 size={10} /> 修改
                </span>
              )}
            </div>
          )}
        </div>

        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isActive ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {children}
          
          {/* Save & Return Button for Edit Mode */}
          {isActive && isCompleted && onSaveReturn && (
            <div className="mt-4 flex justify-end">
              <button 
                onClick={onSaveReturn}
                className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:bg-slate-700 active:scale-95 transition-all"
              >
                <Save size={12} /> 保存并返回
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionButton: React.FC<{ onClick: () => void; label: string; color: string; disabled?: boolean; icon?: React.ReactNode }> = ({ onClick, label, color, disabled, icon }) => {
  const bgClass = {
    blue: 'bg-blue-600 shadow-blue-500/30',
    indigo: 'bg-indigo-600 shadow-indigo-500/30',
    purple: 'bg-purple-600 shadow-purple-500/30',
  }[color] || 'bg-slate-800';

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`w-full ${bgClass} text-white font-bold py-3 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {icon}
      {label}
    </button>
  );
};

export default Unified_Diagnostic_Task_View;
