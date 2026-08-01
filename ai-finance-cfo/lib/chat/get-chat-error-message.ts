import type {
  ChatErrorData,
} from "@/schemas/chat-response";

const errorMessages: Record<string, string> = {
  INVALID_JSON:
    "请求格式不正确，请刷新页面后重试。",
  UNSUPPORTED_INTENT:
    "当前版本暂时只支持储蓄目标问题。",
  FINANCIAL_DATA_NOT_READY:
    "当前月份还没有足够的收支流水，请先补充财务数据。",
  NEGATIVE_MONTHLY_SURPLUS:
    "当前月支出高于收入，暂时不能按正向月储蓄估算目标。",
  INVALID_FINANCIAL_CONTEXT:
    "当前财务数据暂时无法用于计算。",
  CALCULATION_FAILED:
    "当前问题无法完成储蓄目标计算。",
  AI_NOT_CONFIGURED:
    "AI 服务尚未配置。",
  AI_TIMEOUT:
    "AI 服务响应超时，请稍后重试。",
  AI_UPSTREAM_ERROR:
    "暂时无法连接 AI 服务，请稍后重试。",
  AI_UNAVAILABLE:
    "AI 服务暂时不可用。",
  AI_INVALID_RESPONSE:
    "AI 没有正确理解这个问题，请换一种说法。",
  HISTORY_SAVE_FAILED:
    "计算完成，但审计记录保存失败。",
  INTERNAL_ERROR:
    "聊天请求处理失败，请稍后重试。",
};

export function getChatErrorMessage(
  error: ChatErrorData,
) {
  if (error.code === "VALIDATION_ERROR") {
    return (
      error.issues?.[0]?.message ??
      "请输入有效的财务问题。"
    );
  }

  return (
    errorMessages[error.code] ??
    "聊天请求处理失败，请稍后重试。"
  );
}