import {
  errorResponse,
  successResponse,
} from "@/lib/api/response";
import {
  calculateSavingsGoal,
  type SavingsGoalResult,
} from "@/lib/finance/savings-goal";
import {
  saveSavingsGoalCalculation,
} from "@/lib/services/calculation-history";
import { formatZodError } from "@/schemas/format-zod-error";
import { savingsGoalSchema } from "@/schemas/savings-goal";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = savingsGoalSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "储蓄目标输入不合法",
      { status: 400 },
      {
        issues: formatZodError(parsed.error),
      },
    );
  }

  let calculation: SavingsGoalResult;

  try {
    calculation = calculateSavingsGoal(parsed.data);
  } catch (error) {
    return errorResponse(
      "CALCULATION_ERROR",
      error instanceof Error ? error.message : "储蓄目标计算失败",
      { status: 400 },
    );
  }

  try {
    const history = await saveSavingsGoalCalculation(parsed.data, calculation);

    return successResponse(
      {
        historyId: history.id,
        calculation,
      },
      { status: 201 },
    );
  } catch {
    return errorResponse(
      "HISTORY_SAVE_ERROR",
      "计算成功，但历史记录保存失败",
      { status: 500 },
    );
  }
}