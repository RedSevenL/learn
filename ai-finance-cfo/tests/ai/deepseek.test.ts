import { afterEach, expect, it } from "vitest";
import { DEEPSEEK_API_URL, requestDeepSeekJson } from "../../lib/ai/deepseek";

const originalApiKey = process.env.DEEPSEEK_API_KEY;
const originalModel = process.env.DEEPSEEK_MODEL;

afterEach(() => {
  // 恢复环境变量到测试前状态
  if (originalApiKey === undefined) {
    delete process.env.DEEPSEEK_API_KEY;
  } else {
    process.env.DEEPSEEK_API_KEY = originalApiKey;
  }

  if (originalModel === undefined) {
    delete process.env.DEEPSEEK_MODEL;
  } else {
    process.env.DEEPSEEK_MODEL = originalModel;
  }
});

// ── 假 fetch 工厂 ─────────────────────────────────

function fakeFetcher(
  body: unknown,
  status = 200,
): typeof fetch {
  return async (url: RequestInfo | URL) => {
    // 验证请求 URL 正确
    expect(url.toString()).toBe(DEEPSEEK_API_URL);

    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };
}

// ── 缺少 API Key ──────────────────────────────────

it("缺少 API Key 时明确失败", async () => {
  delete process.env.DEEPSEEK_API_KEY;
  process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

  await expect(
    requestDeepSeekJson({
      systemPrompt: "只输出 JSON",
      userMessage: "测试",
    }),
  ).rejects.toMatchObject({
    code: "missing_api_key",
  });
});

// ── HTTP 错误 ──────────────────────────────────────

it("401 转换为 http_error", async () => {
  process.env.DEEPSEEK_API_KEY = "test-api-key";
  process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

  const fetcher = fakeFetcher(
    { error: { message: "Unauthorized" } },
    401,
  );

  await expect(
    requestDeepSeekJson({
      systemPrompt: "只输出 JSON",
      userMessage: "测试",
      fetcher,
    }),
  ).rejects.toMatchObject({
    code: "http_error",
    status: 401,
  });
});

it("500 转换为 http_error", async () => {
  process.env.DEEPSEEK_API_KEY = "test-api-key";
  process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

  const fetcher = fakeFetcher(
    { error: { message: "Internal Server Error" } },
    500,
  );

  await expect(
    requestDeepSeekJson({
      systemPrompt: "只输出 JSON",
      userMessage: "测试",
      fetcher,
    }),
  ).rejects.toMatchObject({
    code: "http_error",
    status: 500,
  });
});

// ── 非法响应 JSON ─────────────────────────────────

it("非法响应 JSON 转换为 invalid_response", async () => {
  process.env.DEEPSEEK_API_KEY = "test-api-key";
  process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

  // 响应体不是合法 JSON
  const fetcher: typeof fetch = async () =>
    new Response("不是 JSON", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  await expect(
    requestDeepSeekJson({
      systemPrompt: "只输出 JSON",
      userMessage: "测试",
      fetcher,
    }),
  ).rejects.toMatchObject({
    code: "invalid_response",
  });
});

// ── 非法响应结构 ──────────────────────────────────

it("非法响应结构转换为 invalid_response", async () => {
  process.env.DEEPSEEK_API_KEY = "test-api-key";
  process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

  // 缺少 choices 字段
  const fetcher = fakeFetcher({});

  await expect(
    requestDeepSeekJson({
      systemPrompt: "只输出 JSON",
      userMessage: "测试",
      fetcher,
    }),
  ).rejects.toMatchObject({
    code: "invalid_response",
  });
});

it("空 choices 数组转换为 invalid_response", async () => {
  process.env.DEEPSEEK_API_KEY = "test-api-key";
  process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

  const fetcher = fakeFetcher({
    choices: [],
  });

  await expect(
    requestDeepSeekJson({
      systemPrompt: "只输出 JSON",
      userMessage: "测试",
      fetcher,
    }),
  ).rejects.toMatchObject({
    code: "invalid_response",
  });
});

// ── 空 content ─────────────────────────────────────

it("空 content 转换为 empty_content", async () => {
  process.env.DEEPSEEK_API_KEY = "test-api-key";
  process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

  const fetcher = fakeFetcher({
    choices: [
      {
        finish_reason: "stop",
        message: { content: "" },
      },
    ],
  });

  await expect(
    requestDeepSeekJson({
      systemPrompt: "只输出 JSON",
      userMessage: "测试",
      fetcher,
    }),
  ).rejects.toMatchObject({
    code: "empty_content",
  });
});

// ── 截断输出 ──────────────────────────────────────

it("finish_reason length 转换为 truncated_output", async () => {
  process.env.DEEPSEEK_API_KEY = "test-api-key";
  process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

  const fetcher = fakeFetcher({
    choices: [
      {
        finish_reason: "length",
        message: {
          content: '{"type":"savings_goal"',
        },
      },
    ],
  });

  await expect(
    requestDeepSeekJson({
      systemPrompt: "只输出 JSON",
      userMessage: "测试",
      fetcher,
    }),
  ).rejects.toMatchObject({
    code: "truncated_output",
  });
});

// ── 成功响应 ──────────────────────────────────────

it("成功返回模型 content", async () => {
  process.env.DEEPSEEK_API_KEY = "test-api-key";
  process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

  const fetcher = fakeFetcher({
    choices: [
      {
        finish_reason: "stop",
        message: {
          content: JSON.stringify({
            type: "cashflow_forecast",
            months: 6,
          }),
        },
      },
    ],
  });

  const content = await requestDeepSeekJson({
    systemPrompt: "只输出 JSON",
    userMessage: "预测未来半年现金流",
    fetcher,
  });

  expect(JSON.parse(content)).toEqual({
    type: "cashflow_forecast",
    months: 6,
  });
});