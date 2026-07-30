import { requestDeepSeekJson } from "@/lib/ai/deepseek";
import { FINANCE_INTENT_PROMPT } from "@/lib/ai/prompts/finance-intent";
import { parseFinanceIntent } from "@/lib/ai/parse-finance-intent";
import type { FinanceIntent } from "@/schemas/ai-intent";

const MAX_USER_MESSAGE_LENGTH = 2000;

function normalizeUserMessage(userMessage: string) {
  const normalized = userMessage.trim();

  if (normalized.length === 0) {
    throw new Error("问题不能为空");
  }

  if (normalized.length > MAX_USER_MESSAGE_LENGTH) {
    throw new Error("问题不能超过 2000 个字符");
  }

  return normalized;
}

/**
 * 完整意图解析链路：
 *
 * 1. 校验用户消息长度
 * 2. 调用 DeepSeek API
 * 3. 使用第 28 课的 parseFinanceIntent 校验模型输出
 * 4. 返回可信的 FinanceIntent
 *
 * 第二个参数 fetcher 仅用于测试注入，不传时使用真实 fetch。
 */
export async function parseIntentWithDeepSeek(
  userMessage: string,
  fetcher?: typeof fetch,
): Promise<FinanceIntent> {
  const normalized = normalizeUserMessage(userMessage);

  const rawOutput = await requestDeepSeekJson({
    systemPrompt: FINANCE_INTENT_PROMPT,
    userMessage: normalized,
    fetcher,
  });

  const parsed = parseFinanceIntent(rawOutput);

  if (!parsed.success) {
    throw new Error(
      `DeepSeek 意图解析失败：${parsed.reason}`,
    );
  }

  return parsed.intent;
}