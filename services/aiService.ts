import { analyzeTextForAI as geminiAnalyze, humanizeText as geminiHumanize } from './geminiService';
import { analyzeTextForAI as groqAnalyze, humanizeText as groqHumanize } from './groqService';
import { AnalysisResult, HumanizeConfig, GhostwriterConfig } from '../types';

export type AIProvider = 'gemini' | 'groq';

export const analyzeTextForAI = async (
  text: string,
  provider: AIProvider = 'gemini'
): Promise<AnalysisResult> => {
  if (provider === 'groq') {
    return groqAnalyze(text);
  }
  return geminiAnalyze(text);
};

export const humanizeText = async (
  text: string,
  config: HumanizeConfig,
  previousAnalysis?: AnalysisResult | null,
  ghostwriter?: GhostwriterConfig,
  provider: AIProvider = 'gemini'
): Promise<string> => {
  if (provider === 'groq') {
    return groqHumanize(text, config, previousAnalysis, ghostwriter);
  }
  return geminiHumanize(text, config, previousAnalysis, ghostwriter);
};
