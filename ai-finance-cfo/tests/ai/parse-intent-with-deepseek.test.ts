import { afterEach, expect, it } from "vitest";
import { parseIntentWithDeepSeek } from "../../lib/ai/parse-intent-with-deepseek";
import { DEEPSEEK_API_URL } from "../../lib/ai/deepseek";

const originalApiKey = process.env.DEEPSEEK_API_KEY;
const originalModel = process.env.DEEPSEEK_MODEL;

afterEach(() => {
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

function fakeFetcher(body: unknown, status = 200): typeof fetch {
  return async (url: RequestInfo | URL) => {
    expect(url.toString()).toBe(DEEPSEEK_API_URL);
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };
}

// ── 成功案例 ──────────────────────────────────────

it("解析合法 savings_goal 意图", async () => {
  process.env.DEEPSEEK_API_KEY = "test-api-key";
  process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

  const fetcher = fakeFetcher({
    choices: [
      {
        finish_reason: "stop",
        message: {
          content: JSON.stringify({
            type: "savings_goal",
            targetAmount: "500000",
            deadlineMonths: 24,
          }),
        },
      },
    ],
  });

  const intent = await parseIntentWithDeepSeek(
    "我两年内能攒够 50 万吗？",
    fetcher,
  );

  expect(intent).toEqual({
    type: "savings_goal",
    targetAmount: "500000",
    deadlineMonths: 24,
  });
});

it("解析合法 what_if 意图", async () => {
  process.env.DEEPSEEK_API_KEY = "test-api-key";
  process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

  const fetcher = fakeFetcher({
    choices: [
      {
        finish_reason: "stop",
        message: {
          content: JSON.stringify({
            type: "what_if",
            monthlyIncomeChange: "0",
            monthlyExpenseChange: "3000",
            horizonMonths: 24,
          }),
        },
      },
    ],
  });

  const intent = await parseIntentWithDeepSeek(
    "如果每月多花 3000 元，两年后会怎样？",
    fetcher,
  );

  expect(intent).toEqual({
    type: "what_if",
    monthlyIncomeChange: "0",
    monthlyExpenseChange: "3000",
    horizonMonths: 24,
  });
});

// ── 边界情况 ──────────────────────────────────────

it("拒绝空消息", async () => {
  process.env.DEEPSEEK_API_KEY = "test-api-key";
  process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

  await expect(parseIntentWithDeepSeek("")).rejects.toThrow(
    "问题不能为空",
  );

  await expect(parseIntentWithDeepSeek("   ")).rejects.toThrow(
    "问题不能为空",
  );
});

it("拒绝超长消息", async () => {
  process.env.DEEPSEEK_API_KEY = "test-api-key";
  process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

  const longMessage = "a".repeat(2001);

  await expect(
    parseIntentWithDeepSeek(longMessage),
  ).rejects.toThrow("问题不能超过 2000 个字符");
});

// ── 模型返回非法意图 ──────────────────────────────

it("模型返回非法意图时抛错误", async () => {
  process.env.DEEPSEEK_API_KEY = "test-api-key";
  process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

  const fetcher = fakeFetcher({
    choices: [
      {
        finish_reason: "stop",
        message: {
          content: JSON.stringify({
            type: "stock_recommendation",
          }),
        },
      },
    ],
  });

  await expect(
    parseIntentWithDeepSeek("推荐股票", fetcher),
  ).rejects.toThrow("DeepSeek 意图解析失败");
});