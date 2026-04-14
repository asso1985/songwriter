export interface ExplainRequest {
  chordId: string;
  progressionContext: string[];
  key: string;
  mode: "flow" | "learn";
}

export interface ExplainResponse {
  explanation: string;
  chordFunction: string;
  chordCharacter: string;
  emoji?: string;
}

export interface ApiError {
  message: string;
  code: string;
}

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: ApiError;
}
