export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  imageBase64?: string;
}

export interface AnalysisResult {
  asset: string;
  timeframe: string;
  currentPrice: string;
  imageQualityStatus: "GOOD" | "INSUFFICIENT";
  signal: "BUY" | "SELL" | "WAIT";
  confidenceScore: number;
  entryZone: string;
  stopLoss: string;
  takeProfit1: string;
  takeProfit2: string;
  riskReward: string;
  reasons: string[];
  invalidation: string;
  dataQuality: string;
}

export interface LiveRecommendation {
  asset: string;
  signal: "BUY" | "SELL" | "WAIT";
  confidenceScore: number;
  entryZone: string;
  takeProfit1: string;
  takeProfit2: string;
  stopLoss: string;
  reasons: string[];
}

export interface HistoryItem extends AnalysisResult {
  id: string;
  timestamp: string;
  imageObjUrl?: string; // Stored locally as a blob url or base64 for preview, though blob urls expire. Let's just store simple info.
  imageBase64?: string; // Careful with size in LocalStorage, maybe keep small thumb
}

