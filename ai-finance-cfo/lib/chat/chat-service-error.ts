export type ChatServiceErrorCode =
  | "UNSUPPORTED_INTENT"
  | "FINANCIAL_DATA_NOT_READY"
  | "NEGATIVE_MONTHLY_SURPLUS"
  | "INVALID_FINANCIAL_CONTEXT"
  | "CALCULATION_FAILED"
  | "HISTORY_SAVE_FAILED";

export class ChatServiceError extends Error {
  constructor(
    public readonly code: ChatServiceErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ChatServiceError";
  }
}