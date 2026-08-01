import { SAVINGS_GOAL_FORMULA_VERSION } from "./savings-goal";
import type { SavingsGoalInput, SavingsGoalResult } from "./savings-goal";

// ── ModelTrace 类型 ───────────────────────────────

export type ModelTrace = {
  provider: "deepseek";
  model: string;
  parsedIntent: "savings_goal";
};

// ── 历史构造 ──────────────────────────────────────

export function buildSavingsGoalHistory(
  input: SavingsGoalInput,
  result: SavingsGoalResult,
  id: string,
  createdAt: number,
  modelTrace: ModelTrace | null = null,
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
    modelTraceJson: modelTrace ? JSON.stringify(modelTrace) : null,
    createdAt,
  };
}