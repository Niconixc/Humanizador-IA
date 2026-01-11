import React, { useState, useRef, useMemo } from 'react';
import ScoreChart from './ScoreChart';
import { AnalysisResult } from '../types';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp, Sparkles, Brain, FileText, Target } from 'lucide-react';
import { diffWords } from 'diff';

interface AnalysisDashboardProps {
  analysis: AnalysisResult;
  originalText?: string;
  humanizedText?: string;
  originalAnalysis?: AnalysisResult | null;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ 
  analysis, 
  originalText = "", 
  humanizedText = "",
  originalAnalysis
}) => {
  const [viewMode, setViewMode] = useState<'report' | 'diff'>('report');
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100% text size
  const isHighAi = analysis.aiScore > 50;
  
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef<boolean>(false);

  const handleScroll = (source: 'left' | 'right') => {
    if (isScrolling.current) return;
    isScrolling.current = true;

    const sourceRef = source === 'left' ? leftScrollRef.current : rightScrollRef.current;
    const targetRef = source === 'left' ? rightScrollRef.current : leftScrollRef.current;

    if (sourceRef && targetRef) {
      const percentage = sourceRef.scrollTop / (sourceRef.scrollHeight - sourceRef.clientHeight);
      
      // Asegurar que el porcentaje sea válido antes de aplicar
      if (!isNaN(percentage) && isFinite(percentage)) {
         targetRef.scrollTop = percentage * (targetRef.scrollHeight - targetRef.clientHeight);
      }
    }

    // Usar requestAnimationFrame para un desbloqueo más fluido y preciso que setTimeout
    requestAnimationFrame(() => {
      isScrolling.current = false;
    });
  };

  const handleZoom = (action: 'in' | 'out' | 'reset') => {
    if (action === 'reset') {
      setZoomLevel(1);
      return;
    }
    setZoomLevel(prev => {
      const newZoom = action === 'in' ? prev + 0.1 : prev - 0.1;
      return Math.min(Math.max(newZoom, 0.7), 1.8); // Min 70%, Max 180%
    });
  };

  const diffData = useMemo(() => {
    if (!originalText || !humanizedText) return null;

    const strip = (html: string) => {
      if (typeof window === 'undefined') return html.replace(/<[^>]*>/g, '');
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    };

    const text1 = strip(originalText);
    const text2 = strip(humanizedText);

    return diffWords(text1, text2);
  }, [originalText, humanizedText]);

  // Pre-calculate ranges of detected AI patterns in the original text to highlight them in the diff
  const aiPatternRanges = useMemo(() => {
    if (!originalAnalysis || !originalText) return [];
    const ranges: {start: number, end: number, explanation: string}[] = [];
    
    const strip = (html: string) => {
       const doc = new DOMParser().parseFromString(html, 'text/html');
       return doc.body.textContent || "";
    };
    const cleanOriginal = strip(originalText);

    originalAnalysis.highlightedSegments.forEach(seg => {
       let idx = cleanOriginal.indexOf(seg.text, 0);
       while(idx !== -1) {
          ranges.push({ start: idx, end: idx + seg.text.length, explanation: seg.explanation });
          idx = cleanOriginal.indexOf(seg.text, idx + 1);
       }
    });
    return ranges;
  }, [originalAnalysis, originalText]);

  let currentOriginalIndex = 0;

  return (
    <div className="glass-card rounded-3xl shadow-lg shadow-indigo-500/5 dark:shadow-black/20 overflow-hidden h-full flex flex-col transition-all duration-300 border border-white/40 dark:border-white/5">
      
      {/* Dashboard Header */}
      <div className="px-5 py-3 bg-slate-100/50 dark:bg-slate-900/30 border-b border-white/20 dark:border-white/5 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-slate-700 dark:text-gray-200 flex items-center gap-2 text-sm uppercase tracking-wide">
            {isHighAi ? <ShieldAlert size={18} className="text-red-500"/> : <CheckCircle size={18} className="text-green-500"/>}
            {viewMode === 'report' ? 'Reporte de Análisis' : 'Comparativa'}
          </h3>
          
          {humanizedText && (
             <div className="flex bg-slate-200/50 dark:bg-slate-700/60 rounded-lg p-0.5 ml-2 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode('report')}
                  className={`p-1 px-2 rounded-md flex items-center gap-1.5 text-xs font-medium transition-all ${viewMode === 'report' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-gray-400'}`}
                >
                  <BarChart3 size={14} />
                  Reporte
                </button>
                <button
                  onClick={() => setViewMode('diff')}
                  className={`p-1 px-2 rounded-md flex items-center gap-1.5 text-xs font-medium transition-all ${viewMode === 'diff' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-gray-400'}`}
                >
                  <GitCompare size={14} />
                  Comparar
                </button>
             </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-sm ${isHighAi ? 'bg-red-100/80 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-green-100/80 text-green-700 dark:bg-green-900/50 dark:text-green-300'}`}>
            {analysis.verdict}
          </span>
          {analysis.confidence && (
            <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
              analysis.confidence === 'high' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' :
              analysis.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
              'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {analysis.confidence === 'high' ? '⭐ Alta' : analysis.confidence === 'medium' ? '⚠️ Media' : '🔍 Baja'} Confianza
            </span>
          )}
        </div>
      </div>

      {/* VIEW: REPORT (Standard) */}
      {viewMode === 'report' && (
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/20 dark:bg-slate-900/40">
          <div className="flex flex-col items-center mb-8 bg-slate-100/60 dark:bg-white/5 p-6 rounded-3xl border border-white/20 shadow-sm">
            <div className="w-48 h-48 relative">
                <ScoreChart score={analysis.aiScore} />
            </div>
            <p className="text-center text-sm font-medium text-slate-500 dark:text-gray-400 mt-[-20px] max-w-xs transition-colors">
              {isHighAi 
                ? "Se han detectado patrones fuertes de generación artificial." 
                : "El texto tiene una varianza natural típica de la escritura humana."}
            </p>
          </div>

          <div className="space-y-6">
            {/* General Reasoning */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Info size={14} className="text-indigo-500" />
                Diagnóstico General
              </h4>
              <div className="space-y-2">
                {analysis.reasoning.map((reason, idx) => (
                  <div key={idx} className="bg-slate-100/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-white/40 dark:border-white/5 text-sm text-slate-700 dark:text-gray-300 leading-relaxed hover:bg-white/70 dark:hover:bg-slate-800/60 transition-colors shadow-sm">
                    {reason}
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Segments List */}
            {analysis.highlightedSegments.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <ScanSearch size={14} className="text-yellow-500" />
                  Fragmentos Sospechosos ({analysis.highlightedSegments.length})
                </h4>
                <div className="space-y-3">
                  {analysis.highlightedSegments.slice(0, 3).map((segment, idx) => (
                    <div key={idx} className="bg-yellow-50/50 dark:bg-yellow-900/10 p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/20">
                      <p className="font-medium text-slate-800 dark:text-gray-200 mb-1 text-sm border-l-2 border-yellow-400 pl-2">"{segment.text.substring(0, 60)}{segment.text.length > 60 ? '...' : ''}"</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400 italic mt-2 pl-2.5">{segment.explanation}</p>
                    </div>
                  ))}
                  {analysis.highlightedSegments.length > 3 && (
                    <p className="text-xs text-center text-slate-400 mt-2">
                      Revisa el editor de texto para ver todos los fragmentos resaltados.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Detected AI Model */}
            {analysis.detectedModel && analysis.detectedModel !== 'None' && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Brain size={14} className="text-purple-500" />
                  Modelo Detectado
                </h4>
                <div className="bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/20">
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    {analysis.detectedModel === 'Unknown' ? '🤖 IA Genérica' : `🤖 ${analysis.detectedModel}`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                    {analysis.detectedModel === 'GPT' && 'Detectadas firmas típicas de modelos GPT (OpenAI)'}
                    {analysis.detectedModel === 'Claude' && 'Detectadas firmas típicas de Claude (Anthropic)'}
                    {analysis.detectedModel === 'Gemini' && 'Detectadas firmas típicas de Gemini (Google)'}
                    {analysis.detectedModel === 'Unknown' && 'Patrones de IA detectados pero modelo no identificable'}
                  </p>
                </div>
              </div>
            )}

            {/* Quantitative Metrics */}
            {analysis.metrics && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Activity size={14} className="text-blue-500" />
                  Métricas Cuantitativas
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1">Long. Promedio</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{analysis.metrics.avgSentenceLength.toFixed(1)}</p>
                    <p className="text-[9px] text-slate-400 dark:text-gray-500">palabras/oración</p>
                  </div>
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1">Variación</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{analysis.metrics.sentenceLengthVariation.toFixed(1)}</p>
                    <p className="text-[9px] text-slate-400 dark:text-gray-500">desv. estándar</p>
                  </div>
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1">Palabras Únicas</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{(analysis.metrics.uniqueWordRatio * 100).toFixed(0)}%</p>
                    <p className="text-[9px] text-slate-400 dark:text-gray-500">diversidad léxica</p>
                  </div>
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1">Voz Pasiva</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{(analysis.metrics.passiveVoiceRatio * 100).toFixed(0)}%</p>
                    <p className="text-[9px] text-slate-400 dark:text-gray-500">del texto</p>
                  </div>
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1">Conectores</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{analysis.metrics.formalConnectorCount}</p>
                    <p className="text-[9px] text-slate-400 dark:text-gray-500">formales</p>
                  </div>
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1">Hedging</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{analysis.metrics.hedgingPhraseCount}</p>
                    <p className="text-[9px] text-slate-400 dark:text-gray-500">frases evasivas</p>
                  </div>
                </div>
              </div>
            )}

            {/* Score Breakdown */}
            {analysis.breakdown && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <TrendingUp size={14} className="text-indigo-500" />
                  Desglose por Categoría
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-slate-600 dark:text-gray-300">Patrones Lingüísticos</span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{analysis.breakdown.linguistic}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{width: `${analysis.breakdown.linguistic}%`}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-slate-600 dark:text-gray-300">Estructura</span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{analysis.breakdown.structure}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500" style={{width: `${analysis.breakdown.structure}%`}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-slate-600 dark:text-gray-300">Vocabulario</span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{analysis.breakdown.vocabulary}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500" style={{width: `${analysis.breakdown.vocabulary}%`}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-slate-600 dark:text-gray-300">Contenido</span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{analysis.breakdown.content}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500" style={{width: `${analysis.breakdown.content}%`}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: DIFF (Comparison) */}
      {viewMode === 'diff' && diffData && (
        <div className="flex flex-col h-full overflow-hidden bg-slate-50/20 dark:bg-slate-900/50 relative">
           
           {/* Diff Toolbar / Zoom Controls */}
           <div className="flex items-center justify-between gap-4 py-2 px-4 border-b border-slate-200/50 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/30 backdrop-blur-md">
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <span className="hidden sm:inline">Patrón IA</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span className="hidden sm:inline">Eliminado</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    <span className="hidden sm:inline">Añadido</span>
                  </div>
              </div>

              <div className="flex items-center bg-slate-200/50 dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600">
                <button 
                  onClick={() => handleZoom('out')} 
                  className="p-1.5 hover:bg-slate-300/50 dark:hover:bg-slate-600 text-slate-600 dark:text-gray-300 rounded-l-lg transition-colors"
                  title="Reducir Zoom"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="px-2 text-xs font-mono text-slate-500 dark:text-gray-400 border-x border-slate-200 dark:border-slate-600">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button 
                  onClick={() => handleZoom('in')} 
                  className="p-1.5 hover:bg-slate-300/50 dark:hover:bg-slate-600 text-slate-600 dark:text-gray-300 border-r border-slate-200 dark:border-slate-600 transition-colors"
                  title="Aumentar Zoom"
                >
                  <ZoomIn size={14} />
                </button>
                <button 
                  onClick={() => handleZoom('reset')} 
                  className="p-1.5 hover:bg-slate-300/50 dark:hover:bg-slate-600 text-slate-600 dark:text-gray-300 rounded-r-lg transition-colors"
                  title="Restablecer"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
           </div>

           <div className="flex flex-grow overflow-hidden relative">
              
              {/* Left Column (Original) */}
              <div className="w-1/2 border-r border-slate-200/30 dark:border-slate-700/50 flex flex-col bg-red-50/10 dark:bg-red-900/5">
                 <div className="px-3 py-1.5 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider text-center border-b border-red-100/50 dark:border-red-900/20 bg-red-50/30">
                   Original (Problema)
                 </div>
                 <div 
                   ref={leftScrollRef}
                   onScroll={() => handleScroll('left')}
                   className="flex-grow overflow-y-auto p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono text-slate-600 dark:text-gray-300 transition-all duration-200 ease-out custom-scrollbar"
                   style={{ fontSize: `${zoomLevel * 0.875}rem`, lineHeight: `${zoomLevel * 1.6}` }}
                 >
                    {diffData.map((part, i) => {
                      if (part.added) return null;
                      
                      const partStart = currentOriginalIndex;
                      const partEnd = currentOriginalIndex + part.value.length;
                      
                      const isAiPattern = aiPatternRanges.some(r => 
                         (partStart >= r.start && partStart < r.end) || 
                         (partEnd > r.start && partEnd <= r.end) ||
                         (partStart <= r.start && partEnd >= r.end)
                      );
                      
                      currentOriginalIndex += part.value.length;

                      let classNames = "rounded px-0.5 mx-0.5 transition-colors duration-300 ";
                      if (part.removed) {
                         classNames += "text-red-800 dark:text-red-200 line-through decoration-red-400 decoration-2 ";
                         if (isAiPattern) classNames += "bg-yellow-100 dark:bg-yellow-900/40 border-b-2 border-red-400 "; 
                         else classNames += "bg-red-100/70 dark:bg-red-900/40 ";
                      } else {
                         if (isAiPattern) classNames += "bg-yellow-100/70 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 ";
                      }

                      return (
                        <span key={i} className={classNames} title={isAiPattern ? "Patrón IA Detectado" : undefined}>
                          {part.value}
                        </span>
                      );
                    })}
                 </div>
              </div>

              {/* Right Column (Humanized) */}
              <div className="w-1/2 flex flex-col bg-green-50/10 dark:bg-green-900/5">
                 <div className="px-3 py-1.5 text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider text-center border-b border-green-100/50 dark:border-green-900/20 bg-green-50/30">
                   Humanizado (Solución)
                 </div>
                 <div 
                   ref={rightScrollRef}
                   onScroll={() => handleScroll('right')}
                   className="flex-grow overflow-y-auto p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono text-slate-800 dark:text-gray-100 transition-all duration-200 ease-out custom-scrollbar"
                   style={{ fontSize: `${zoomLevel * 0.875}rem`, lineHeight: `${zoomLevel * 1.6}` }}
                 >
                   {diffData.map((part, i) => {
                      if (part.removed) return null;
                      return (
                        <span 
                          key={i} 
                          className={part.added ? "bg-green-100/70 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded px-0.5 mx-0.5 font-semibold" : ""}
                        >
                          {part.value}
                        </span>
                      );
                    })}
                 </div>
              </div>

           </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDashboard;