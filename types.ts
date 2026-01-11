export interface HighlightedSegment {
  text: string;
  explanation: string;
}

export interface QuantitativeMetrics {
  avgSentenceLength: number;
  sentenceLengthVariation: number; // Standard deviation
  uniqueWordRatio: number; // Percentage of unique words
  formalConnectorCount: number;
  passiveVoiceRatio: number;
  hedgingPhraseCount: number;
}

export interface ScoreBreakdown {
  linguistic: number;    // Linguistic patterns (0-100)
  structure: number;     // Organization and structure (0-100)
  vocabulary: number;    // Vocabulary and style (0-100)
  content: number;       // Content depth and authenticity (0-100)
}

export interface AnalysisResult {
  aiScore: number; // 0 to 100 (100 being highly likely AI)
  confidence: 'low' | 'medium' | 'high'; // Confidence level
  verdict: string;
  reasoning: string[];
  highlightedSegments: HighlightedSegment[];
  metrics?: QuantitativeMetrics; // Optional quantitative analysis
  breakdown?: ScoreBreakdown; // Optional granular scoring
  detectedModel?: string; // Detected AI model (if identifiable)
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