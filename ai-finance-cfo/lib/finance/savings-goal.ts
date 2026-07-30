import Decimal from "decimal.js";
import { createMoney, toMoneyString } from "./money";
import type { CalculationStep } from "./calculation-step";

// ── 帮助函数 ──────────────────────────────────────

function assertNonNegative(value: Decimal, fieldName: string) {
  if (value.isNegative()) {
    throw new Error(`${fieldName}不能为负数`);
  }
}

function assertMonths(months: number) {
  if (!Number.isInteger(months) || months <= 0) {
    throw new Error("期限必须是大于 0 的整数月");
  }
}

// ── 公式版本 ──────────────────────────────────────

export const SAVINGS_GOAL_FORMULA_VERSION = "1.0.0";

// ── 类型 ──────────────────────────────────────────

export type SavingsGoalInput = {
  targetAmount: string;
  currentAmount: string;
  monthlySaving: string;
  annualRate: string;
  months: number;
};

export type SavingsGoalResult = {
  targetAmount: string;
  currentAmount: string;
  monthlySaving: string;
  annualRate: string;
  months: number;
  projectedAmount: string;
  reached: boolean;
  gap: string;
  excess: string;
  requiredMonthlySaving: string;
  steps: CalculationStep[];
};

// ── 步骤构造函数 ──────────────────────────────────

type SavingsGoalStepValues = {
  targetAmount: Decimal;
  currentAmount: Decimal;
  monthlySaving: Decimal;
  annualRate: Decimal;
  months: number;
  monthlyRate: Decimal;
  growthFactor: Decimal;
  annuityFactor: Decimal;
  currentAmountFutureValue: Decimal;
  monthlySavingFutureValue: Decimal;
  projectedAmount: Decimal;
  reached: boolean;
  gap: Decimal;
  excess: Decimal;
  requiredMonthlySaving: Decimal;
};

function buildSavingsGoalSteps(values: SavingsGoalStepValues): CalculationStep[] {
  const {
    targetAmount,
    currentAmount,
    monthlySaving,
    annualRate,
    months,
    monthlyRate,
    growthFactor,
    annuityFactor,
    currentAmountFutureValue,
    monthlySavingFutureValue,
    projectedAmount,
    reached,
    gap,
    excess,
    requiredMonthlySaving,
  } = values;

  return [
    {
      id: "monthly_rate",
      title: "换算月收益率",
      description: "把名义年化百分比转换为月收益率。",
      formula: "annualRate / 100 / 12",
      inputs: {
        annualRate: annualRate.toString(),
      },
      outputs: {
        monthlyRate: monthlyRate.toString(),
      },
    },
    {
      id: "growth_factors",
      title: "计算复利因子",
      description: "计算本金增长因子和月末投入年金因子。",
      formula: "growth=(1+r)^n; annuity=r=0?n:(growth-1)/r",
      inputs: {
        monthlyRate: monthlyRate.toString(),
        months,
      },
      outputs: {
        growthFactor: growthFactor.toString(),
        annuityFactor: annuityFactor.toString(),
      },
    },
    {
      id: "future_value_components",
      title: "计算两部分期末价值",
      description: "分别计算当前金额和每月储蓄的期末价值。",
      formula: "currentFV=currentAmount*growth; savingFV=monthlySaving*annuity",
      inputs: {
        currentAmount: toMoneyString(currentAmount),
        monthlySaving: toMoneyString(monthlySaving),
        growthFactor: growthFactor.toString(),
        annuityFactor: annuityFactor.toString(),
      },
      outputs: {
        currentAmountFutureValue: currentAmountFutureValue.toString(),
        monthlySavingFutureValue: monthlySavingFutureValue.toString(),
      },
    },
    {
      id: "projected_amount",
      title: "计算预计期末金额",
      description: "把本金和每月储蓄的期末价值相加。",
      formula: "projectedAmount=currentFV+savingFV",
      inputs: {
        currentAmountFutureValue: currentAmountFutureValue.toString(),
        monthlySavingFutureValue: monthlySavingFutureValue.toString(),
      },
      outputs: {
        projectedAmountRaw: projectedAmount.toString(),
        projectedAmount: toMoneyString(projectedAmount),
      },
    },
    {
      id: "target_comparison",
      title: "比较目标金额",
      description: "判断是否达标，并返回缺口或超额。",
      formula: "compare(projectedAmount,targetAmount)",
      inputs: {
        projectedAmountRaw: projectedAmount.toString(),
        targetAmount: toMoneyString(targetAmount),
      },
      outputs: {
        reached,
        gap: toMoneyString(gap),
        excess: toMoneyString(excess),
      },
    },
    {
      id: "required_monthly_saving",
      title: "反推所需月储蓄额",
      description: "计算达到目标至少需要的月储蓄额，并向上取到分。",
      formula: "max(0,(targetAmount-currentFV)/annuityFactor)",
      inputs: {
        targetAmount: toMoneyString(targetAmount),
        currentAmountFutureValue: currentAmountFutureValue.toString(),
        annuityFactor: annuityFactor.toString(),
      },
      outputs: {
        requiredMonthlySaving: requiredMonthlySaving.toFixed(2, Decimal.ROUND_CEIL),
      },
    },
  ];
}

