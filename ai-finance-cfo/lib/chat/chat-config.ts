import * as z from "zod";
import { ChatServiceError } from "./chat-service-error";

const annualRateSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?$/, "年化收益率格式不正确");

const DEFAULT_SAVINGS_ANNUAL_RATE = "3";

export function getChatSavingsAnnualRate() {
  const value =
    process.env.CHAT_SAVINGS_ANNUAL_RATE ??
    DEFAULT_SAVINGS_ANNUAL_RATE;

  const parsed = annualRateSchema.safeParse(value);

  if (!parsed.success) {
    throw new ChatServiceError(
      "INVALID_FINANCIAL_CONTEXT",
      "储蓄目标收益率配置不合法",
      parsed.error,
    );
  }

  return parsed.data;
}