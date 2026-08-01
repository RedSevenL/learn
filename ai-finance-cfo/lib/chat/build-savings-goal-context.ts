import { calculateMonthlyCashFlow, toShanghaiMonth } from "@/lib/finance/cash-flow";
import type { CashFlowTransaction, CashFlowAccount } from "@/lib/finance/cash-flow";
import type { SavingsGoalInput } from "@/lib/finance/savings-goal";
import { getChatSavingsAnnualRate } from "@/lib/chat/chat-config";
import { ChatServiceError } from "@/lib/chat/chat-service-error";

// ── 结果类型 ──────────────────────────────────────

export type SavingsGoalContext = {
  input: SavingsGoalInput;
  dataMonth: string;
  currentAmountSource: string;
  monthlySavingSource: string;
};

// ── 月份占位符类型（测试注入） ─────────────────────

type NowFn = () => number;

// ── 默认当前时间函数 ───────────────────────────────

function defaultNow(): number {
  return Date.now();
}

// ── 核心函数 ──────────────────────────────────────

export function buildSavingsGoalContext(
  targetAmount: string,
  deadlineMonths: number,
  transactions: CashFlowTransaction[],
  accounts: CashFlowAccount[],
  nowFn: NowFn = defaultNow,
): SavingsGoalContext {
  const annualRate = getChatSavingsAnnualRate();

  const currentMonth = toShanghaiMonth(nowFn());

  const cashFlow = calculateMonthlyCashFlow({
    month: currentMonth,
    transactions,
    accounts,
  });

  if (!cashFlow.hasCashFlow) {
    throw new ChatServiceError(
      "FINANCIAL_DATA_NOT_READY",
      `当前月份 ${currentMonth} 还没有可用于估算的收支流水`,
    );
  }

  const surplus = cashFlow.surplus;

  if (surplus.startsWith("-")) {
    throw new ChatServiceError(
      "NEGATIVE_MONTHLY_SURPLUS",
      "当前月支出高于收入，暂时不能按正向月储蓄估算目标",
    );
  }

  return {
    input: {
      targetAmount,
      currentAmount: cashFlow.liquidAssets,
      monthlySaving: surplus,
      annualRate,
      months: deadlineMonths,
    },
    dataMonth: currentMonth,
    currentAmountSource: "cash_and_bank_accounts",
    monthlySavingSource: "current_month_surplus",
  };
}