import { describe, expect, it } from "vitest";
import { buildSavingsGoalContext } from "../../lib/chat/build-savings-goal-context";
import type { CashFlowTransaction, CashFlowAccount } from "../../lib/finance/cash-flow";

// ── 固定时间：使用 Date.UTC 避免字符串解析差异 ──

const SHANGHAI_OFFSET = 8 * 60 * 60 * 1000;

/** 返回上海时区指定日期对应 UTC 时间戳 */
function shanghaiMs(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day) - SHANGHAI_OFFSET;
}

const fixedNow = () => shanghaiMs(2026, 7, 15) + 12 * 60 * 60 * 1000;

const sampleTransactions: CashFlowTransaction[] = [
  {
    amount: "30000",
    direction: "income",
    category: "工资",
    occurredAt: shanghaiMs(2026, 7, 1),
  },
  {
    amount: "6000",
    direction: "expense",
    category: "居住",
    occurredAt: shanghaiMs(2026, 7, 3),
  },
  {
    amount: "12000",
    direction: "expense",
    category: "日常消费",
    occurredAt: shanghaiMs(2026, 7, 5),
  },
];

const sampleAccounts: CashFlowAccount[] = [
  { type: "bank", balance: "80000" },
  { type: "cash", balance: "20000" },
  { type: "credit", balance: "-3500" },
];

describe("buildSavingsGoalContext", () => {
  it("正确构造储蓄目标输入", () => {
    const result = buildSavingsGoalContext(
      "500000",
      24,
      sampleTransactions,
      sampleAccounts,
      fixedNow,
    );

    expect(result.input.targetAmount).toBe("500000");
    expect(result.input.months).toBe(24);
    expect(result.input.currentAmount).toBe("100000.00"); // 80000 + 20000
    expect(result.input.monthlySaving).toBe("12000.00"); // 30000 - 6000 - 12000
    expect(result.input.annualRate).toBe("3");
    expect(result.dataMonth).toBe("2026-07");
    expect(result.currentAmountSource).toBe("cash_and_bank_accounts");
    expect(result.monthlySavingSource).toBe("current_month_surplus");
  });

  it("没有现金流时抛出 FINANCIAL_DATA_NOT_READY", () => {
    expect(() =>
      buildSavingsGoalContext(
        "500000",
        24,
        [], // 没有交易
        sampleAccounts,
        fixedNow,
      ),
    ).toThrow("还没有可用于估算的收支流水");
  });

  it("月结余为负时抛出 NEGATIVE_MONTHLY_SURPLUS", () => {
    const highExpenseTransactions: CashFlowTransaction[] = [
      {
        amount: "30000",
        direction: "income",
        category: "工资",
        occurredAt: shanghaiMs(2026, 7, 1),
      },
      {
        amount: "35000",
        direction: "expense",
        category: "日常消费",
        occurredAt: shanghaiMs(2026, 7, 3),
      },
    ];

    expect(() =>
      buildSavingsGoalContext(
        "500000",
        24,
        highExpenseTransactions,
        sampleAccounts,
        fixedNow,
      ),
    ).toThrow("支出高于收入");
  });
});