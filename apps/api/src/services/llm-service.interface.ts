import type { ExplainRequest, ExplainResponse } from "@songwriter/shared";

export interface LlmService {
  getExplanation(request: ExplainRequest): Promise<ExplainResponse>;
}
