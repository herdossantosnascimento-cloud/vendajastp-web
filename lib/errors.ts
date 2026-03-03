// lib/errors.ts
export type AppErrorCode =
  | "FREE_ACTIVE_LIMIT"
  | "UNAUTHENTICATED"
  | "UNKNOWN";

export class AppError extends Error {
  code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export function isAppError(e: unknown): e is AppError {
  return typeof e === "object" && e !== null && (e as any).name === "AppError";
}