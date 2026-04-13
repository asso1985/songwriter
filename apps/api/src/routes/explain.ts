import { Router } from "express";
import type { ExplainRequest } from "@songwriter/shared";
import { createLlmService } from "../services/llm-service.factory.js";

const router = Router();
const llmService = createLlmService();

router.post("/explain", async (req, res) => {
  const request = req.body as ExplainRequest;
  const response = await llmService.getExplanation(request);
  res.json(response);
});

export default router;
