import React from 'react';
import { X, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { AIProvider } from '../types';

interface Props {
  onClose: () => void;
  currentProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
}

const ProviderSettingsModal: React.FC<Props> = ({ onClose, currentProvider, onProviderChange }) => {
  const geminiConfigured = !!process.env.VITE_API_KEY;
  const groqConfigured = !!process.env.GROQ_API_KEY;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Configuración de Proveedores IA</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Gemini Status */}
        <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                G
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Google Gemini</h3>
            </div>
            {geminiConfigured ? (
              <CheckCircle size={20} className="text-green-500" />
            ) : (
              <AlertCircle size={20} className="text-orange-500" />
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {geminiConfigured ? '✅ API Key configurada' : '⚠️ API Key no configurada'}
          </p>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Obtener API Key <ExternalLink size={14} />
          </a>
        </div>

        {/* Groq Status */}
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                G
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Groq</h3>
            </div>
            {groqConfigured ? (
              <CheckCircle size={20} className="text-green-500" />
            ) : (
              <AlertCircle size={20} className="text-orange-500" />
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {groqConfigured ? '✅ API Key configurada' : '⚠️ API Key no configurada'}
          </p>
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Obtener API Key <ExternalLink size={14} />
          </a>
        </div>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-900 dark:text-blue-300 leading-relaxed">
            <strong>💡 Nota:</strong> Las API Keys se configuran como variables de entorno.
            <br />
            <br />
            <strong>Vercel:</strong> Agrega <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded font-mono text-xs">VITE_API_KEY</code> y
            <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded font-mono text-xs ml-1">GROQ_API_KEY</code> en Settings → Environment Variables.
            <br />
            <br />
            <strong>Local:</strong> Crea un archivo <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded font-mono text-xs">.env</code> en la raíz del proyecto.
          </p>
        </div>

        {/* Current Provider */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Proveedor Activo
          </label>
          <select
            value={currentProvider}
            onChange={(e) => {
              const newProvider = e.target.value as AIProvider;
              onProviderChange(newProvider);
              localStorage.setItem('ai-provider', newProvider);
            }}
            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="gemini">🔷 Google Gemini 2.0 (1,500 RPD gratis)</option>
            <option value="groq">⚡ Groq Mixtral 8x7B (14,400 RPD gratis)</option>
          </select>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:scale-95"
        >
          Guardar y Cerrar
        </button>
      </div>
    </div>
  );
};

export default ProviderSettingsModal;
