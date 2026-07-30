import { describe, expect, it } from "vitest";
import { parseFinanceIntent } from "../../lib/ai/parse-finance-intent";

describe("parseFinanceIntent", () => {
  // ── 合法 JSON 且契约正确 ───────────────────────

  it("解析合法 savings_goal 输出", () => {
    const result = parseFinanceIntent(
      JSON.stringify({
        type: "savings_goal",
        targetAmount: "500000",
        deadlineMonths: 24,
      }),
    );

    expect(result).toEqual({
      success: true,
      intent: {
        type: "savings_goal",
        targetAmount: "500000",
        deadlineMonths: 24,
      },
    });
  });

  it("解析合法 debt_payoff 输出", () => {
    const result = parseFinanceIntent(
      JSON.stringify({
        type: "debt_payoff",
        strategy: "avalanche",
        extraPayment: "2000",
      }),
    );

    expect(result).toEqual({
      success: true,
      intent: {
        type: "debt_payoff",
        strategy: "avalanche",
        extraPayment: "2000",
      },
    });
  });

  it("解析合法 cashflow_forecast 输出", () => {
    const result = parseFinanceIntent(
      JSON.stringify({
        type: "cashflow_forecast",
        months: 6,
      }),
    );

    expect(result).toEqual({
      success: true,
      intent: {
        type: "cashflow_forecast",
        months: 6,
      },
    });
  });

  it("解析合法 what_if 输出", () => {
    const result = parseFinanceIntent(
      JSON.stringify({
        type: "what_if",
        monthlyIncomeChange: "0",
        monthlyExpenseChange: "3000",
        horizonMonths: 24,
      }),
    );

    expect(result).toEqual({
      success: true,
      intent: {
        type: "what_if",
        monthlyIncomeChange: "0",
        monthlyExpenseChange: "3000",
        horizonMonths: 24,
      },
    });
  });

  // ── 非法 JSON ──────────────────────────────────

  it("区分非法 JSON（少括号）", () => {
    const result = parseFinanceIntent(
      '{"type":"cashflow_forecast","months":6',
    );

    expect(result).toMatchObject({
      success: false,
      reason: "invalid_json",
    });
  });

  it("区分非法 JSON（空字符串）", () => {
    const result = parseFinanceIntent("");

    expect(result).toMatchObject({
      success: false,
      reason: "invalid_json",
    });
  });

  it("区分非法 JSON（纯文本）", () => {
    const result = parseFinanceIntent("这不是 JSON");

    expect(result).toMatchObject({
      success: false,
      reason: "invalid_json",
    });
  });

  // ── 合法 JSON 但意图非法 ───────────────────────

  it("区分不符合契约的 JSON（未知 type）", () => {
    const result = parseFinanceIntent(
      JSON.stringify({
        type: "stock_recommendation",
      }),
    );

    expect(result).toMatchObject({
      success: false,
      reason: "invalid_intent",
    });
  });

  it("区分不符合契约的 JSON（月份超出上限）", () => {
    const result = parseFinanceIntent(
      JSON.stringify({
        type: "cashflow_forecast",
        months: 600,
      }),
    );

    expect(result).toMatchObject({
      success: false,
      reason: "invalid_intent",
    });
  });

  it("区分不符合契约的 JSON（缺少字段）", () => {
    const result = parseFinanceIntent(
      JSON.stringify({
        type: "savings_goal",
        deadlineMonths: 24,
      }),
    );

    expect(result).toMatchObject({
      success: false,
      reason: "invalid_intent",
    });
  });

  it("区分不符合契约的 JSON（多余字段）", () => {
    const result = parseFinanceIntent(
      JSON.stringify({
        type: "savings_goal",
        targetAmount: "500000",
        deadlineMonths: 24,
        reached: true,
      }),
    );

    expect(result).toMatchObject({
      success: false,
      reason: "invalid_intent",
    });
  });

  // ── 解析成功时数据完整 ─────────────────────────

  it("解析成功后返回完整 intent 对象", () => {
    const result = parseFinanceIntent(
      JSON.stringify({
        type: "what_if",
        monthlyIncomeChange: "-1000",
        monthlyExpenseChange: "-500",
        horizonMonths: 36,
      }),
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.intent.type).toBe("what_if");
      expect(result.intent.monthlyIncomeChange).toBe("-1000");
      expect(result.intent.monthlyExpenseChange).toBe("-500");
      expect(result.intent.horizonMonths).toBe(36);
    }
  });

  // ── 金额字符串必须是合法十进制 ─────────────────

  it("拒绝非法金额字符串（汉字）", () => {
    const result = parseFinanceIntent(
      JSON.stringify({
        type: "savings_goal",
        targetAmount: "五十万",
        deadlineMonths: 24,
      }),
    );

    expect(result).toMatchObject({
      success: false,
      reason: "invalid_intent",
    });
  });
});