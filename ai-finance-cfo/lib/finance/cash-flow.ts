import Decimal from "decimal.js";
import {
  addMoney,
  createMoney,
  divideMoney,
  subtractMoney,
  toMoneyString
} from "./money";

// ── 常量 ──────────────────────────────────────────

const FIXED_EXPENSE_CATEGORIES = new Set([
  "居住",
  "水电燃气",
  "通讯",
  "保险",
  "订阅",
  "最低还款"
]);

const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;

// ── 帮助函数 ──────────────────────────────────────

function isFixedExpense(category: string | null) {
  return category !== null &&
    FIXED_EXPENSE_CATEGORIES.has(category);
}

function assertMonth(month: string) {
  const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

  if (!monthPattern.test(month)) {
    throw new Error("月份格式必须是 YYYY-MM");
  }
}

export function toShanghaiMonth(timestamp: number): string {
  const date = new Date(timestamp + SHANGHAI_OFFSET_MS);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

// ── 类型 ──────────────────────────────────────────

export type CashFlowTransaction = {
  amount: string;
  direction: string;
  category: string | null;
  occurredAt: number;
};

export type CashFlowAccount = {
  type: string;
  balance: string;
};

export type MonthlyCashFlowInput = {
  month: string;
  transactions: CashFlowTransaction[];
  accounts: CashFlowAccount[];
};

export type MonthlyCashFlowResult = {
  month: string;
  hasCashFlow: boolean;
  income: string;
  fixedExpense: string;
  variableExpense: string;
  totalExpense: string;
  surplus: string;
  savingsRate: string | null;
  liquidAssets: string;
  safeCashMonths: string | null;
};

// ── 主函数 ────────────────────────────────────────

export function calculateMonthlyCashFlow(
  input: MonthlyCashFlowInput
): MonthlyCashFlowResult {
  assertMonth(input.month);

  let income = createMoney("0");
  let fixedExpense = createMoney("0");
  let variableExpense = createMoney("0");
  let cashFlowCount = 0;

  for (const transaction of input.transactions) {
    if (toShanghaiMonth(transaction.occurredAt) !== input.month) {
      continue;
    }

    const amount = createMoney(transaction.amount);

    if (amount.isNegative()) {
      throw new Error("流水金额不能为负数");
    }

    if (transaction.direction === "transfer") {
      continue;
    }

    if (transaction.direction === "income") {
      income = addMoney(income, amount);
      cashFlowCount += 1;
      continue;
    }

    if (transaction.direction === "expense") {
      if (isFixedExpense(transaction.category)) {
        fixedExpense = addMoney(fixedExpense, amount);
      } else {
        variableExpense = addMoney(variableExpense, amount);
      }

      cashFlowCount += 1;
      continue;
    }

    throw new Error(
      `未知流水方向：${transaction.direction}`
    );
  }

  const totalExpense = addMoney(
    fixedExpense,
    variableExpense
  );
  const surplus = subtractMoney(income, totalExpense);

  const savingsRate = income.isZero()
    ? null
    : divideMoney(surplus, income)
        .times("100")
        .toFixed(2, Decimal.ROUND_HALF_UP);

  let liquidAssets = createMoney("0");

  for (const account of input.accounts) {
    if (account.type === "cash" || account.type === "bank") {
      liquidAssets = addMoney(
        liquidAssets,
        account.balance
      );
    }
  }

  const safeCashMonths = totalExpense.isZero()
    ? null
    : liquidAssets.lessThanOrEqualTo("0")
      ? "0.0"
      : divideMoney(liquidAssets, totalExpense)
          .toFixed(1, Decimal.ROUND_HALF_UP);

  return {
    month: input.month,
    hasCashFlow: cashFlowCount > 0,
    income: toMoneyString(income),
    fixedExpense: toMoneyString(fixedExpense),
    variableExpense: toMoneyString(variableExpense),
    totalExpense: toMoneyString(totalExpense),
    surplus: toMoneyString(surplus),
    savingsRate,
    liquidAssets: toMoneyString(liquidAssets),
    safeCashMonths
  };
}