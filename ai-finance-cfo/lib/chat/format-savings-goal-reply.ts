import type { SavingsGoalResult } from "@/lib/finance/savings-goal";
import type { SavingsGoalContext } from "./build-savings-goal-context";

// ── 回复函数 ──────────────────────────────────────

export function formatSavingsGoalReply(
  calculation: SavingsGoalResult,
  context: SavingsGoalContext,
): string {
  const { dataMonth, input } = context;
  const { projectedAmount, reached, gap, excess, requiredMonthlySaving } =
    calculation;

  const start = `按照 ${dataMonth} 的财务数据，你目前有 ${input.currentAmount} 元流动资产，每月结余 ${input.monthlySaving} 元。`;

  const rate = `按年化 ${input.annualRate}% 估算，${input.months} 个月后预计为 ${projectedAmount} 元`;

  if (reached) {
    return (
      `${start}${rate}，可以达到 ${input.targetAmount} 元的目标，超出 ${excess} 元。`
    );
  }

  return (
    `${start}${rate}，距离 ${input.targetAmount} 元还差 ${gap} 元；` +
    `达到目标每月至少需要储蓄 ${requiredMonthlySaving} 元。`
  );
}