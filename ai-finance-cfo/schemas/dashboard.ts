import * as z from "zod";

// ── 查询参数 ──────────────────────────────────────

export const dashboardQuerySchema = z
  .object({
    month: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "月份格式必须是 YYYY-MM"),
    months: z
      .string()
      .transform((val) => Number(val))
      .pipe(
        z
          .number()
          .int()
          .refine((val) => [3, 6, 12].includes(val), {
            message: "趋势范围只能是 3、6 或 12",
          }),
      ),
  })
  .strict();

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;

// ── 响应 schema ───────────────────────────────────

const cashFlowTrendPointSchema = z.object({
  month: z.string(),
  income: z.string(),
  expense: z.string(),
  surplus: z.string(),
  hasCashFlow: z.boolean(),
});

const categoryExpensePointSchema = z.object({
  category: z.string(),
  amount: z.string(),
  share: z.string(),
});

const dashboardMetricResultSchema = z.object({
  totalAssets: z.string(),
  totalLiabilities: z.string(),
  netWorth: z.string(),
  monthlyIncome: z.string(),
  monthlyExpense: z.string(),
  monthlySurplus: z.string(),
  savingsRate: z.string().nullable(),
  debtRatio: z.string().nullable(),
});

const dashboardResultSchema = z.object({
  baseMonth: z.string(),
  trendMonths: z.number().int(),
  snapshotAt: z.number().int().positive(),
  hasFinancialData: z.boolean(),
  metrics: dashboardMetricResultSchema,
  cashFlowTrend: z.array(cashFlowTrendPointSchema),
  categoryExpenses: z.array(categoryExpensePointSchema),
});

const apiIssueSchema = z.object({
  path: z.string(),
  message: z.string(),
});

export const dashboardSuccessResponseSchema = z.object({
  ok: z.literal(true),
  data: dashboardResultSchema,
});

export const dashboardErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    issues: z.array(apiIssueSchema).optional(),
  }),
});

export const dashboardApiResponseSchema = z.discriminatedUnion("ok", [
  dashboardSuccessResponseSchema,
  dashboardErrorResponseSchema,
]);

export type DashboardSuccessData = z.infer<
  typeof dashboardSuccessResponseSchema
>["data"];

export type DashboardErrorData = z.infer<
  typeof dashboardErrorResponseSchema
>["error"];