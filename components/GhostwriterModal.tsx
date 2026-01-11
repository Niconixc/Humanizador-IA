import React, { useState, useEffect } from 'react';
import { Ghost, X, Check, FileText } from 'lucide-react';
import { GhostwriterConfig } from '../types';

interface GhostwriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GhostwriterConfig;
  onSave: (config: GhostwriterConfig) => void;
}

const GhostwriterModal: React.FC<GhostwriterModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [text, setText] = useState(config.referenceText);
  const [isEnabled, setIsEnabled] = useState(config.isEnabled);

  // Sincronizar el estado local con la configuración del padre cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setText(config.referenceText);
      setIsEnabled(config.isEnabled);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ isEnabled, referenceText: text });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Fondo cambiado de white a slate-100/95 para evitar blanco puro */}
      <div className="relative w-full max-w-2xl bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-indigo-100/50 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-200/50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/60 dark:bg-slate-800 rounded-xl shadow-sm backdrop-blur-md">
                <Ghost className="text-indigo-600 dark:text-indigo-400" size={24} />
             </div>
             <div>
               <h2 className="text-xl font-bold text-slate-800 dark:text-white">Modo Ghostwriter</h2>
               <p className="text-xs text-slate-500 dark:text-gray-400">Clonación de Estilo Personal</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 rounded-lg hover:bg-slate-200/50 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
           <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
              <input 
                type="checkbox" 
                id="enableGhost"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
              />
              <label htmlFor="enableGhost" className="text-sm font-medium text-slate-700 dark:text-gray-200 cursor-pointer select-none">
                 Activar Clonación de Estilo
              </label>
           </div>

           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                 <FileText size={16} />
                 Texto de Referencia (Tu estilo)
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Pega aquí un texto antiguo escrito por ti (ensayo, artículo, email). La IA analizará tus muletillas, longitud de frases y vocabulario para imitarte."
                className="w-full h-48 p-4 bg-white/60 dark:bg-slate-950/50 border border-indigo-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-sm leading-relaxed text-slate-700 dark:text-gray-200 placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400 mt-2 text-right">
                 Recomendado: +300 palabras para mejor precisión.
              </p>
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-200/30 dark:bg-slate-900/50 border-t border-indigo-100/50 dark:border-slate-800 flex justify-end gap-3">
           <button 
             onClick={onClose}
             className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-800 rounded-xl transition-colors"
           >
             Cancelar
           </button>
           <button 
             onClick={handleSave}
             className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
           >
             <Check size={16} />
             Guardar Configuración
           </button>
        </div>
      </div>
    </div>
  );
};

export default GhostwriterModal;