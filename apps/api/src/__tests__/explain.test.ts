import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import explainRouter from "../routes/explain.js";

// Mock Redis to avoid real connection
vi.mock("../services/cache-service.js", () => ({
  getCachedExplanation: vi.fn().mockResolvedValue(null),
  cacheExplanation: vi.fn().mockResolvedValue(undefined),
}));

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", explainRouter);
  return app;
}

async function postExplain(
  app: ReturnType<typeof express>,
  body: unknown,
): Promise<{ status: number; body: Record<string, unknown> }> {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      fetch(`http://localhost:${port}/api/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(async (res) => {
        const resBody = await res.json();
        resolve({
          status: res.status,
          body: resBody as Record<string, unknown>,
        });
        server.close();
      });
    });
  });
}

describe("POST /api/explain", () => {
  it("returns { data } wrapper with valid request", async () => {
    const app = createTestApp();
    const response = await postExplain(app, {
      chordId: "Am",
      progressionContext: ["C"],
      key: "C_major",
      mode: "flow",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    const data = response.body.data as Record<string, unknown>;
    expect(data).toHaveProperty("explanation");
    expect(data).toHaveProperty("chordFunction");
    expect(data).toHaveProperty("chordCharacter");
  });

  it("returns { error } wrapper for invalid request", async () => {
    const app = createTestApp();
    const response = await postExplain(app, {
      chordId: "Am",
      // missing progressionContext, key, mode
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    const error = response.body.error as Record<string, unknown>;
    expect(error).toHaveProperty("message");
    expect(error).toHaveProperty("code");
    expect(error.code).toBe("VALIDATION_ERROR");
  });

  it("returns { error } for empty body", async () => {
    const app = createTestApp();
    const response = await postExplain(app, {});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("returns explanation with chordFunction for known chord", async () => {
    const app = createTestApp();
    const response = await postExplain(app, {
      chordId: "G",
      progressionContext: ["C", "Am"],
      key: "C_major",
      mode: "learn",
    });

    expect(response.status).toBe(200);
    const data = response.body.data as Record<string, unknown>;
    expect(data.chordFunction).toBe("V — Dominant");
  });
});
