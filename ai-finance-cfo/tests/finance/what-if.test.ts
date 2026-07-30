import { describe, expect, it } from "vitest";
import { calculateWhatIf } from "../../lib/finance/what-if";

const baseline = {
  currentAmount: "100000",
  targetAmount: "500000",
  monthlyIncome: "20000",
  monthlyExpense: "8000",
  annualRate: "3",
  horizonMonths: 24,
};

describe("calculateWhatIf", () => {
  it("计算增加支出后的净资产和目标延期", () => {
    const result = calculateWhatIf({
      baseline,
      changes: {
        monthlyIncomeChange: "0",
        monthlyExpenseChange: "3000",
      },
    });

    expect(result.baseline.monthlySurplus).toBe("12000.00");
    expect(result.scenario.monthlySurplus).toBe("9000.00");

    expect(result.baseline.projectedNetWorth).toBe("402609.52");
    expect(result.scenario.projectedNetWorth).toBe("328501.06");

    expect(result.differences.projectedNetWorth).toBe("-74108.46");

    expect(result.differences.goalMonthDifference).toBe(10);
    expect(result.differences.goalTimingImpact).toBe("delayed");
  });

  it("减少支出时目标会提前", () => {
    const result = calculateWhatIf({
      baseline,
      changes: {
        monthlyIncomeChange: "0",
        monthlyExpenseChange: "-2000",
      },
    });

    expect(result.scenario.monthlySurplus).toBe("14000.00");
    expect(result.differences.monthlySurplus).toBe("2000.00");
    expect(result.differences.goalTimingImpact).toBe("accelerated");
    expect(result.differences.goalMonthDifference).toBeLessThan(0);
  });

  it("收入支出都没有变化时基准和场景结果一致", () => {
    const result = calculateWhatIf({
      baseline,
      changes: {
        monthlyIncomeChange: "0",
        monthlyExpenseChange: "0",
      },
    });

    expect(result.baseline.monthlySurplus).toBe("12000.00");
    expect(result.scenario.monthlySurplus).toBe("12000.00");
    expect(result.baseline.projectedNetWorth).toBe(
      result.scenario.projectedNetWorth,
    );
    expect(result.differences.monthlySurplus).toBe("0.00");
    expect(result.differences.projectedNetWorth).toBe("0.00");
    expect(result.differences.goalTimingImpact).toBe("unchanged");
    expect(result.differences.goalMonthDifference).toBe(0);
  });

  it("场景月结余可以为负数", () => {
    const result = calculateWhatIf({
      baseline: {
        ...baseline,
        monthlyExpense: "19000",
      },
      changes: {
        monthlyIncomeChange: "0",
        monthlyExpenseChange: "3000",
      },
    });

    expect(result.scenario.monthlySurplus).toBe("-2000.00");
    expect(result.differences.goalTimingImpact).toBe("scenario_unreachable");
    expect(result.scenario.monthsToGoal).toBeNull();
  });

  it("零收益率下使用简单线性累加", () => {
    const result = calculateWhatIf({
      baseline: {
        ...baseline,
        annualRate: "0",
      },
      changes: {
        monthlyIncomeChange: "0",
        monthlyExpenseChange: "3000",
      },
    });

    // 基准：100000 + 12000*24 = 388000
    expect(result.baseline.projectedNetWorth).toBe("388000.00");

    // 场景：100000 + 9000*24 = 316000
    expect(result.scenario.projectedNetWorth).toBe("316000.00");
  });

  it("支持 1200 个月上限期限", () => {
    const result = calculateWhatIf({
      baseline: {
        ...baseline,
        horizonMonths: 1200,
      },
      changes: {
        monthlyIncomeChange: "0",
        monthlyExpenseChange: "0",
      },
    });

    expect(result.horizonMonths).toBe(1200);
    expect(result.baseline.projectedNetWorth).toBeTruthy();
  });

  it("拒绝变化后为负的月支出", () => {
    expect(() =>
      calculateWhatIf({
        baseline,
        changes: {
          monthlyIncomeChange: "0",
          monthlyExpenseChange: "-9000",
        },
      }),
    ).toThrow("变更后的月支出不能为负数");
  });

  it("拒绝目标金额为 0", () => {
    expect(() =>
      calculateWhatIf({
        baseline: {
          ...baseline,
          targetAmount: "0",
        },
        changes: {
          monthlyIncomeChange: "0",
          monthlyExpenseChange: "0",
        },
      }),
    ).toThrow("目标金额必须大于 0");
  });

  it("拒绝当前金额为负数", () => {
    expect(() =>
      calculateWhatIf({
        baseline: {
          ...baseline,
          currentAmount: "-1",
        },
        changes: {
          monthlyIncomeChange: "0",
          monthlyExpenseChange: "0",
        },
      }),
    ).toThrow("当前目标资金不能为负数");
  });

  it("拒绝负的年化收益率", () => {
    expect(() =>
      calculateWhatIf({
        baseline: {
          ...baseline,
          annualRate: "-1",
        },
        changes: {
          monthlyIncomeChange: "0",
          monthlyExpenseChange: "0",
        },
      }),
    ).toThrow("年化收益率必须是非负有限数字");
  });

  it("拒绝非整数观察期限", () => {
    expect(() =>
      calculateWhatIf({
        baseline: {
          ...baseline,
          horizonMonths: 1.5,
        },
        changes: {
          monthlyIncomeChange: "0",
          monthlyExpenseChange: "0",
        },
      }),
    ).toThrow("观察期限必须是 1 到 1200 的整数月");
  });

  it("当前金额已经达到目标时返回月份 0", () => {
    const result = calculateWhatIf({
      baseline: {
        ...baseline,
        currentAmount: "500000",
        monthlyExpense: "30000",
      },
      changes: {
        monthlyIncomeChange: "0",
        monthlyExpenseChange: "0",
      },
    });

    expect(result.baseline.monthsToGoal).toBe(0);
    expect(result.scenario.monthsToGoal).toBe(0);
  });

  it("基准和变更场景都不可达", () => {
    const result = calculateWhatIf({
      baseline: {
        ...baseline,
        monthlyIncome: "1000",
        monthlyExpense: "5000",
      },
      changes: {
        monthlyIncomeChange: "0",
        monthlyExpenseChange: "0",
      },
    });

    expect(result.differences.goalTimingImpact).toBe("both_unreachable");
    expect(result.differences.goalMonthDifference).toBeNull();
  });

  it("变化后从不可达变成可达", () => {
    const result = calculateWhatIf({
      baseline: {
        ...baseline,
        monthlyIncome: "1000",
        monthlyExpense: "5000",
      },
      changes: {
        monthlyIncomeChange: "20000",
        monthlyExpenseChange: "0",
      },
    });

    expect(result.differences.goalTimingImpact).toBe("scenario_reachable");
    expect(result.differences.goalMonthDifference).toBeNull();
  });

  it("收入和支出变化同时存在", () => {
    const result = calculateWhatIf({
      baseline,
      changes: {
        monthlyIncomeChange: "5000",
        monthlyExpenseChange: "2000",
      },
    });

    expect(result.scenario.monthlySurplus).toBe("15000.00");
    expect(result.differences.monthlySurplus).toBe("3000.00");
  });
});