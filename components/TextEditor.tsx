import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Copy, Eraser, AlertTriangle, Eye, Edit3, ShieldAlert, CheckCircle2, Check, Download, FileType, UploadCloud, FileUp } from 'lucide-react';
import { HighlightedSegment } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import mammoth from 'mammoth';

interface TextEditorProps {
  value: string;
  onChange?: (val: string) => void;
  placeholder: string;
  readOnly?: boolean;
  title: string;
  onClear?: () => void;
  highlightedSegments?: HighlightedSegment[];
  aiScore?: number; 
  onViewReport?: () => void; 
}

const TextEditor: React.FC<TextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  readOnly = false, 
  title,
  onClear,
  highlightedSegments = [],
  aiScore,
  onViewReport
}) => {
  const [viewMode, setViewMode] = useState<'edit' | 'highlight'>('edit');
  const [isFocused, setIsFocused] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Word and character count
  const { wordCount, charCount } = useMemo(() => {
    if (!value) return { wordCount: 0, charCount: 0 };
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = value;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    return {
      wordCount: words.length,
      charCount: text.length
    };
  }, [value]);

  // Singleton Tooltip State
  const [activeTooltip, setActiveTooltip] = useState<{
    x: number;
    y: number;
    explanation: string;
    visible: boolean;
  } | null>(null);

  useEffect(() => {
    if (highlightedSegments.length > 0 && value) {
      setViewMode('highlight');
    } else {
      setViewMode('edit');
    }
  }, [highlightedSegments, value]);

  const handleCopy = () => {
    // FIX: Clean copy logic preventing weird characters
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = value;
    // Replace non-breaking spaces and get text content to strip HTML tags
    const cleanText = tempDiv.textContent || tempDiv.innerText || "";
    const finalCleanText = cleanText.replace(/\u00A0/g, ' ');
    
    navigator.clipboard.writeText(finalCleanText);
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 2000);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (onChange) onChange(e.currentTarget.innerHTML);
  };

  const saveFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById(`editor-content-${title.replace(/\s/g, '')}`);
    if (!element) return;
    
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.setFontSize(18);
    pdf.text("Reporte de Humanizador IA", 10, 15);
    pdf.setFontSize(12);
    pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 22);
    if(aiScore !== undefined) {
        pdf.setTextColor(aiScore > 50 ? 255 : 0, 0, 0); 
        pdf.text(`Probabilidad IA Detectada: ${aiScore}%`, 10, 30);
        pdf.setTextColor(0, 0, 0);
    }
    
    pdf.addImage(imgData, 'PNG', 0, 40, pdfWidth, pdfHeight);
    pdf.save('humanizado-reporte.pdf');
  };

  const handleExportDoc = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
        "xmlns:w='urn:schemas-microsoft-com:office:word' "+
        "xmlns='http://www.w3.org/TR/REC-html40'>"+
        "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header+value+footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
        type: 'application/msword'
    });
    
    saveFile(blob, `${title.replace(/\s/g, '_') || 'texto'}.doc`);
  };

  const processFile = async (file: File) => {
    setIsProcessingFile(true);
    try {
      if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        if (onChange) onChange(result.value);
      } else if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        const text = await file.text();
        if (onChange) onChange(text);
      } else {
        alert("Formato no soportado. Por favor usa .docx, .txt o .md");
      }
    } catch (error) {
      console.error("Error processing file", error);
      alert("Error al leer el archivo. Intenta copiar y pegar el contenido.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!readOnly) setIsDragging(true);
  }, [readOnly]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (readOnly) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [readOnly, onChange]);

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
        processFile(files[0]);
    }
    if (e.target) e.target.value = '';
  };

  const scoreColorClass = useMemo(() => {
    if (aiScore === undefined) return '';
    if (aiScore > 50) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800';
    if (aiScore > 20) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800';
  }, [aiScore]);

  // Handle Tooltip Mouse Events
  const handleMouseEnter = (e: React.MouseEvent, explanation: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveTooltip({
      x: rect.left + rect.width / 2, // Center horizontally
      y: rect.top, // Top of element
      explanation,
      visible: true
    });
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  const renderHighlightedText = useMemo(() => {
    if (!value || highlightedSegments.length === 0) return <div dangerouslySetInnerHTML={{ __html: value }} className="whitespace-pre-wrap" />;

    let lastIndex = 0;
    const parts = [];
    const sortedSegments = [...highlightedSegments].sort((a, b) => value.indexOf(a.text) - value.indexOf(b.text));

    for (const segment of sortedSegments) {
      const index = value.indexOf(segment.text, lastIndex);
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push(<span key={`text-${lastIndex}`}>{value.substring(lastIndex, index)}</span>);
        }
        parts.push(
          <span 
            key={`highlight-${index}`} 
            className="group relative inline-block cursor-help mx-0.5 align-middle"
            onMouseEnter={(e) => handleMouseEnter(e, segment.explanation)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Efecto de resplandor animado de fondo */}
            <span className="absolute inset-0 rounded bg-yellow-400/30 dark:bg-yellow-500/20 animate-pulse-slow blur-[2px] transition-all duration-300 group-hover:blur-[4px] group-hover:bg-yellow-400/50 pointer-events-none"></span>
            
            {/* Texto visible con borde y sombra */}
            <span className="relative z-10 px-1 py-0.5 rounded-sm 
                bg-gradient-to-b from-yellow-50/50 to-yellow-100/50 dark:from-yellow-900/10 dark:to-yellow-900/30
                border-b-2 border-yellow-400 dark:border-yellow-500 
                text-slate-900 dark:text-slate-100 font-medium
                shadow-[0_0_10px_rgba(234,179,8,0.15)]
                group-hover:shadow-[0_0_20px_rgba(234,179,8,0.6)]
                group-hover:border-yellow-500 dark:group-hover:border-yellow-400
                transition-all duration-300">
              {value.substring(index, index + segment.text.length)}
            </span>
          </span>
        );
        lastIndex = index + segment.text.length;
      }
    }
    if (lastIndex < value.length) {
      parts.push(<span key={`text-end`}>{value.substring(lastIndex)}</span>);
    }
    return <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-gray-200 font-normal">{parts}</div>;
  }, [value, highlightedSegments]);

  return (
    <>
      <div 
        className={`flex flex-col h-full glass-card rounded-3xl shadow-lg shadow-indigo-500/5 dark:shadow-black/20 overflow-hidden transition-all duration-300 ${isFocused ? 'ring-2 ring-indigo-500/20 border-indigo-400/30' : 'border-white/40 dark:border-white/5'} ${isDragging ? 'ring-4 ring-indigo-500 scale-[0.99] border-indigo-500' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/20 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-slate-700 dark:text-gray-200 flex items-center gap-2 text-sm uppercase tracking-wide">
              {title}
            </h3>
            
            {aiScore !== undefined && (
              <button 
                onClick={onViewReport}
                disabled={!onViewReport}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border animate-in zoom-in-50 duration-300 shadow-sm ${scoreColorClass} ${onViewReport ? 'cursor-pointer hover:brightness-95 active:scale-95' : ''}`}
                title={onViewReport ? "Ver reporte detallado" : "Puntaje IA"}
              >
                {aiScore > 50 ? <ShieldAlert size={12}/> : <CheckCircle2 size={12}/>}
                <span>{aiScore}% Probabilidad IA</span>
              </button>
            )}
          </div>

          <div className="flex gap-1.5 items-center">
            
            {!readOnly && (
               <>
                  <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileChange} 
                     accept=".docx,.txt,.md" 
                     className="hidden" 
                  />
                  <button 
                     onClick={handleFileUploadClick}
                     className="p-1.5 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors mr-2"
                     title="Subir archivo (.docx, .txt)"
                  >
                     <FileUp size={16} />
                  </button>
               </>
            )}

            {highlightedSegments.length > 0 && !readOnly && (
              <div className="flex bg-slate-200/50 dark:bg-slate-700/60 rounded-lg p-0.5 mr-2 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700'}`}
                  title="Editar Texto"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => setViewMode('highlight')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'highlight' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700'}`}
                  title="Ver Análisis"
                >
                  <Eye size={14} />
                </button>
              </div>
            )}

            {!readOnly && value && (
              <button 
                onClick={() => {
                  if (onClear) onClear();
                  setViewMode('edit');
                }}
                className="p-2 text-slate-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
                title="Borrar todo"
              >
                <Eraser size={16} />
              </button>
            )}
            
            <div className="relative">
              {showCopyFeedback && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-bold px-2 py-1 rounded-md shadow-lg animate-in fade-in zoom-in-50 duration-200 whitespace-nowrap z-50">
                  ¡Copiado!
                </span>
              )}
              <button 
                onClick={handleCopy}
                disabled={!value}
                className={`p-2 rounded-lg transition-all active:scale-95 ${
                  showCopyFeedback 
                    ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' 
                    : 'text-slate-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30'
                }`}
                title="Copiar texto"
              >
                {showCopyFeedback ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="relative flex-grow bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-[2px] transition-colors group">
          
          {isDragging && !readOnly && (
             <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-indigo-500/10 backdrop-blur-sm border-2 border-indigo-500 border-dashed rounded-b-3xl">
                <UploadCloud size={48} className="text-indigo-600 animate-bounce" />
                <p className="text-indigo-700 font-bold mt-4">Suelta el archivo para cargar texto</p>
                <p className="text-indigo-500 text-xs mt-1">Soporta .docx, .txt, .md</p>
             </div>
          )}
          
          {isProcessingFile && (
             <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-semibold text-slate-600 dark:text-gray-300">Procesando archivo...</p>
             </div>
          )}

          {viewMode === 'edit' || readOnly ? (
            <div
              id={`editor-content-${title.replace(/\s/g, '')}`} 
              className={`w-full h-[350px] md:h-[450px] p-6 overflow-y-auto focus:outline-none text-slate-700 dark:text-gray-200 leading-relaxed text-base`}
              contentEditable={!readOnly}
              suppressContentEditableWarning={true}
              onInput={handleInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              dangerouslySetInnerHTML={readOnly ? { __html: value } : undefined}
              style={{ minHeight: '100%' }}
            />
          ) : (
            <div 
              className="w-full h-[350px] md:h-[450px] p-6 overflow-y-auto"
              onClick={() => setViewMode('edit')}
            >
               {renderHighlightedText}
            </div>
          )}
          
          {!value && viewMode === 'edit' && !readOnly && !isDragging && (
             <div className="absolute top-6 left-6 text-slate-400 dark:text-gray-600 pointer-events-none text-base italic">
               {placeholder}
             </div>
          )}
          
          {highlightedSegments.length > 0 && !readOnly && viewMode === 'edit' && (
             <div className="absolute bottom-4 right-4 animate-in fade-in slide-in-from-bottom-2 pointer-events-none">
               <button 
                  onClick={() => setViewMode('highlight')}
                  className="bg-yellow-50/90 hover:bg-yellow-100 dark:bg-yellow-900/80 dark:hover:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer border border-yellow-200 dark:border-yellow-700 shadow-lg backdrop-blur-md transition-all pointer-events-auto hover:-translate-y-0.5"
               >
                 <AlertTriangle size={14} />
                 <span>Se detectaron <strong>{highlightedSegments.length} patrones</strong></span>
               </button>
             </div>
          )}
        </div>
      </div>

      {/* FIXED SINGLETON TOOLTIP - Rendered outside overflow container */}
      {activeTooltip && (
        <div 
          className="fixed z-[9999] w-64 p-3 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xl border border-yellow-200 dark:border-yellow-800/50 rounded-xl shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-150"
          style={{ 
            left: `${activeTooltip.x}px`, 
            top: `${activeTooltip.y}px`,
            transform: 'translate(-50%, -100%) translateY(-10px)' // Center and move above
          }}
        >
            <span className="font-bold block mb-1 text-yellow-600 dark:text-yellow-400 uppercase tracking-wide flex items-center gap-2 text-[10px] border-b border-yellow-100 dark:border-white/5 pb-1">
                <AlertTriangle size={12} className="text-yellow-500"/> Patrón de IA
            </span>
            <p className="leading-snug text-xs text-slate-700 dark:text-slate-300">{activeTooltip.explanation}</p>
            
            {/* Arrow */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-slate-50 dark:bg-slate-900 border-r border-b border-yellow-200 dark:border-yellow-800/50 rotate-45"></div>
        </div>
      )}
    </>
  );
};

export default TextEditor;