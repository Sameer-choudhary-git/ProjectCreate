import { Request, Response, NextFunction } from "express";

export interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  status?: number;
  duration?: number;
  ip?: string;
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const ip =
    (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

  // Log when response is sent
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const log: RequestLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip,
    };

    const logLevel = res.statusCode >= 400 ? "ERROR" : "INFO";
    console.log(
      `[${logLevel}] ${log.method} ${log.path} - ${log.status} (${log.duration}ms)`
    );
  });

  next();
};