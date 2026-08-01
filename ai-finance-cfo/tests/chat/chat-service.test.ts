import { describe, expect, it } from "vitest";
import { executeChatService } from "../../lib/chat/chat-service";
import type { FinanceIntent } from "../../schemas/ai-intent";
import type { SavingsGoalInput } from "../../lib/finance/savings-goal";

// ── 固定时间：使用 Date.UTC 避免字符串解析差异 ──

// SHANGHAI_OFFSET_MS = +8 hours in ms
const SHANGHAI_OFFSET = 8 * 60 * 60 * 1000;

/** 返回上海时区指定日期对应 UTC 时间戳 */
function shanghaiMs(year: number, month: number, day: number): number {
  // Date.UTC 得到 0 时区的时间戳，加 8 小时即上海 00:00 对应的 UTC ms
  return Date.UTC(year, month - 1, day) - SHANGHAI_OFFSET;
}

const fixedNow = () => shanghaiMs(2026, 7, 15) + 12 * 60 * 60 * 1000; // 2026-07-15 12:00 上海

// ── 假事务和账户 ──────────────────────────────────

const sampleTransactions = [
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

const sampleAccounts = [
  { type: "bank", balance: "80000" },
  { type: "cash", balance: "20000" },
];

describe("executeChatService", () => {
  const savingsGoalIntent: FinanceIntent = {
    type: "savings_goal",
    targetAmount: "500000",
    deadlineMonths: 24,
  };

  const whatIfIntent: FinanceIntent = {
    type: "what_if",
    monthlyIncomeChange: "0",
    monthlyExpenseChange: "3000",
    horizonMonths: 24,
  };

  it("完整 savings_goal 成功路径", async () => {
    let savedInput: SavingsGoalInput | null = null;
    let savedTrace: unknown = null;

    const result = await executeChatService(savingsGoalIntent, {
      listTransactions: async () => sampleTransactions,
      listAccounts: async () => sampleAccounts,
      saveSavingsGoalCalculation: async (input, _result, trace) => {
        savedInput = input;
        savedTrace = trace;
        return { id: "history-test-001" };
      },
      nowFn: fixedNow,
    });

    expect(result.intent).toEqual(savingsGoalIntent);
    expect(result.historyId).toBe("history-test-001");
    expect(result.reply).toBeTruthy();
    expect(result.reply).toContain("2026-07");

    expect(result.calculation.projectedAmount).toBe("402609.52");
    expect(result.calculation.reached).toBe(false);

    expect(result.assumptions.dataMonth).toBe("2026-07");
    expect(result.assumptions.annualRate).toBe("3");

    // 验证保存的参数
    expect(savedInput).not.toBeNull();
    expect(savedInput!.targetAmount).toBe("500000");
    expect(savedInput!.currentAmount).toBe("100000.00");
    expect(savedInput!.monthlySaving).toBe("12000.00");

    // 验证 trace
    expect(savedTrace).toEqual({
      provider: "deepseek",
      model: "deepseek-v4-flash",
      parsedIntent: "savings_goal",
    });
  });

  it("不支持的意图类型抛出 UNSUPPORTED_INTENT", async () => {
    await expect(
      executeChatService(whatIfIntent, {
        listTransactions: async () => [],
        listAccounts: async () => [],
        saveSavingsGoalCalculation: async () => {
          throw new Error("不应调用");
        },
        nowFn: fixedNow,
      }),
    ).rejects.toThrow("暂不支持的意图类型");
  });

  it("历史保存失败抛出 HISTORY_SAVE_FAILED", async () => {
    await expect(
      executeChatService(savingsGoalIntent, {
        listTransactions: async () => sampleTransactions,
        listAccounts: async () => sampleAccounts,
        saveSavingsGoalCalculation: async () => {
          throw new Error("数据库写入失败");
        },
        nowFn: fixedNow,
      }),
    ).rejects.toThrow("历史记录保存失败");
  });
});