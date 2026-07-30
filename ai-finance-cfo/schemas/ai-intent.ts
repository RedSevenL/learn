import * as z from "zod";
import {
  moneyStringSchema,
  positiveMoneyStringSchema,
} from "./finance";

// ── 严格正金额（必须 > 0） ─────────────────────

const strictlyPositiveMoneySchema = positiveMoneyStringSchema.refine(
  (value) => /[1-9]/.test(value),
  "金额必须大于 0",
);

// ── 意图分支 ─────────────────────────────────────

const savingsGoalIntentSchema = z
  .object({
    type: z.literal("savings_goal"),
    targetAmount: strictlyPositiveMoneySchema,
    deadlineMonths: z.number().int().min(1).max(1200),
  })
  .strict();

const debtPayoffIntentSchema = z
  .object({
    type: z.literal("debt_payoff"),
    strategy: z.enum(["snowball", "avalanche", "compare"]),
    extraPayment: positiveMoneyStringSchema,
  })
  .strict();

const cashflowForecastIntentSchema = z
  .object({
    type: z.literal("cashflow_forecast"),
    months: z.number().int().min(1).max(60),
  })
  .strict();

const whatIfIntentSchema = z
  .object({
    type: z.literal("what_if"),
    monthlyIncomeChange: moneyStringSchema,
    monthlyExpenseChange: moneyStringSchema,
    horizonMonths: z.number().int().min(1).max(1200),
  })
  .strict();

// ── 可辨识联合 schema ────────────────────────────

export const financeIntentSchema = z.discriminatedUnion("type", [
  savingsGoalIntentSchema,
  debtPayoffIntentSchema,
  cashflowForecastIntentSchema,
  whatIfIntentSchema,
]);

export type FinanceIntent = z.infer<typeof financeIntentSchema>;