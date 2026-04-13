import type { Request, Response, NextFunction } from "express";
import type { ApiError } from "@songwriter/shared";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("Unhandled error:", err.message);

  const apiError: ApiError = {
    message: "Internal server error",
    code: "INTERNAL_ERROR",
    status: 500,
  };

  res.status(apiError.status).json(apiError);
}
