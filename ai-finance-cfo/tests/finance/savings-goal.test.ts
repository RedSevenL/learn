import { describe, expect, it } from "vitest";
import { calculateSavingsGoal } from "../../lib/finance/savings-goal";

describe("calculateSavingsGoal", () => {
  it("计算复利后的目标缺口和所需月储蓄额", () => {
    const result = calculateSavingsGoal({
      targetAmount: "500000",
      currentAmount: "100000",
      monthlySaving: "12000",
      annualRate: "3",
      months: 24,
    });

    expect(result.projectedAmount).toBe("402609.52");
    expect(result.reached).toBe(false);
    expect(result.gap).toBe("97390.48");
    expect(result.excess).toBe("0.00");
    expect(result.requiredMonthlySaving).toBe("15942.49");

    expect(result.steps.map((step) => step.id)).toEqual([
      "monthly_rate",
      "growth_factors",
      "future_value_components",
      "projected_amount",
      "target_comparison",
      "required_monthly_saving",
    ]);

    const monthlyRateStep = result.steps.find(
      (step) => step.id === "monthly_rate",
    );

    expect(monthlyRateStep?.outputs.monthlyRate).toBe("0.0025");

    const comparisonStep = result.steps.find(
      (step) => step.id === "target_comparison",
    );

    expect(comparisonStep?.outputs).toEqual({
      reached: false,
      gap: "97390.48",
      excess: "0.00",
    });
  });

  it("年化收益率为 0 时使用简单累加", () => {
    const result = calculateSavingsGoal({
      targetAmount: "500000",
      currentAmount: "100000",
      monthlySaving: "12000",
      annualRate: "0",
      months: 24,
    });

    expect(result.projectedAmount).toBe("388000.00");
    expect(result.reached).toBe(false);
    expect(result.gap).toBe("112000.00");
    expect(result.requiredMonthlySaving).toBe("16666.67");
  });

  it("达成目标时返回超额金额", () => {
    const result = calculateSavingsGoal({
      targetAmount: "100000",
      currentAmount: "80000",
      monthlySaving: "10000",
      annualRate: "0",
      months: 3,
    });

    expect(result.projectedAmount).toBe("110000.00");
    expect(result.reached).toBe(true);
    expect(result.gap).toBe("0.00");
    expect(result.excess).toBe("10000.00");
    expect(result.requiredMonthlySaving).toBe("6666.67");
  });

  it("当前金额已经能达到目标时所需月储蓄为 0", () => {
    const result = calculateSavingsGoal({
      targetAmount: "100000",
      currentAmount: "100000",
      monthlySaving: "0",
      annualRate: "0",
      months: 12,
    });

    expect(result.reached).toBe(true);
    expect(result.projectedAmount).toBe("100000.00");
    expect(result.requiredMonthlySaving).toBe("0.00");
  });

  it("拒绝为 0 的目标金额", () => {
    expect(() =>
      calculateSavingsGoal({
        targetAmount: "0",
        currentAmount: "100000",
        monthlySaving: "12000",
        annualRate: "3",
        months: 24,
      }),
    ).toThrow("目标金额必须大于 0");
  });

  it("拒绝负的当前金额", () => {
    expect(() =>
      calculateSavingsGoal({
        targetAmount: "500000",
        currentAmount: "-1",
        monthlySaving: "12000",
        annualRate: "3",
        months: 24,
      }),
    ).toThrow("当前金额不能为负数");
  });

  it("拒绝负的每月储蓄", () => {
    expect(() =>
      calculateSavingsGoal({
        targetAmount: "500000",
        currentAmount: "100000",
        monthlySaving: "-1",
        annualRate: "3",
        months: 24,
      }),
    ).toThrow("每月储蓄不能为负数");
  });

  it.each([
    {
      field: "年化收益率",
      input: {
        targetAmount: "500000",
        currentAmount: "100000",
        monthlySaving: "12000",
        annualRate: "-1",
        months: 24,
      },
      message: "年化收益率不能为负数",
    },
    {
      field: "年化收益率（非有限数字）",
      input: {
        targetAmount: "500000",
        currentAmount: "100000",
        monthlySaving: "12000",
        annualRate: "NaN",
        months: 24,
      },
      message: "年化收益率必须是有限数字",
    },
  ])("拒绝非法$field", ({ input, message }) => {
    expect(() => calculateSavingsGoal(input)).toThrow(message);
  });

  it("拒绝不是正整数的期限", () => {
    expect(() =>
      calculateSavingsGoal({
        targetAmount: "500000",
        currentAmount: "100000",
        monthlySaving: "12000",
        annualRate: "3",
        months: 0,
      }),
    ).toThrow("期限必须是大于 0 的整数月");

    expect(() =>
      calculateSavingsGoal({
        targetAmount: "500000",
        currentAmount: "100000",
        monthlySaving: "12000",
        annualRate: "3",
        months: 1.5,
      }),
    ).toThrow("期限必须是大于 0 的整数月");
  });

  it("支持 1 个月期限", () => {
    const result = calculateSavingsGoal({
      targetAmount: "1100",
      currentAmount: "1000",
      monthlySaving: "100",
      annualRate: "0",
      months: 1,
    });

    expect(result.projectedAmount).toBe("1100.00");
    expect(result.reached).toBe(true);
    expect(result.gap).toBe("0.00");
  });

  it("零收益率分支步骤记录正确的annuityFactor", () => {
    const result = calculateSavingsGoal({
      targetAmount: "500000",
      currentAmount: "100000",
      monthlySaving: "12000",
      annualRate: "0",
      months: 24,
    });

    const growthStep = result.steps.find(
      (step) => step.id === "growth_factors",
    );

    expect(growthStep?.outputs.growthFactor).toBe("1");
    expect(growthStep?.outputs.annuityFactor).toBe("24");
  });

  it("steps 可以 JSON 序列化", () => {
    const result = calculateSavingsGoal({
      targetAmount: "500000",
      currentAmount: "100000",
      monthlySaving: "12000",
      annualRate: "3",
      months: 24,
    });

    const json = JSON.stringify(result.steps);
    const parsed = JSON.parse(json);

    expect(parsed).toHaveLength(6);
    expect(parsed[0].id).toBe("monthly_rate");
  });
});