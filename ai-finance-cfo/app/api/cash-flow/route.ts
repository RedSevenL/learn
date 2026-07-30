import { errorResponse, successResponse } from "@/lib/api/response";
import { listAccounts } from "@/lib/services/accounts";
import { listTransactions } from "@/lib/services/transactions";
import {
  calculateMonthlyCashFlow,
  toShanghaiMonth
} from "@/lib/finance/cash-flow";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const month =
    url.searchParams.get("month") ??
    toShanghaiMonth(Date.now());

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return errorResponse(
      "VALIDATION_ERROR",
      "月份格式必须是 YYYY-MM",
      { status: 400 }
    );
  }

  try {
    const [transactions, accounts] = await Promise.all([
      listTransactions(),
      listAccounts()
    ]);

    const cashFlow = calculateMonthlyCashFlow({
      month,
      transactions,
      accounts
    });

    return successResponse({
      cashFlow
    });
  } catch {
    return errorResponse(
      "CASH_FLOW_ERROR",
      "现金流计算失败",
      { status: 500 }
    );
  }
}