import Decimal from "decimal.js";
import {
  createMoney,
  toMoneyString,
} from "./money";

// --- 策略类型 ---

export type DebtPayoffStrategy = "snowball" | "avalanche";

// --- 输入类型 ---

export type DebtPayoffDebt = {
  id: string;
  name: string;
  balance: string;
  annualRate: string;
  minimumPayment: string;
};

export type DebtPayoffInput = {
  debts: DebtPayoffDebt[];
  extraPayment: string;
  strategy: DebtPayoffStrategy;
};

// --- 输出类型 ---

export type DebtPayoffItemResult = {
  id: string;
  name: string;
  paidOffMonth: number;
  totalInterest: string;
  totalPaid: string;
};

export type DebtPayoffResult = {
  strategy: DebtPayoffStrategy;
  priorityOrder: string[];
  totalPrincipal: string;
  totalMonthlyBudget: string;
  payoffMonths: number;
  totalInterest: string;
  totalPaid: string;
  debts: DebtPayoffItemResult[];
};

// --- 策略比较类型 ---

export type DebtPayoffComparisonInput = {
  debts: DebtPayoffDebt[];
  extraPayment: string;
};

export type DebtPayoffComparisonResult = {
  snowball: DebtPayoffResult;
  avalanche: DebtPayoffResult;
  interestDifference: string;
  monthDifference: number;
};

// --- 内部状态 ---

type DebtState = {
  id: string;
  name: string;
  balance: Decimal;
  annualRate: Decimal;
  minimumPayment: Decimal;
  totalInterest: Decimal;
  totalPaid: Decimal;
  paidOffMonth: number | null;
};

// --- 辅助函数 ---

