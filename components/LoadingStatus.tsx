import React, { useEffect, useState } from 'react';
import { ScanEye, Sparkles, BrainCircuit, Search, PenTool, CheckCircle2 } from 'lucide-react';

interface LoadingStatusProps {
  type: 'analyzing' | 'humanizing';
  className?: string;
}

const LoadingStatus: React.FC<LoadingStatusProps> = ({ type, className = '' }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const analysisSteps = [
    { text: "Escaneando estructura del texto...", icon: Search },
    { text: "Detectando patrones de IA...", icon: BrainCircuit },
    { text: "Evaluando naturalidad...", icon: ScanEye },
    { text: "Generando reporte detallado...", icon: CheckCircle2 },
  ];

  const humanizeSteps = [
    { text: "Analizando contexto y tono...", icon: Search },
    { text: "Rompiendo estructuras robóticas...", icon: BrainCircuit },
    { text: "Aplicando estilo humano...", icon: PenTool },
    { text: "Puliendo gramática y flujo...", icon: Sparkles },
  ];

  const steps = type === 'analyzing' ? analysisSteps : humanizeSteps;
  
  useEffect(() => {
    setProgress(0);
    setCurrentStep(0);
    
    const totalTime = type === 'analyzing' ? 3000 : 5000;
    const intervalTime = 50;
    const increment = 100 / (totalTime / intervalTime);
    
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        return prev + increment;
      });
    }, intervalTime);

    const stepDuration = totalTime / steps.length;
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, stepDuration);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [type, steps.length]);

  const CurrentIcon = steps[currentStep].icon;
  const isAnalyzing = type === 'analyzing';

  // Dynamic Styles
  const gradientBg = isAnalyzing 
    ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
    : 'bg-gradient-to-br from-indigo-500 to-purple-600';
  
  const glowShadow = isAnalyzing
    ? 'shadow-blue-500/30'
    : 'shadow-indigo-500/30';

  return (
    <div className={`glass-card flex flex-col items-center justify-center w-full rounded-3xl p-8 transition-all duration-500 ${className}`}>
      
      {/* Icon Area with Animations */}
      <div className="relative mb-8">
        <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isAnalyzing ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
        <div className={`absolute inset-0 rounded-full blur-xl opacity-40 ${isAnalyzing ? 'bg-blue-400' : 'bg-purple-400'} animate-pulse`}></div>
        <div className={`relative z-10 p-5 rounded-2xl ${gradientBg} text-white shadow-2xl ${glowShadow} transform transition-transform duration-500 hover:scale-105`}>
          <CurrentIcon size={40} className="animate-pulse-slow" />
        </div>
      </div>

      {/* Main Label */}
      <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-3 tracking-tight">
        {isAnalyzing ? 'Analizando Texto' : 'Humanizando Contenido'}
      </h3>

      {/* Dynamic Step Text */}
      <div className="h-8 mb-8 flex items-center justify-center w-full">
        <p 
          key={currentStep} 
          className="text-sm font-medium text-gray-500 dark:text-gray-300 animate-in slide-in-from-bottom-2 fade-in duration-300 text-center"
        >
          {steps[currentStep].text}
        </p>
      </div>

      {/* Gradient Progress Bar */}
      <div className="w-full max-w-sm h-3 bg-gray-100 dark:bg-slate-700/50 rounded-full overflow-hidden mb-4 relative shadow-inner">
        <div 
          className={`h-full rounded-full transition-all duration-200 ease-out ${gradientBg} relative`}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite] w-full transform -skew-x-12"></div>
        </div>
      </div>
      
      {/* Percentage Label */}
      <div className="flex justify-between w-full max-w-sm text-xs font-mono font-medium text-gray-400 dark:text-gray-500 px-1">
        <span>ESTADO: PROCESANDO</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export default LoadingStatus;