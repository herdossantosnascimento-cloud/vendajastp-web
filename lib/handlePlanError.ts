import { AppError } from "./errors";

export function isFreeLimitError(e: unknown): boolean {
  return (
    e instanceof AppError &&
    e.code === "FREE_ACTIVE_LIMIT"
  );
}
