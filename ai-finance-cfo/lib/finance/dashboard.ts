import Decimal from "decimal.js";
import { calculateMonthlyCashFlow, toShanghaiMonth } from "./cash-flow";
import {
  addMoney,
  createMoney,
  divideMoney,
  subtractMoney,
  toMoneyString,
} from "./money";

// ── 输入类型 ──────────────────────────────────────

export type DashboardAccount = {
  type: string;
  currency: string;
  balance: string;
};

export type DashboardLiability = {
  remainingPrincipal: string;
};

export type DashboardTransaction = {
  amount: string;
  direction: string;
  category: string | null;
  occurredAt: number;
};

export type DashboardInput = {
  baseMonth: string;
  trendMonths: number;
  accounts: DashboardAccount[];
  liabilities: DashboardLiability[];
  transactions: DashboardTransaction[];
};

// ── 输出类型 ──────────────────────────────────────

export type DashboardMetricResult = {
  totalAssets: string;
  totalLiabilities: string;
  netWorth: string;
  monthlyIncome: string;
  monthlyExpense: string;
  monthlySurplus: string;
  savingsRate: string | null;
  debtRatio: string | null;
};

export type CashFlowTrendPoint = {
  month: string;
  income: string;
  expense: string;
  surplus: string;
  hasCashFlow: boolean;
};

export type CategoryExpensePoint = {
  category: string;
  amount: string;
  share: string;
};

export type DashboardResult = {
  baseMonth: string;
  trendMonths: number;
  snapshotAt: number;
  hasFinancialData: boolean;
  metrics: DashboardMetricResult;
  cashFlowTrend: CashFlowTrendPoint[];
  categoryExpenses: CategoryExpensePoint[];
};

// ── 常量与校验 ────────────────────────────────────

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const ALLOWED_TREND_MONTHS = new Set([3, 6, 12]);

function assertDashboardRange(baseMonth: string, trendMonths: number) {
  if (!MONTH_PATTERN.test(baseMonth)) {
    throw new Error("基准月份格式必须是 YYYY-MM");
  }

  if (!ALLOWED_TREND_MONTHS.has(trendMonths)) {
    throw new Error("趋势范围只能是 3、6 或 12 个月");
  }
}

// ── 生成连续月份 ──────────────────────────────────

export function listRecentMonths(baseMonth: string, count: number) {
  if (!MONTH_PATTERN.test(baseMonth)) {
    throw new Error("月份格式必须是 YYYY-MM");
  }

  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("月份数量必须是正整数");
  }

  const [baseYear, baseMonthNumber] = baseMonth.split("-").map(Number);
  const baseIndex = baseYear * 12 + baseMonthNumber - 1;

  return Array.from({ length: count }, (_, index) => {
    const monthIndex = baseIndex - count + 1 + index;
    const year = Math.floor(monthIndex / 12);
    const month = (monthIndex % 12) + 1;

    return `${year}-${String(month).padStart(2, "0")}`;
  });
}

// ── 计算总资产 ────────────────────────────────────

function calculateTotalAssets(accounts: DashboardAccount[]) {
  let total = createMoney("0");

  for (const account of accounts) {
    if (account.currency !== "CNY") {
      throw new Error("当前仪表盘暂不支持多币种汇总");
    }

    if (
      account.type === "cash" ||
      account.type === "bank" ||
      account.type === "investment"
    ) {
      total = addMoney(total, account.balance);
    }
  }

  return total;
}

// ── 计算总负债 ────────────────────────────────────

function calculateTotalLiabilities(liabilities: DashboardLiability[]) {
  let total = createMoney("0");

  for (const liability of liabilities) {
    total = addMoney(total, liability.remainingPrincipal);
  }

  return total;
}

// ── 计算资产负债率 ─────────────────────────────────

function calculateDebtRatio(totalAssets: Decimal, totalLiabilities: Decimal) {
  if (totalAssets.lessThanOrEqualTo("0")) {
    return null;
  }

  return divideMoney(totalLiabilities, totalAssets)
    .times("100")
    .toFixed(2, Decimal.ROUND_HALF_UP);
}

// ── 按分类聚合支出 ─────────────────────────────────

