import React from 'react';
import { HistoryItem } from '../types';
import { X, Clock, Trash2, ArrowRightCircle, History } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onRestore, 
  onDelete,
  onClearAll
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-slate-100/90 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 z-[70] border-l border-white/20 dark:border-white/5 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <History className="text-indigo-500" size={20} />
            Historial de Sesiones
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 text-center px-6">
              <Clock size={48} className="mb-4 opacity-50" />
              <p>No hay sesiones guardadas.</p>
              <p className="text-xs mt-2">Tus análisis y humanizaciones se guardarán aquí automáticamente.</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="group bg-white/70 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                    {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <div 
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.score > 50 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' 
                        : item.score > 20 
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    }`}
                  >
                    IA: {item.score}%
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 font-medium">
                   {item.humanizedText.replace(/<[^>]*>/g, '').substring(0, 100)}...
                </p>

                <div className="flex justify-end gap-2">
                   <button 
                     onClick={() => onDelete(item.id)}
                     className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                     title="Borrar"
                   >
                     <Trash2 size={14} />
                   </button>
                   <button 
                     onClick={() => { onRestore(item); onClose(); }}
                     className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold transition-colors"
                   >
                     Restaurar <ArrowRightCircle size={12} />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <button 
              onClick={onClearAll}
              className="w-full py-2 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={14} />
              Borrar todo el historial
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default HistoryDrawer;