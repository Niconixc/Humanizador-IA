import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Sparkles, ScanEye, ShieldCheck, Settings2, AlertCircle, LayoutTemplate, FileText, Activity, Moon, Sun, Wand2, History, Ghost, PartyPopper } from 'lucide-react';
import TextEditor from './components/TextEditor';
import LoadingStatus from './components/LoadingStatus';
import AnalysisDashboard from './components/AnalysisDashboard';
import HistoryDrawer from './components/HistoryDrawer';
import GhostwriterModal from './components/GhostwriterModal';
import Toast from './components/Toast';
import { AnalysisResult, AppState, HumanizeConfig, HistoryItem, GhostwriterConfig } from './types';
import { analyzeTextForAI, humanizeText } from './services/geminiService';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [originalAnalysis, setOriginalAnalysis] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // CHANGE: Default to true (Dark Mode) to avoid white startup
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'analysis' | 'result'>('result');

  // Concurrency Control
  const operationRef = useRef<number>(0);

  // New Features State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showGhostwriter, setShowGhostwriter] = useState(false);
  const [ghostwriterConfig, setGhostwriterConfig] = useState<GhostwriterConfig>({
    isEnabled: false,
    referenceText: ''
  });
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);

  const [config, setConfig] = useState<HumanizeConfig>({
    tone: 'academic',
    grammarLevel: 'university'
  });

  // Load History from LocalStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('app_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) { console.error("Failed to parse history"); }
    }

    // Load autosaved text
    const saved = localStorage.getItem('autosave_input');
    const timestamp = localStorage.getItem('autosave_timestamp');
    
    if (saved && timestamp) {
      const savedDate = new Date(timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60);
      
      // Only restore if less than 24 hours old
      if (hoursDiff < 24) {
        setInputText(saved);
        setToast({ message: 'Texto restaurado desde auto-guardado', type: 'info' });
      }
    }
  }, []);

  // Save History to LocalStorage
  useEffect(() => {
    localStorage.setItem('app_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto-save input text every 30 seconds
  useEffect(() => {
    if (!inputText) return;
    
    const timer = setTimeout(() => {
      localStorage.setItem('autosave_input', inputText);
      localStorage.setItem('autosave_timestamp', new Date().toISOString());
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [inputText]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter: Humanizar
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (inputText && appState === AppState.IDLE) {
          handleHumanize();
        }
      }
      
      // Ctrl/Cmd + D: Detectar IA
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (inputText && appState === AppState.IDLE) {
          handleAnalyze();
        }
      }
      
      // Ctrl/Cmd + K: Limpiar
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [inputText, appState]);

  // Effect to trigger success animation when state becomes COMPLETE
  useEffect(() => {
    if (appState === AppState.COMPLETE) {
      setShowSuccessAnimation(true);
      const timer = setTimeout(() => setShowSuccessAnimation(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) return;
    
    // Start new operation, invalidating previous ones
    const opId = Date.now();
    operationRef.current = opId;

    setAppState(AppState.ANALYZING);
    setActiveTab('analysis'); 
    setErrorMsg(null);
    setAnalysis(null);
    setOriginalAnalysis(null);
    // We do NOT clear inputText as the user intends to analyze it.
    setOutputText(''); // Clear previous results

    try {
      const result = await analyzeTextForAI(inputText);
      
      // Only proceed if this operation is still the active one
      if (operationRef.current === opId) {
        setAnalysis(result);
        setOriginalAnalysis(result); // Keep copy as original
        setAppState(AppState.IDLE);
      }
    } catch (err: any) {
      if (operationRef.current === opId) {
        setErrorMsg(err.message || "Error al analizar");
        setAppState(AppState.ERROR);
      }
    }
  }, [inputText]);

  const handleHumanize = useCallback(async () => {
    if (!inputText.trim()) return;

    // Start new operation
    const opId = Date.now();
    operationRef.current = opId;

    setAppState(AppState.HUMANIZING);
    setActiveTab('result');
    setErrorMsg(null);

    // Use current analysis (if available) as feedback, or rely on stored original
    const feedbackAnalysis = analysis || originalAnalysis;
    
    // Ensure originalAnalysis is set if we jumped straight to humanize without analyzing first
    if (!originalAnalysis && feedbackAnalysis) {
        setOriginalAnalysis(feedbackAnalysis);
    }
    
    setAnalysis(null);
    setOutputText(''); // Clear previous output

    try {
      const humanized = await humanizeText(inputText, config, feedbackAnalysis, ghostwriterConfig);
      
      // Check for stale operation
      if (operationRef.current !== opId) return;

      setOutputText(humanized);

      const newAnalysis = await analyzeTextForAI(humanized);
      
      // Check for stale operation again after second await
      if (operationRef.current !== opId) return;

      setAnalysis(newAnalysis); 

      // Save to History
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        originalText: inputText,
        humanizedText: humanized,
        score: newAnalysis.aiScore
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10)); // Keep last 10

      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      if (operationRef.current === opId) {
        setErrorMsg(err.message || "Error al humanizar");
        setAppState(AppState.ERROR);
      }
    }
  }, [inputText, config, analysis, originalAnalysis, ghostwriterConfig]);

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setAnalysis(null);
    setOriginalAnalysis(null);
    setAppState(AppState.IDLE);
    setErrorMsg(null);
    setActiveTab('result');
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    // New operation (restore)
    const opId = Date.now();
    operationRef.current = opId;

    setInputText(item.originalText);
    setOutputText(item.humanizedText);
    // Note: We don't save the full analysis in history to save space, but we have the score
    setAnalysis({
      aiScore: item.score,
      verdict: item.score > 50 ? 'Probable IA' : 'Humano',
      reasoning: ['Restaurado desde el historial'],
      highlightedSegments: []
    });
    setAppState(AppState.COMPLETE);
    setActiveTab('result');
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-sans text-slate-800 dark:text-slate-100 transition-colors duration-500">
      
      {/* Ambient Animated Background - More vibrant for dark mode */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 dark:opacity-20 animate-blob"></div>
         <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 dark:opacity-20 animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 dark:opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header (Glass) */}
      <header className="fixed top-0 w-full z-50 glass border-b border-gray-200/20 dark:border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">
              Humanizador <span className="text-indigo-600 dark:text-indigo-400">IA</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            
            {/* History Toggle */}
            <button 
              onClick={() => setShowHistory(true)}
              className="hidden md:flex p-2.5 rounded-xl text-gray-600 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
              title="Historial de Sesiones"
            >
               <History size={20} />
            </button>

            {/* Ghostwriter Toggle */}
            <button 
              onClick={() => setShowGhostwriter(true)}
              className={`hidden md:flex p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 ${ghostwriterConfig.isEnabled ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300 ring-2 ring-indigo-500/50' : 'text-gray-600 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:bg-slate-800'}`}
              title="Modo Fantasma (Clonar Estilo)"
            >
               <Ghost size={20} />
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-slate-800/80 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 shadow-sm">
                <LayoutTemplate size={14} className="text-indigo-500"/>
                Potenciado con Google Gemini
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl text-gray-600 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 w-full flex flex-col gap-6">
        
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto py-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-3 tracking-tight">
            Detecta, Analiza y <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Humaniza</span>
          </h2>
          <p className="text-slate-600 dark:text-gray-400 text-lg">
             Plataforma avanzada para asegurar que tus textos académicos suenen auténticos.
          </p>
        </div>

        {/* Toolbar / Config Island */}
        <div className="glass-card p-3 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-40 transition-all duration-300">
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar pl-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mr-2">
              <Settings2 size={16} />
              <span className="hidden sm:inline">Ajustes</span>
            </div>
            
            <div className="flex gap-2">
              <select 
                value={config.grammarLevel}
                onChange={(e) => setConfig(prev => ({ ...prev, grammarLevel: e.target.value as any }))}
                title="Nivel de complejidad gramatical: Secundaria (simple), Universitario (estándar), Doctorado (avanzado)"
                className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-2.5 outline-none transition-all hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              >
                <option value="high-school">Secundaria</option>
                <option value="university">Universitario</option>
                <option value="phd">Doctorado</option>
              </select>

              <select 
                value={config.tone}
                onChange={(e) => setConfig(prev => ({ ...prev, tone: e.target.value as any }))}
                title="Tono del texto: Académico (ensayos, papers), Casual (conversacional), Creativo (narrativo)"
                className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-2.5 outline-none transition-all hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              >
                <option value="academic">Académico</option>
                <option value="casual">Casual</option>
                <option value="creative">Creativo</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <button
              onClick={handleAnalyze}
              disabled={!inputText}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-white dark:hover:bg-slate-600 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:transform-none disabled:shadow-none transition-all text-sm group"
            >
              {appState === AppState.ANALYZING ? 'Analizando...' : (
                <>
                  <ScanEye size={18} className="group-hover:text-indigo-500 transition-colors" />
                  Detectar IA
                </>
              )}
            </button>
            <button
              onClick={handleHumanize}
              disabled={!inputText}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:transform-none transition-all text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:scale-95"
            >
              {appState === AppState.HUMANIZING ? 'Procesando...' : (
                <>
                  <Wand2 size={18} />
                  Humanizar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-50/90 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
            <div className="bg-red-100 dark:bg-red-900/50 p-1.5 rounded-full">
              <AlertCircle size={18} />
            </div>
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[500px]">
          
          {/* LEFT COLUMN: Input */}
          <div className="flex flex-col h-full animate-in slide-in-from-left-4 fade-in duration-500">
            <TextEditor
              title="Entrada (Texto original)"
              placeholder="Pega tu texto aquí o arrastra un archivo .txt..."
              value={inputText}
              onChange={setInputText}
              onClear={handleClear}
              highlightedSegments={activeTab === 'analysis' ? analysis?.highlightedSegments : undefined}
            />
          </div>

          {/* RIGHT COLUMN: Results Center */}
          <div className="flex flex-col h-full animate-in slide-in-from-right-4 fade-in duration-500 delay-100">
            
            {/* View Toggle Tabs */}
            <div className="flex items-center gap-1 mb-3 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit self-end backdrop-blur-sm border border-white/10">
                <button
                  onClick={() => setActiveTab('analysis')}
                  disabled={!analysis && appState !== AppState.ANALYZING}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'analysis' 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm scale-100' 
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 disabled:opacity-40 scale-95 hover:scale-100'
                  }`}
                >
                  <Activity size={14} />
                  Reporte IA
                </button>
                <button
                   onClick={() => setActiveTab('result')}
                   className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'result' 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm scale-100' 
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 scale-95 hover:scale-100'
                  }`}
                >
                  <FileText size={14} />
                  Texto Humanizado
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-grow relative min-h-[400px]">
              
              {appState === AppState.ANALYZING && (
                 <LoadingStatus type="analyzing" className="h-full absolute inset-0 z-10" />
              )}

              {appState === AppState.HUMANIZING && (
                 <LoadingStatus type="humanizing" className="h-full absolute inset-0 z-10" />
              )}
              
              {activeTab === 'analysis' && analysis && appState !== AppState.ANALYZING && (
                <AnalysisDashboard 
                  analysis={analysis} 
                  originalText={inputText} 
                  humanizedText={outputText}
                  originalAnalysis={originalAnalysis} // Pass original detection info
                />
              )}

              {activeTab === 'result' && appState !== AppState.HUMANIZING && (
                outputText ? (
                  <div className="relative h-full">
                    {/* Success Animation Overlay */}
                    {showSuccessAnimation && (
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in zoom-in-50 slide-in-from-top-4 duration-500 pointer-events-none">
                         <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full shadow-lg shadow-green-500/30 flex items-center gap-2 border border-green-400/50 backdrop-blur-md">
                            <PartyPopper size={20} className="animate-bounce" />
                            <span className="font-bold text-sm">¡Humanización Exitosa!</span>
                         </div>
                         {/* Simple confetti particles */}
                         <div className="absolute -top-2 -left-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                         <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-indigo-400 rounded-full animate-ping delay-100 opacity-75"></div>
                         <div className="absolute top-0 right-10 w-2 h-2 bg-pink-400 rounded-full animate-ping delay-200 opacity-75"></div>
                      </div>
                    )}
                    
                    <TextEditor
                      title="Resultado Humanizado"
                      placeholder="El resultado aparecerá aquí..."
                      value={outputText}
                      readOnly={true}
                      aiScore={analysis?.aiScore} 
                      onViewReport={() => setActiveTab('analysis')}
                    />
                  </div>
                ) : (
                  // Empty State
                  <div className="glass-card h-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300/50 dark:border-slate-700/50 p-8 text-center transition-colors hover:border-indigo-300 dark:hover:border-indigo-800/50">
                    <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-full mb-4 transition-transform hover:scale-110 duration-300 shadow-sm">
                      <Sparkles size={36} className="text-slate-400 dark:text-gray-600" />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-semibold mb-2 text-lg">Esperando acción</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                      Analiza tu texto para ver patrones de IA o humanízalo directamente para obtener una versión indetectable.
                    </p>
                  </div>
                )
              )}

            </div>
          </div>
        </div>
      </main>

      {/* Overlays */}
      <HistoryDrawer 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        history={history}
        onRestore={handleRestoreHistory}
        onDelete={(id) => setHistory(prev => prev.filter(i => i.id !== id))}
        onClearAll={() => setHistory([])}
      />

      <GhostwriterModal 
        isOpen={showGhostwriter}
        onClose={() => setShowGhostwriter(false)}
        config={ghostwriterConfig}
        onSave={setGhostwriterConfig}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
};

export default App;