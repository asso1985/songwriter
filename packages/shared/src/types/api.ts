export interface ExplainRequest {
  chordId: string;
  progressionContext: string[];
  key: string;
  mode: "flow" | "learn";
}

export interface ExplainResponse {
  explanation: string;
  emoji?: string;
  details?: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}