// ── 主函数 ────────────────────────────────────────

export function calculateSavingsGoal(input: SavingsGoalInput): SavingsGoalResult {
  const targetAmount = createMoney(input.targetAmount);
  const currentAmount = createMoney(input.currentAmount);
  const monthlySaving = createMoney(input.monthlySaving);
  const annualRate = new Decimal(input.annualRate);

  if (!annualRate.isFinite()) {
    throw new Error("年化收益率必须是有限数字");
  }

  if (targetAmount.lessThanOrEqualTo(0)) {
    throw new Error("目标金额必须大于 0");
  }

  assertNonNegative(currentAmount, "当前金额");
  assertNonNegative(monthlySaving, "每月储蓄");
  assertNonNegative(annualRate, "年化收益率");
  assertMonths(input.months);

  const monthlyRate = annualRate.dividedBy(100).dividedBy(12);

  let growthFactor: Decimal;
  let annuityFactor: Decimal;

  if (monthlyRate.isZero()) {
    growthFactor = new Decimal(1);
    annuityFactor = new Decimal(input.months);
  } else {
    growthFactor = monthlyRate.plus(1).pow(input.months);

    annuityFactor = growthFactor.minus(1).dividedBy(monthlyRate);
  }

  const currentAmountFutureValue = currentAmount.times(growthFactor);

  const monthlySavingFutureValue = monthlySaving.times(annuityFactor);

  const projectedAmount = currentAmountFutureValue.plus(monthlySavingFutureValue);

  const reached = projectedAmount.greaterThanOrEqualTo(targetAmount);

  const gap = reached ? new Decimal(0) : targetAmount.minus(projectedAmount);

  const excess = reached ? projectedAmount.minus(targetAmount) : new Decimal(0);

  const amountNeededAfterCurrentGrowth = targetAmount.minus(currentAmountFutureValue);

  const requiredMonthlySaving =
    amountNeededAfterCurrentGrowth.lessThanOrEqualTo(0)
      ? new Decimal(0)
      : amountNeededAfterCurrentGrowth.dividedBy(annuityFactor);

  const steps = buildSavingsGoalSteps({
    targetAmount,
    currentAmount,
    monthlySaving,
    annualRate,
    months: input.months,
    monthlyRate,
    growthFactor,
    annuityFactor,
    currentAmountFutureValue,
    monthlySavingFutureValue,
    projectedAmount,
    reached,
    gap,
    excess,
    requiredMonthlySaving,
  });

  return {
    targetAmount: toMoneyString(targetAmount),
    currentAmount: toMoneyString(currentAmount),
    monthlySaving: toMoneyString(monthlySaving),
    annualRate: annualRate.toString(),
    months: input.months,
    projectedAmount: toMoneyString(projectedAmount),
    reached,
    gap: toMoneyString(gap),
    excess: toMoneyString(excess),
    requiredMonthlySaving: requiredMonthlySaving.toFixed(2, Decimal.ROUND_CEIL),
    steps,
  };
}