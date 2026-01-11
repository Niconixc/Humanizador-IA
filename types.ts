export interface HighlightedSegment {
  text: string;
  explanation: string;
}

export interface AnalysisResult {
  aiScore: number; // 0 to 100 (100 being highly likely AI)
  verdict: string;
  reasoning: string[];
  highlightedSegments: HighlightedSegment[];
}

export interface HumanizeConfig {
  tone: 'academic' | 'casual' | 'creative';
  grammarLevel: 'high-school' | 'university' | 'phd';
}

export interface GhostwriterConfig {
  isEnabled: boolean;
  referenceText: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalText: string;
  humanizedText: string;
  score: number;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  HUMANIZING = 'HUMANIZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}