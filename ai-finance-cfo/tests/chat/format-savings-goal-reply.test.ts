import { describe, expect, it } from "vitest";
import { formatSavingsGoalReply } from "../../lib/chat/format-savings-goal-reply";
import type { SavingsGoalResult } from "../../lib/finance/savings-goal";
import type { SavingsGoalContext } from "../../lib/chat/build-savings-goal-context";

describe("formatSavingsGoalReply", () => {
  const baseContext: SavingsGoalContext = {
    input: {
      targetAmount: "500000",
      currentAmount: "100000",
      monthlySaving: "12000",
      annualRate: "3",
      months: 24,
    },
    dataMonth: "2026-07",
    currentAmountSource: "cash_and_bank_accounts",
    monthlySavingSource: "current_month_surplus",
  };

  it("未达标时返回缺口和所需月储蓄", () => {
    const calculation: SavingsGoalResult = {
      targetAmount: "500000.00",
      currentAmount: "100000.00",
      monthlySaving: "12000.00",
      annualRate: "3",
      months: 24,
      projectedAmount: "402609.52",
      reached: false,
      gap: "97390.48",
      excess: "0.00",
      requiredMonthlySaving: "15942.49",
      steps: [],
    };

    const reply = formatSavingsGoalReply(calculation, baseContext);

    // input 中的金额是原始字符串，不含小数尾缀 .00
    expect(reply).toContain("2026-07");
    expect(reply).toContain("100000");
    expect(reply).toContain("12000");
    expect(reply).toContain("3%");
    expect(reply).toContain("402609.52");
    expect(reply).toContain("500000");
    expect(reply).toContain("97390.48");
    expect(reply).toContain("15942.49");
  });

  it("达标时返回超出金额", () => {
    const calculation: SavingsGoalResult = {
      targetAmount: "100000.00",
      currentAmount: "80000.00",
      monthlySaving: "10000.00",
      annualRate: "0",
      months: 3,
      projectedAmount: "110000.00",
      reached: true,
      gap: "0.00",
      excess: "10000.00",
      requiredMonthlySaving: "6666.67",
      steps: [],
    };

    const context: SavingsGoalContext = {
      ...baseContext,
      input: {
        ...baseContext.input,
        targetAmount: "100000",
        currentAmount: "80000",
        monthlySaving: "10000",
        annualRate: "0",
        months: 3,
      },
    };

    const reply = formatSavingsGoalReply(calculation, context);

    expect(reply).toContain("10000");
    expect(reply).toContain("可以达到");
    expect(reply).toContain("超出");
  });
});