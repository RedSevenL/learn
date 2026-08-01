import { successResponse, errorResponse } from "@/lib/api/response";
import { chatRequestSchema } from "@/schemas/chat";
import { formatZodError } from "@/schemas/format-zod-error";
import { parseIntentWithDeepSeek } from "@/lib/ai/parse-intent-with-deepseek";
import { DeepSeekError } from "@/lib/ai/deepseek";
import { ChatServiceError } from "@/lib/chat/chat-service-error";
import { executeChatService } from "@/lib/chat/chat-service";
import { listAccounts } from "@/lib/services/accounts";
import { listTransactions } from "@/lib/services/transactions";
import { saveSavingsGoalCalculation } from "@/lib/services/calculation-history";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "INVALID_JSON",
      "请求体必须是合法 JSON",
      { status: 400 },
    );
  }

  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "请求数据不合法",
      { status: 400 },
      {
        issues: formatZodError(parsed.error),
      },
    );
  }

  let intent;

  try {
    intent = await parseIntentWithDeepSeek(parsed.data.question);
  } catch (error) {
    if (error instanceof DeepSeekError) {
      if (error.code === "invalid_intent") {
        return errorResponse(
          "AI_INVALID_RESPONSE",
          "模型返回的内容不符合业务契约",
          { status: 502 },
        );
      }

      return errorResponse(
        "AI_SERVICE_ERROR",
        error.message,
        { status: 502 },
      );
    }

    if (error instanceof Error) {
      return errorResponse(
        "AI_SERVICE_ERROR",
        error.message,
        { status: 502 },
      );
    }

    return errorResponse(
      "AI_SERVICE_ERROR",
      "意图解析失败",
      { status: 502 },
    );
  }

  let result;

  try {
    result = await executeChatService(intent, {
      listAccounts,
      listTransactions,
      saveSavingsGoalCalculation,
    });
  } catch (error) {
    if (error instanceof ChatServiceError) {
      const statusMap: Record<string, number> = {
        UNSUPPORTED_INTENT: 422,
        FINANCIAL_DATA_NOT_READY: 422,
        NEGATIVE_MONTHLY_SURPLUS: 422,
        INVALID_FINANCIAL_CONTEXT: 500,
        CALCULATION_FAILED: 400,
        HISTORY_SAVE_FAILED: 500,
      };

      const status = statusMap[error.code] ?? 500;

      return errorResponse(
        error.code,
        error.message,
        { status },
      );
    }

    return errorResponse(
      "CHAT_ERROR",
      "对话处理失败",
      { status: 500 },
    );
  }

  return successResponse(result, { status: 201 });
}