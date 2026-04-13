import { describe, it, expect } from "vitest";
import express from "express";
import healthRouter from "../routes/health.js";

function createTestApp() {
  const app = express();
  app.use("/api", healthRouter);
  return app;
}

describe("Health endpoint", () => {
  it("GET /api/health returns 200 with status ok", async () => {
    const app = createTestApp();

    const response = await new Promise<{ status: number; body: Record<string, unknown> }>(
      (resolve) => {
        const server = app.listen(0, () => {
          const addr = server.address();
          const port = typeof addr === "object" && addr ? addr.port : 0;
          fetch(`http://localhost:${port}/api/health`)
            .then(async (res) => {
              const body = await res.json();
              resolve({ status: res.status, body: body as Record<string, unknown> });
              server.close();
            });
        });
      },
    );

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.timestamp).toBeDefined();
  });
});
