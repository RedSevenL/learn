import {
  financeIntentSchema,
  type FinanceIntent,
} from "@/schemas/ai-intent";

export type ParseFinanceIntentResult =
  | {
      success: true;
      intent: FinanceIntent;
    }
  | {
      success: false;
      reason: "invalid_json" | "invalid_intent";
      message: string;
    };

/**
 * 解析和校验模型原始字符串输出。
 *
 * 1. JSON.parse 检查是否为合法 JSON
 * 2. financeIntentSchema.safeParse 检查是否符合业务契约
 *
 * 区分 invalid_json 和 invalid_intent 是为了后续决定：
 *   - 是否重试模型
 *   - 是否向用户追问
 *   - 是否提示暂不支持
 */
export function parseFinanceIntent(
  rawOutput: string,
): ParseFinanceIntentResult {
  let value: unknown;

  try {
    value = JSON.parse(rawOutput);
  } catch {
    return {
      success: false,
      reason: "invalid_json",
      message: "模型没有返回合法 JSON",
    };
  }

  const result = financeIntentSchema.safeParse(value);

  if (!result.success) {
    return {
      success: false,
      reason: "invalid_intent",
      message: "模型输出不符合财务意图格式",
    };
  }

  return {
    success: true,
    intent: result.data,
  };
}