function roundMoney(value: Decimal) {
  return value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

// --- 校验输入 ---

function assertDebtInput(input: DebtPayoffInput) {
  if (input.debts.length === 0) {
    throw new Error("至少需要一笔债务");
  }

  const ids = new Set<string>();

  for (const debt of input.debts) {
    if (debt.id.trim() === "") {
      throw new Error("债务 id 不能为空");
    }

    if (ids.has(debt.id)) {
      throw new Error(`债务 id 重复：${debt.id}`);
    }

    ids.add(debt.id);

    const balance = createMoney(debt.balance);
    const annualRate = new Decimal(debt.annualRate);
    const minimumPayment = createMoney(debt.minimumPayment);

    if (balance.lessThanOrEqualTo(0)) {
      throw new Error("债务余额必须大于 0");
    }

    if (!annualRate.isFinite() || annualRate.isNegative()) {
      throw new Error("年利率必须是非负有限数字");
    }

    if (minimumPayment.lessThanOrEqualTo(0)) {
      throw new Error("最低还款额必须大于 0");
    }
  }

  const extraPayment = createMoney(input.extraPayment);

  if (extraPayment.isNegative()) {
    throw new Error("额外还款不能为负数");
  }
}

// --- 稳定排序 ---

function sortDebts(debts: DebtState[], strategy: DebtPayoffStrategy) {
  return [...debts].sort((left, right) => {
    if (strategy === "snowball") {
      const balanceOrder = left.balance.comparedTo(right.balance);

      if (balanceOrder !== 0) {
        return balanceOrder;
      }

      const rateOrder = right.annualRate.comparedTo(left.annualRate);

      if (rateOrder !== 0) {
        return rateOrder;
      }
    } else {
      const rateOrder = right.annualRate.comparedTo(left.annualRate);

      if (rateOrder !== 0) {
        return rateOrder;
      }

      const balanceOrder = left.balance.comparedTo(right.balance);

      if (balanceOrder !== 0) {
        return balanceOrder;
      }
    }

    return left.id.localeCompare(right.id);
  });
}

// --- 核心模拟 ---

const MAX_PAYOFF_MONTHS = 1200;

export function simulateDebtPayoff(input: DebtPayoffInput): DebtPayoffResult {
  assertDebtInput(input);

  const states: DebtState[] = input.debts.map((debt) => ({
    id: debt.id,
    name: debt.name,
    balance: createMoney(debt.balance),
    annualRate: new Decimal(debt.annualRate),
    minimumPayment: createMoney(debt.minimumPayment),
    totalInterest: createMoney("0"),
    totalPaid: createMoney("0"),
    paidOffMonth: null,
  }));

  const priorityOrder = sortDebts(states, input.strategy).map(
    (debt) => debt.id,
  );

  const totalPrincipal = states.reduce(
    (total, debt) => total.plus(debt.balance),
    createMoney("0"),
  );

  const minimumPaymentTotal = states.reduce(
    (total, debt) => total.plus(debt.minimumPayment),
    createMoney("0"),
  );

  const totalMonthlyBudget = minimumPaymentTotal.plus(
    createMoney(input.extraPayment),
  );

  let month = 0;

  while (states.some((debt) => debt.balance.greaterThan(0))) {
    month += 1;

    if (month > MAX_PAYOFF_MONTHS) {
      throw new Error("在 1200 个月内无法还清债务，请提高月还款预算");
    }

    // 每月先计息
    for (const debt of states) {
      if (debt.balance.isZero()) {
        continue;
      }

      const monthlyRate = debt.annualRate.dividedBy(100).dividedBy(12);

      const interest = roundMoney(debt.balance.times(monthlyRate));

      debt.balance = debt.balance.plus(interest);
      debt.totalInterest = debt.totalInterest.plus(interest);
    }

    // 先支付所有最低还款
    let paidThisMonth = createMoney("0");

    for (const debt of states) {
      if (debt.balance.isZero()) {
        continue;
      }

      const payment = Decimal.min(debt.minimumPayment, debt.balance);

      debt.balance = debt.balance.minus(payment);
      debt.totalPaid = debt.totalPaid.plus(payment);
      paidThisMonth = paidThisMonth.plus(payment);

      if (debt.balance.isZero()) {
        debt.paidOffMonth = month;
      }
    }

    // 剩余预算按策略集中还款
    let remainingBudget = totalMonthlyBudget.minus(paidThisMonth);

    for (const debtId of priorityOrder) {
      if (remainingBudget.isZero()) {
        break;
      }

      const debt = states.find((item) => item.id === debtId);

      if (!debt || debt.balance.isZero()) {
        continue;
      }

      const payment = Decimal.min(remainingBudget, debt.balance);

      debt.balance = debt.balance.minus(payment);
      debt.totalPaid = debt.totalPaid.plus(payment);
      remainingBudget = remainingBudget.minus(payment);

      if (debt.balance.isZero()) {
        debt.paidOffMonth = month;
      }
    }
  }

  const totalInterest = states.reduce(
    (total, debt) => total.plus(debt.totalInterest),
    createMoney("0"),
  );

  const totalPaid = states.reduce(
    (total, debt) => total.plus(debt.totalPaid),
    createMoney("0"),
  );

  // 验证财务不变量：总支付 = 初始本金 + 总利息
  const expectedTotalPaid = totalPrincipal.plus(totalInterest);

  if (!totalPaid.equals(expectedTotalPaid)) {
    throw new Error("债务还款汇总不一致");
  }

  return {
    strategy: input.strategy,
    priorityOrder,
    totalPrincipal: toMoneyString(totalPrincipal),
    totalMonthlyBudget: toMoneyString(totalMonthlyBudget),
    payoffMonths: month,
    totalInterest: toMoneyString(totalInterest),
    totalPaid: toMoneyString(totalPaid),
    debts: states.map((debt) => ({
      id: debt.id,
      name: debt.name,
      paidOffMonth: debt.paidOffMonth!,
      totalInterest: toMoneyString(debt.totalInterest),
      totalPaid: toMoneyString(debt.totalPaid),
    })),
  };
}

// --- 策略比较 ---

export function compareDebtPayoffStrategies(
  input: DebtPayoffComparisonInput,
): DebtPayoffComparisonResult {
  const snowball = simulateDebtPayoff({
    ...input,
    strategy: "snowball",
  });

  const avalanche = simulateDebtPayoff({
    ...input,
    strategy: "avalanche",
  });

  const interestDifference = createMoney(snowball.totalInterest).minus(
    avalanche.totalInterest,
  );

  return {
    snowball,
    avalanche,
    interestDifference: toMoneyString(interestDifference),
    monthDifference: snowball.payoffMonths - avalanche.payoffMonths,
  };
}