import { SAVINGS_GOAL_FORMULA_VERSION } from "./savings-goal";
import type { SavingsGoalInput, SavingsGoalResult } from "./savings-goal";

export function buildSavingsGoalHistory(
  input: SavingsGoalInput,
  result: SavingsGoalResult,
  id: string,
  createdAt: number,
) {
  const { steps, ...output } = result;

  return {
    id,
    intentType: "savings_goal",
    inputJson: JSON.stringify(input),
    formulaJson: JSON.stringify({
      calculator: "savings_goal",
      version: SAVINGS_GOAL_FORMULA_VERSION,
      assumptions: {
        annualRateType: "nominal",
        contributionTiming: "month_end",
        moneyRounding: "half_up_2",
        requiredSavingRounding: "ceil_2",
      },
      steps,
    }),
    outputJson: JSON.stringify(output),
    modelTraceJson: null,
    createdAt,
  };
}