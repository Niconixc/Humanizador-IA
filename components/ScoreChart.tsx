import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';

interface ScoreChartProps {
  score: number;
}

const ScoreChart: React.FC<ScoreChartProps> = ({ score }) => {
  // Determine color based on score (High AI = Red, Low AI = Green)
  let fill = '#22c55e'; // Green
  if (score > 40) fill = '#eab308'; // Yellow
  if (score > 70) fill = '#ef4444'; // Red

  const data = [{ name: 'AI Score', value: score, fill }];

  // Helper to determine text label
  const getLabel = (s: number) => {
    if (s <= 20) return "Bajo (Humano)";
    if (s <= 50) return "Moderado (Mixto)";
    if (s <= 80) return "Alto (Probable IA)";
    return "Muy Alto (IA)";
  };

  return (
    <div className="relative w-full h-48 flex items-center justify-center group cursor-help">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="60%" 
          outerRadius="80%" 
          barSize={15} 
          data={data} 
          startAngle={180} 
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={30} // Rounded ends
          />
        </RadialBarChart>
      </ResponsiveContainer>
      
      {/* Center Text */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3 text-center z-10">
        <span className="text-4xl font-bold text-gray-800 dark:text-gray-100 transition-colors">{score}%</span>
        <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400">
          <p className="text-xs font-medium uppercase tracking-wide transition-colors">Probabilidad IA</p>
          <Info size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Custom Tooltip */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-[-20px] w-64 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 translate-y-2 group-hover:translate-y-0">
        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
          <p className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-1 mb-2">
            Interpretación del Puntaje
          </p>
          
          <div className={`flex justify-between items-center ${score <= 20 ? 'font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded' : ''}`}>
            <span>0% - 20%</span>
            <span>Bajo</span>
          </div>
          <div className={`flex justify-between items-center ${score > 20 && score <= 50 ? 'font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded' : ''}`}>
            <span>21% - 50%</span>
            <span>Moderado</span>
          </div>
          <div className={`flex justify-between items-center ${score > 50 && score <= 80 ? 'font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded' : ''}`}>
            <span>51% - 80%</span>
            <span>Alto</span>
          </div>
          <div className={`flex justify-between items-center ${score > 80 ? 'font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded' : ''}`}>
            <span>81% - 100%</span>
            <span>Muy Alto</span>
          </div>

          <div className="pt-2 mt-2 border-t border-gray-100 dark:border-slate-700 text-[10px] text-gray-400 italic text-center">
            Tu texto actual se clasifica como: <strong>{getLabel(score)}</strong>
          </div>
        </div>
        
        {/* Tooltip Arrow */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-slate-50 dark:bg-slate-900 border-t border-l border-gray-200 dark:border-slate-700 rotate-45"></div>
      </div>
    </div>
  );
};

export default ScoreChart;