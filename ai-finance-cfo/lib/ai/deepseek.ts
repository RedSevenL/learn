import * as z from "zod";

export const DEEPSEEK_API_URL =
  "https://api.deepseek.com/chat/completions";

const DEFAULT_MODEL = "deepseek-v4-flash";
const REQUEST_TIMEOUT_MS = 20_000;

// ── 响应 schema ───────────────────────────────────
// 只校验本课使用的字段，不复制整份官方类型。

const deepSeekResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        finish_reason: z.string().nullable(),
        message: z.object({
          content: z.string().nullable(),
        }),
      }),
    )
    .min(1),
});

// ── 错误类型 ──────────────────────────────────────

export type DeepSeekErrorCode =
  | "missing_api_key"
  | "timeout"
  | "network_error"
  | "http_error"
  | "invalid_response"
  | "empty_content"
  | "truncated_output"
  | "invalid_intent";

export class DeepSeekError extends Error {
  constructor(
    public readonly code: DeepSeekErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "DeepSeekError";
  }
}

// ── 类型 ───────────────────────────────────────────

type FetchLike = typeof fetch;

type RequestDeepSeekJsonInput = {
  systemPrompt: string;
  userMessage: string;
  fetcher?: FetchLike;
};

// ── 环境变量读取（函数执行时，非模块加载时） ─────

export function getDeepSeekModelName() {
  return process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL;
}

function getDeepSeekConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new DeepSeekError(
      "missing_api_key",
      "缺少 DEEPSEEK_API_KEY",
    );
  }

  return {
    apiKey,
    model: getDeepSeekModelName(),
  };
}

// ── 核心请求函数 ───────────────────────────────────

export async function requestDeepSeekJson({
  systemPrompt,
  userMessage,
  fetcher = fetch,
}: RequestDeepSeekJsonInput): Promise<string> {
  const { apiKey, model } = getDeepSeekConfig();
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    let response: Response;

    try {
      response = await fetcher(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
          response_format: {
            type: "json_object",
          },
          thinking: {
            type: "disabled",
          },
          max_tokens: 800,
          stream: false,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new DeepSeekError(
          "timeout",
          "DeepSeek 请求超时",
        );
      }

      throw new DeepSeekError(
        "network_error",
        "无法连接 DeepSeek",
      );
    }

    if (!response.ok) {
      throw new DeepSeekError(
        "http_error",
        `DeepSeek 请求失败，状态码：${response.status}`,
        response.status,
      );
    }

    let responseValue: unknown;

    try {
      responseValue = await response.json();
    } catch {
      throw new DeepSeekError(
        "invalid_response",
        "DeepSeek 响应不是合法 JSON",
      );
    }

    const parsed = deepSeekResponseSchema.safeParse(responseValue);

    if (!parsed.success) {
      throw new DeepSeekError(
        "invalid_response",
        "DeepSeek 响应结构不符合预期",
      );
    }

    const choice = parsed.data.choices[0];

    if (choice.finish_reason === "length") {
      throw new DeepSeekError(
        "truncated_output",
        "DeepSeek 输出因长度限制被截断",
      );
    }

    const content = choice.message.content?.trim();

    if (!content) {
      throw new DeepSeekError(
        "empty_content",
        "DeepSeek 没有返回可用内容",
      );
    }

    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}