function calculateCategoryExpenses(
  baseMonth: string,
  transactions: DashboardTransaction[],
): CategoryExpensePoint[] {
  const expenseMap = new Map<string, Decimal>();

  for (const tx of transactions) {
    if (tx.direction !== "expense") {
      continue;
    }

    const txMonth = toShanghaiMonth(tx.occurredAt);

    if (txMonth !== baseMonth) {
      continue;
    }

    const category = tx.category ?? "未分类";
    const amount = createMoney(tx.amount);
    const current = expenseMap.get(category) ?? createMoney("0");
    expenseMap.set(category, addMoney(current, amount));
  }

  if (expenseMap.size === 0) {
    return [];
  }

  // 计算总支出
  let totalExpense = createMoney("0");

  for (const amount of expenseMap.values()) {
    totalExpense = addMoney(totalExpense, amount);
  }

  // 排序：从高到低
  const sorted = Array.from(expenseMap.entries()).sort(([, a], [, b]) =>
    b.comparedTo(a),
  );

  // 如果分类超过 6 个，合并"其他"
  const MAX_VISIBLE_CATEGORIES = 6;
  const points: CategoryExpensePoint[] = [];

  let otherTotal = createMoney("0");

  sorted.forEach(([category, amount], index) => {
    if (index < MAX_VISIBLE_CATEGORIES - 1) {
      const share = totalExpense.isZero()
        ? "0.00"
        : divideMoney(amount, totalExpense)
            .times("100")
            .toFixed(2, Decimal.ROUND_HALF_UP);

      points.push({
        category,
        amount: toMoneyString(amount),
        share,
      });
    } else {
      otherTotal = addMoney(otherTotal, amount);
    }
  });

  if (!otherTotal.isZero()) {
    const share = totalExpense.isZero()
      ? "0.00"
      : divideMoney(otherTotal, totalExpense)
          .times("100")
          .toFixed(2, Decimal.ROUND_HALF_UP);

    points.push({
      category: "其他",
      amount: toMoneyString(otherTotal),
      share,
    });
  }

  return points;
}

// ── 主函数 ────────────────────────────────────────

export function calculateDashboard(input: DashboardInput): DashboardResult {
  assertDashboardRange(input.baseMonth, input.trendMonths);

  const totalAssets = calculateTotalAssets(input.accounts);
  const totalLiabilities = calculateTotalLiabilities(input.liabilities);
  const netWorth = subtractMoney(totalAssets, totalLiabilities);

  // 复用现金流函数
  const currentCashFlow = calculateMonthlyCashFlow({
    month: input.baseMonth,
    transactions: input.transactions,
    accounts: input.accounts,
  });

  const debtRatio = calculateDebtRatio(totalAssets, totalLiabilities);

  const metrics: DashboardMetricResult = {
    totalAssets: toMoneyString(totalAssets),
    totalLiabilities: toMoneyString(totalLiabilities),
    netWorth: toMoneyString(netWorth),
    monthlyIncome: currentCashFlow.income,
    monthlyExpense: currentCashFlow.totalExpense,
    monthlySurplus: currentCashFlow.surplus,
    savingsRate: currentCashFlow.savingsRate,
    debtRatio,
  };

  // 生成现金流趋势
  const cashFlowTrend: CashFlowTrendPoint[] = listRecentMonths(
    input.baseMonth,
    input.trendMonths,
  ).map((month) => {
    const cashFlow = calculateMonthlyCashFlow({
      month,
      transactions: input.transactions,
      accounts: input.accounts,
    });

    return {
      month,
      income: cashFlow.income,
      expense: cashFlow.totalExpense,
      surplus: cashFlow.surplus,
      hasCashFlow: cashFlow.hasCashFlow,
    };
  });

  // 分类支出
  const categoryExpenses = calculateCategoryExpenses(
    input.baseMonth,
    input.transactions,
  );

  const hasFinancialData =
    input.accounts.length > 0 ||
    input.transactions.length > 0 ||
    input.liabilities.length > 0;

  return {
    baseMonth: input.baseMonth,
    trendMonths: input.trendMonths,
    snapshotAt: Date.now(),
    hasFinancialData,
    metrics,
    cashFlowTrend,
    categoryExpenses,
  };
}