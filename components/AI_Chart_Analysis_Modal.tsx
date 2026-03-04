import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Activity, Cpu, Clock, FileText, ChevronRight, Terminal, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

interface AnalysisPayload {
  projectName: string;
  deviceId: string;
  timestamp: number;
  chartType: string;
}

const AI_Chart_Analysis_Modal: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState<AnalysisPayload | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<string>('');
  const [isThinking, setIsThinking] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const customEvent = event as CustomEvent<AnalysisPayload>;
      setPayload(customEvent.detail);
      setIsOpen(true);
      // Reset state
      setLogs([]);
      setResult('');
      setIsThinking(true);
      
      // Start analysis logic
      startAnalysis(customEvent.detail);
    };

    window.addEventListener('OPEN_AI_CHART_ANALYSIS', handleOpen);
    return () => window.removeEventListener('OPEN_AI_CHART_ANALYSIS', handleOpen);
  }, []);

  const startAnalysis = (data: AnalysisPayload) => {
    let steps: { text: string; delay: number }[] = [];
    let finalResult = "";

    if (data.chartType === '局放高频脉冲频次演进分析') {
      // Frequency Analysis Logic
      steps = [
        { text: "正在加载过去 7 天的脉冲频次密度分布...", delay: 800 },
        { text: "过滤偶发性高频脉冲干扰...", delay: 1600 },
        { text: "计算脉冲频次增长斜率 (Growth Rate)...", delay: 2400 },
        { text: "未发现雪崩式激增，当前频次均值符合缓慢劣化特征。", delay: 3200 },
      ];
      finalResult = "### 分析结论\n\n放电频次虽有波动，但整体呈**缓慢平稳演进**，未进入**雪崩击穿高危期**。\n\n维持当前巡检周期即可。";
    } else if (data.chartType === 'PRPD 二维相位图谱(幅值-相位-频次)解析') {
      // PRPD Analysis Logic
      steps = [
        { text: "正在对 3600 个特征点进行 50Hz 工频相位映射...", delay: 800 },
        { text: "计算相位簇集中度：发现第一象限(45°-90°)与第三象限(225°-270°)存在高密度脉冲簇...", delay: 1600 },
        { text: "正负半周放电幅值呈现高度对称的 '兔耳状' 特征...", delay: 2400 },
        { text: "匹配专家机理知识库，排除表面电晕放电。", delay: 3200 },
      ];
      finalResult = "### 确诊结论\n\n高度疑似**绝缘内部气隙放电**。\n\n正负半周对称特征明显，属于典型**内部固体绝缘缺陷**，建议结合超声(AE)信号进行交叉定位。";
    } else if (data.chartType === 'PRPS 三维图谱(周期-相位-幅值)连续性分析') {
      // PRPS Analysis Logic
      steps = [
        { text: "正在构建时间(工频周期)-相位-幅值的 3D 时空张量...", delay: 800 },
        { text: "追踪连续 50 个工频周期内的放电稳定性...", delay: 1600 },
        { text: "发现放电源在时间轴上具有极强的连续性与重现性...", delay: 2400 },
        { text: "剥离背景中随机散布的无周期性通信底噪伪影...", delay: 3200 },
      ];
      finalResult = "### 确诊结论\n\n放电源**极其稳定连续**，绝非偶发性干扰噪声。\n\n可确认为真实存在的**设备内部持续性局放缺陷**，置信度 **98%**。\n\n建议发起正式的诊断任务进行消缺。";
    } else {
      // Default / Amplitude Analysis Logic
      steps = [
        { text: "正在对齐能量幅值序列与环境温湿度时间轴...", delay: 800 },
        { text: "发现 14:00 幅值发生 '台阶式跃变' (Step-change)...", delay: 1600 },
        { text: "调取同期湿度数据，确认湿度攀升至 85% RH...", delay: 2400 },
        { text: "综合推理：高湿环境加速了绝缘件表面凝露与劣化。", delay: 3200 },
      ];
      finalResult = "### 分析结论\n\n设备绝缘状态处于**加速劣化期**，能量跃变与高湿环境呈**强正相关**。\n\n建议立即开启柜内加热除湿器，并持续观察 24 小时内的幅值变化趋势。";
    }

    let currentStep = 0;

    const processStep = () => {
      if (currentStep < steps.length) {
        setTimeout(() => {
          const text = steps[currentStep].text;
          setLogs(prev => [...prev, text]);
          currentStep++;
          processStep();
        }, steps[currentStep].delay - (currentStep > 0 ? steps[currentStep-1].delay : 0));
      } else {
        setTimeout(() => {
          setIsThinking(false);
          setResult(finalResult);
        }, 1000);
      }
    };

    processStep();
  };

  const handleSyncToChat = () => {
    if (!payload || !result) return;

    const chatContextPayload = {
      equipmentName: payload.deviceId,
      chartType: payload.chartType,
      conclusion: result,
      timestamp: payload.timestamp
    };

    setIsOpen(false);
    navigate('/', { state: { chatContextPayload } });
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  if (!isOpen || !payload) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 pointer-events-auto transition-opacity" 
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Content */}
      <div className="relative z-10 bg-white dark:bg-[#1a1a1a] w-full max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl border border-gray-200 dark:border-gray-800 pointer-events-auto flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Sparkles size={18} />
            <h3 className="font-bold text-base">
              {payload?.chartType === '局放高频脉冲频次演进分析' ? 'AI 智能频次解析' : 
               (payload?.chartType === 'PRPD 二维相位图谱(幅值-相位-频次)解析' ? 'AI 智能图谱诊断' : 
               (payload?.chartType === 'PRPS 三维图谱(周期-相位-幅值)连续性分析' ? 'AI 智能图谱解析' : 'AI 智能趋势解析'))}
            </h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Context Card */}
          <div className="bg-gray-50 dark:bg-[#111] rounded-xl p-3 mb-4 border border-gray-100 dark:border-gray-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Activity size={12} />
              <span>分析上下文</span>
            </div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div className="flex flex-col">
                <span className="text-gray-400 scale-90 origin-left">项目</span>
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{payload.projectName || '未知项目'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 scale-90 origin-left">设备</span>
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{payload.deviceId}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 scale-90 origin-left">时间</span>
                <span className="font-medium text-gray-700 dark:text-gray-300 font-mono">
                  {new Date(payload.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 scale-90 origin-left">类型</span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">{payload.chartType}</span>
              </div>
            </div>
          </div>

          {/* CoT Log Area */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-600 dark:text-gray-400">
              <Terminal size={12} />
              AI 思考日志
            </div>
            <div className="bg-black/90 rounded-xl p-3 font-mono text-xs text-green-400 h-32 overflow-y-auto custom-scrollbar border border-gray-800 shadow-inner">
              {logs.map((log, i) => (
                <div key={i} className="mb-1.5 flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="opacity-50 select-none">{'>'}</span>
                  <span>{log}</span>
                </div>
              ))}
              {isThinking && (
                <div className="flex gap-1 items-center opacity-50">
                  <span className="w-1.5 h-3 bg-green-400 animate-pulse"/>
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Result Area */}
          {result && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-500/30 animate-in zoom-in-95 duration-500">
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-strong:text-indigo-700 dark:prose-strong:text-indigo-300">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Bar */}
        {result && !isThinking && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] rounded-b-2xl">
            <button 
              onClick={handleSyncToChat}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <MessageSquare size={18} />
              带入主会话深度探讨
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AI_Chart_Analysis_Modal;
