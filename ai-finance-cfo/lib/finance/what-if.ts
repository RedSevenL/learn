import Decimal from "decimal.js";
import { createMoney, toMoneyString } from "./money";

// --- 输入类型 ---

export type WhatIfBaseline = {
  currentAmount: string;
  targetAmount: string;
  monthlyIncome: string;
  monthlyExpense: string;
  annualRate: string;
  horizonMonths: number;
};

export type WhatIfChanges = {
  monthlyIncomeChange: string;
  monthlyExpenseChange: string;
};

export type WhatIfInput = {
  baseline: WhatIfBaseline;
  changes: WhatIfChanges;
};

// --- 输出类型 ---

export type WhatIfProjection = {
  monthlyIncome: string;
  monthlyExpense: string;
  monthlySurplus: string;
  projectedNetWorth: string;
  reachesGoalWithinHorizon: boolean;
  monthsToGoal: number | null;
};

export type GoalTimingImpact =
  | "unchanged"
  | "delayed"
  | "accelerated"
  | "scenario_unreachable"
  | "scenario_reachable"
  | "both_unreachable";

export type WhatIfResult = {
  targetAmount: string;
  horizonMonths: number;
  baseline: WhatIfProjection;
  scenario: WhatIfProjection;
  differences: {
    monthlySurplus: string;
    projectedNetWorth: string;
    goalMonthDifference: number | null;
    goalTimingImpact: GoalTimingImpact;
  };
};

// --- 辅助函数 ---

