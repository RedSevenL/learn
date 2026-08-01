import { errorResponse, successResponse } from "@/lib/api/response";
import { calculateDashboard } from "@/lib/finance/dashboard";
import { listAccounts } from "@/lib/services/accounts";
import { listLiabilities } from "@/lib/services/liabilities";
import { listTransactions } from "@/lib/services/transactions";
import { dashboardQuerySchema } from "@/schemas/dashboard";
import { formatZodError } from "@/schemas/format-zod-error";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const parsed = dashboardQuerySchema.safeParse({
    month: url.searchParams.get("month") ?? undefined,
    months: url.searchParams.get("months") ?? undefined,
  });

  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "查询参数不合法",
      { status: 400 },
      {
        issues: formatZodError(parsed.error),
      },
    );
  }

  try {
    const [accounts, transactions, liabilities] = await Promise.all([
      listAccounts(),
      listTransactions(),
      listLiabilities(),
    ]);

    const result = calculateDashboard({
      baseMonth: parsed.data.month,
      trendMonths: parsed.data.months,
      accounts: accounts.map((a) => ({
        type: a.type,
        currency: a.currency,
        balance: a.balance,
      })),
      transactions: transactions.map((t) => ({
        amount: t.amount,
        direction: t.direction,
        category: t.category,
        occurredAt: t.occurredAt,
      })),
      liabilities: liabilities.map((l) => ({
        remainingPrincipal: l.remainingPrincipal,
      })),
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(
      "DASHBOARD_ERROR",
      error instanceof Error ? error.message : "仪表盘计算失败",
      { status: 500 },
    );
  }
}