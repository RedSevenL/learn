import { describe, expect, it } from "vitest";
import { financeIntentSchema } from "../../schemas/ai-intent";

describe("financeIntentSchema", () => {
  // ── 四类合法意图 ────────────────────────────────

  it.each([
    {
      name: "savings_goal",
      intent: {
        type: "savings_goal" as const,
        targetAmount: "500000",
        deadlineMonths: 24,
      },
    },
    {
      name: "debt_payoff",
      intent: {
        type: "debt_payoff" as const,
        strategy: "avalanche" as const,
        extraPayment: "2000",
      },
    },
    {
      name: "cashflow_forecast",
      intent: {
        type: "cashflow_forecast" as const,
        months: 6,
      },
    },
    {
      name: "what_if",
      intent: {
        type: "what_if" as const,
        monthlyIncomeChange: "0",
        monthlyExpenseChange: "3000",
        horizonMonths: 24,
      },
    },
  ])("接受 $name 意图", ({ intent }) => {
    const result = financeIntentSchema.safeParse(intent);

    expect(result.success).toBe(true);
  });

  // ── 未知 type ───────────────────────────────────

  it("拒绝未知意图", () => {
    const result = financeIntentSchema.safeParse({
      type: "stock_recommendation",
      symbol: "ABC",
    });

    expect(result.success).toBe(false);
  });

  // ── 缺少字段 ────────────────────────────────────

  it("拒绝缺少 targetAmount 的 savings_goal", () => {
    const result = financeIntentSchema.safeParse({
      type: "savings_goal",
      deadlineMonths: 24,
    });

    expect(result.success).toBe(false);
  });

  it("拒绝缺少 strategy 的 debt_payoff", () => {
    const result = financeIntentSchema.safeParse({
      type: "debt_payoff",
      extraPayment: "2000",
    });

    expect(result.success).toBe(false);
  });

  it("拒绝缺少 months 的 cashflow_forecast", () => {
    const result = financeIntentSchema.safeParse({
      type: "cashflow_forecast",
    });

    expect(result.success).toBe(false);
  });

  it("拒绝缺少 horizonMonths 的 what_if", () => {
    const result = financeIntentSchema.safeParse({
      type: "what_if",
      monthlyIncomeChange: "0",
      monthlyExpenseChange: "3000",
    });

    expect(result.success).toBe(false);
  });

  // ── 非法金额 ────────────────────────────────────

  it("拒绝非法目标金额（不是数字字符串）", () => {
    const result = financeIntentSchema.safeParse({
      type: "savings_goal",
      targetAmount: "五十万",
      deadlineMonths: 24,
    });

    expect(result.success).toBe(false);
  });

  it("拒绝目标金额为 0", () => {
    const result = financeIntentSchema.safeParse({
      type: "savings_goal",
      targetAmount: "0",
      deadlineMonths: 24,
    });

    expect(result.success).toBe(false);
  });

  it("拒绝带单位的变化金额", () => {
    const result = financeIntentSchema.safeParse({
      type: "what_if",
      monthlyIncomeChange: "0",
      monthlyExpenseChange: "3000元",
      horizonMonths: 24,
    });

    expect(result.success).toBe(false);
  });

  // ── 非整数月份 ──────────────────────────────────

  it("拒绝非整数预测月份", () => {
    const result = financeIntentSchema.safeParse({
      type: "cashflow_forecast",
      months: 6.5,
    });

    expect(result.success).toBe(false);
  });

  // ── 超出期限上限 ────────────────────────────────

  it("拒绝超出上限的预测月份", () => {
    const result = financeIntentSchema.safeParse({
      type: "cashflow_forecast",
      months: 61,
    });

    expect(result.success).toBe(false);
  });

  it("拒绝超出上限的 deadlineMonths", () => {
    const result = financeIntentSchema.safeParse({
      type: "savings_goal",
      targetAmount: "500000",
      deadlineMonths: 1201,
    });

    expect(result.success).toBe(false);
  });

  it("拒绝超出上限的 horizonMonths", () => {
    const result = financeIntentSchema.safeParse({
      type: "what_if",
      monthlyIncomeChange: "0",
      monthlyExpenseChange: "3000",
      horizonMonths: 1201,
    });

    expect(result.success).toBe(false);
  });

  // ── 多余计算结果字段 ────────────────────────────

  it("拒绝模型擅自返回计算结论", () => {
    const result = financeIntentSchema.safeParse({
      type: "savings_goal",
      targetAmount: "500000",
      deadlineMonths: 24,
      reached: true,
    });

    expect(result.success).toBe(false);
  });

  it("拒绝返回多余字段", () => {
    const result = financeIntentSchema.safeParse({
      type: "debt_payoff",
      strategy: "snowball",
      extraPayment: "2000",
      totalInterest: "5000",
    });

    expect(result.success).toBe(false);
  });

  // ── 策略非法 ────────────────────────────────────

  it("拒绝未知债务策略", () => {
    const result = financeIntentSchema.safeParse({
      type: "debt_payoff",
      strategy: "highest_interest_first",
      extraPayment: "2000",
    });

    expect(result.success).toBe(false);
  });

  // ── 月份为 0 或负数 ─────────────────────────────

  it("拒绝月份为 0 的 cashflow_forecast", () => {
    const result = financeIntentSchema.safeParse({
      type: "cashflow_forecast",
      months: 0,
    });

    expect(result.success).toBe(false);
  });

  it("拒绝月份为负数的 savings_goal", () => {
    const result = financeIntentSchema.safeParse({
      type: "savings_goal",
      targetAmount: "500000",
      deadlineMonths: -24,
    });

    expect(result.success).toBe(false);
  });

  // ── 金额精度 ────────────────────────────────────

  it("接受两位小数的目标金额", () => {
    const result = financeIntentSchema.safeParse({
      type: "savings_goal",
      targetAmount: "500000.50",
      deadlineMonths: 24,
    });

    expect(result.success).toBe(true);
  });

  it("拒绝超过两位小数的目标金额", () => {
    const result = financeIntentSchema.safeParse({
      type: "savings_goal",
      targetAmount: "500000.123",
      deadlineMonths: 24,
    });

    expect(result.success).toBe(false);
  });
});