function roundMoney(value: Decimal) {
  return value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

// --- 校验输入 ---

function assertWhatIfInput(input: WhatIfInput) {
  const currentAmount = createMoney(input.baseline.currentAmount);
  const targetAmount = createMoney(input.baseline.targetAmount);
  const monthlyIncome = createMoney(input.baseline.monthlyIncome);
  const monthlyExpense = createMoney(input.baseline.monthlyExpense);
  const annualRate = new Decimal(input.baseline.annualRate);

  if (currentAmount.isNegative()) {
    throw new Error("当前目标资金不能为负数");
  }

  if (targetAmount.lessThanOrEqualTo(0)) {
    throw new Error("目标金额必须大于 0");
  }

  if (monthlyIncome.isNegative()) {
    throw new Error("月收入不能为负数");
  }

  if (monthlyExpense.isNegative()) {
    throw new Error("月支出不能为负数");
  }

  if (!annualRate.isFinite() || annualRate.isNegative()) {
    throw new Error("年化收益率必须是非负有限数字");
  }

  if (
    !Number.isInteger(input.baseline.horizonMonths) ||
    input.baseline.horizonMonths <= 0 ||
    input.baseline.horizonMonths > 1200
  ) {
    throw new Error("观察期限必须是 1 到 1200 的整数月");
  }

  const scenarioIncome = monthlyIncome.plus(
    createMoney(input.changes.monthlyIncomeChange),
  );

  const scenarioExpense = monthlyExpense.plus(
    createMoney(input.changes.monthlyExpenseChange),
  );

  if (scenarioIncome.isNegative()) {
    throw new Error("变更后的月收入不能为负数");
  }

  if (scenarioExpense.isNegative()) {
    throw new Error("变更后的月支出不能为负数");
  }
}

// --- 计算固定期限后的金额 ---

function projectAmount(
  currentAmount: Decimal,
  monthlyCashFlow: Decimal,
  annualRate: Decimal,
  months: number,
) {
  const monthlyRate = annualRate.dividedBy(100).dividedBy(12);

  if (monthlyRate.isZero()) {
    return currentAmount.plus(monthlyCashFlow.times(months));
  }

  const growthFactor = monthlyRate.plus(1).pow(months);

  const recurringCashFlowFactor = growthFactor.minus(1).dividedBy(monthlyRate);

  return currentAmount.times(growthFactor).plus(monthlyCashFlow.times(recurringCashFlowFactor));
}

// --- 逐月查找目标时间 ---

const MAX_GOAL_MONTHS = 1200;

function calculateMonthsToGoal(
  currentAmount: Decimal,
  targetAmount: Decimal,
  monthlyCashFlow: Decimal,
  annualRate: Decimal,
): number | null {
  if (currentAmount.greaterThanOrEqualTo(targetAmount)) {
    return 0;
  }

  const monthlyRate = annualRate.dividedBy(100).dividedBy(12);

  let balance = currentAmount;

  for (let month = 1; month <= MAX_GOAL_MONTHS; month += 1) {
    balance = balance.times(monthlyRate.plus(1)).plus(monthlyCashFlow);

    if (balance.greaterThanOrEqualTo(targetAmount)) {
      return month;
    }
  }

  return null;
}

// --- 判断目标时间影响 ---

function compareGoalTiming(
  baselineMonths: number | null,
  scenarioMonths: number | null,
): {
  goalMonthDifference: number | null;
  goalTimingImpact: GoalTimingImpact;
} {
  if (baselineMonths === null && scenarioMonths === null) {
    return {
      goalMonthDifference: null,
      goalTimingImpact: "both_unreachable",
    };
  }

  if (baselineMonths !== null && scenarioMonths === null) {
    return {
      goalMonthDifference: null,
      goalTimingImpact: "scenario_unreachable",
    };
  }

  if (baselineMonths === null && scenarioMonths !== null) {
    return {
      goalMonthDifference: null,
      goalTimingImpact: "scenario_reachable",
    };
  }

  const difference = scenarioMonths! - baselineMonths!;

  return {
    goalMonthDifference: difference,
    goalTimingImpact:
      difference > 0 ? "delayed" : difference < 0 ? "accelerated" : "unchanged",
  };
}

// --- 建立单个场景结果 ---

function createProjection(
  monthlyIncome: Decimal,
  monthlyExpense: Decimal,
  currentAmount: Decimal,
  targetAmount: Decimal,
  annualRate: Decimal,
  horizonMonths: number,
): {
  result: WhatIfProjection;
  projectedNetWorth: Decimal;
} {
  const monthlySurplus = monthlyIncome.minus(monthlyExpense);

  const projectedNetWorth = roundMoney(
    projectAmount(currentAmount, monthlySurplus, annualRate, horizonMonths),
  );

  const monthsToGoal = calculateMonthsToGoal(
    currentAmount,
    targetAmount,
    monthlySurplus,
    annualRate,
  );

  return {
    projectedNetWorth,
    result: {
      monthlyIncome: toMoneyString(monthlyIncome),
      monthlyExpense: toMoneyString(monthlyExpense),
      monthlySurplus: toMoneyString(monthlySurplus),
      projectedNetWorth: toMoneyString(projectedNetWorth),
      reachesGoalWithinHorizon:
        monthsToGoal !== null && monthsToGoal <= horizonMonths,
      monthsToGoal,
    },
  };
}

// --- 核心计算 ---

export function calculateWhatIf(input: WhatIfInput): WhatIfResult {
  assertWhatIfInput(input);

  const currentAmount = createMoney(input.baseline.currentAmount);
  const targetAmount = createMoney(input.baseline.targetAmount);
  const baselineIncome = createMoney(input.baseline.monthlyIncome);
  const baselineExpense = createMoney(input.baseline.monthlyExpense);
  const annualRate = new Decimal(input.baseline.annualRate);
  const { horizonMonths } = input.baseline;

  const scenarioIncome = baselineIncome.plus(
    createMoney(input.changes.monthlyIncomeChange),
  );

  const scenarioExpense = baselineExpense.plus(
    createMoney(input.changes.monthlyExpenseChange),
  );

  const baseline = createProjection(
    baselineIncome,
    baselineExpense,
    currentAmount,
    targetAmount,
    annualRate,
    horizonMonths,
  );

  const scenario = createProjection(
    scenarioIncome,
    scenarioExpense,
    currentAmount,
    targetAmount,
    annualRate,
    horizonMonths,
  );

  const goalTiming = compareGoalTiming(
    baseline.result.monthsToGoal,
    scenario.result.monthsToGoal,
  );

  const monthlySurplusDifference = createMoney(
    scenario.result.monthlySurplus,
  ).minus(baseline.result.monthlySurplus);

  const projectedNetWorthDifference = scenario.projectedNetWorth.minus(
    baseline.projectedNetWorth,
  );

  return {
    targetAmount: toMoneyString(targetAmount),
    horizonMonths,
    baseline: baseline.result,
    scenario: scenario.result,
    differences: {
      monthlySurplus: toMoneyString(monthlySurplusDifference),
      projectedNetWorth: toMoneyString(projectedNetWorthDifference),
      ...goalTiming,
    },
  };
}