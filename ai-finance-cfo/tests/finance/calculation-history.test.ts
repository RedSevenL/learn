import { describe, expect, it } from "vitest";
import { calculateSavingsGoal } from "../../lib/finance/savings-goal";
import { buildSavingsGoalHistory } from "../../lib/finance/calculation-history";

describe("buildSavingsGoalHistory", () => {
  it("分别保存输入、公式步骤和输出", () => {
    const input = {
      targetAmount: "500000",
      currentAmount: "100000",
      monthlySaving: "12000",
      annualRate: "3",
      months: 24,
    };

    const result = calculateSavingsGoal(input);

    const history = buildSavingsGoalHistory(
      input,
      result,
      "history_test",
      1721952000000,
    );

    expect(history.intentType).toBe("savings_goal");

    expect(history.id).toBe("history_test");
    expect(history.createdAt).toBe(1721952000000);

    expect(JSON.parse(history.inputJson)).toEqual(input);

    const formula = JSON.parse(history.formulaJson);

    expect(formula.calculator).toBe("savings_goal");
    expect(formula.version).toBe("1.0.0");

    expect(formula.assumptions).toEqual({
      annualRateType: "nominal",
      contributionTiming: "month_end",
      moneyRounding: "half_up_2",
      requiredSavingRounding: "ceil_2",
    });

    expect(formula.steps).toHaveLength(6);

    const output = JSON.parse(history.outputJson);

    expect(output.projectedAmount).toBe("402609.52");
    expect(output.steps).toBeUndefined();
    expect(history.modelTraceJson).toBeNull();
  });
});