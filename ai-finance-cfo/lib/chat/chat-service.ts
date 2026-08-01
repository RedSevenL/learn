import type { FinanceIntent } from "@/schemas/ai-intent";
import type { SavingsGoalInput, SavingsGoalResult } from "@/lib/finance/savings-goal";
import { calculateSavingsGoal } from "@/lib/finance/savings-goal";
import { getDeepSeekModelName } from "@/lib/ai/deepseek";
import { ChatServiceError } from "./chat-service-error";
import { buildSavingsGoalContext } from "./build-savings-goal-context";
import { formatSavingsGoalReply } from "./format-savings-goal-reply";
import type { SavingsGoalContext } from "./build-savings-goal-context";

// ── 数据库访问类型 ─────────────────────────────────

type TransactionRow = {
  amount: string;
  direction: string;
  category: string | null;
  occurredAt: number;
};

type AccountRow = {
  type: string;
  balance: string;
};

type PersistFn = (
  input: SavingsGoalInput,
  result: SavingsGoalResult,
  modelTrace: {
    provider: "deepseek";
    model: string;
    parsedIntent: "savings_goal";
  },
) => Promise<{ id: string }>;

type NowFn = () => number;

// ── ChatService 输入 ───────────────────────────────

export type ChatServiceDeps = {
  listTransactions: () => Promise<TransactionRow[]>;
  listAccounts: () => Promise<AccountRow[]>;
  saveSavingsGoalCalculation: PersistFn;
  nowFn?: NowFn;
};

// ── ChatService 输出 ───────────────────────────────

export type ChatServiceResult = {
  reply: string;
  historyId: string;
  intent: FinanceIntent;
  calculation: SavingsGoalResult;
  assumptions: {
    dataMonth: string;
    currentAmountSource: string;
    monthlySavingSource: string;
    annualRate: string;
  };
};

// ── 主函数 ─────────────────────────────────────────

export async function executeChatService(
  intent: FinanceIntent,
  deps: ChatServiceDeps,
): Promise<ChatServiceResult> {
  if (intent.type !== "savings_goal") {
    throw new ChatServiceError(
      "UNSUPPORTED_INTENT",
      `暂不支持的意图类型：${intent.type}`,
    );
  }

  const [transactions, accounts] = await Promise.all([
    deps.listTransactions(),
    deps.listAccounts(),
  ]);

  const context: SavingsGoalContext = buildSavingsGoalContext(
    intent.targetAmount,
    intent.deadlineMonths,
    transactions,
    accounts,
    deps.nowFn,
  );

  const model = getDeepSeekModelName();

  let calculation: SavingsGoalResult;

  try {
    calculation = calculateSavingsGoal(context.input);
  } catch (error) {
    throw new ChatServiceError(
      "CALCULATION_FAILED",
      error instanceof Error ? error.message : "储蓄目标计算失败",
      error,
    );
  }

  const modelTrace = {
    provider: "deepseek" as const,
    model,
    parsedIntent: "savings_goal" as const,
  };

  let history: { id: string };

  try {
    history = await deps.saveSavingsGoalCalculation(
      context.input,
      calculation,
      modelTrace,
    );
  } catch (error) {
    throw new ChatServiceError(
      "HISTORY_SAVE_FAILED",
      "计算成功，但历史记录保存失败",
      error,
    );
  }

  const reply = formatSavingsGoalReply(calculation, context);

  return {
    reply,
    historyId: history.id,
    intent,
    calculation,
    assumptions: {
      dataMonth: context.dataMonth,
      currentAmountSource: context.currentAmountSource,
      monthlySavingSource: context.monthlySavingSource,
      annualRate: context.input.annualRate,
    },
  };
}