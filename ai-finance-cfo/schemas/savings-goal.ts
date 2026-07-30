import * as z from "zod";
import { positiveMoneyStringSchema } from "./finance";

const strictlyPositiveMoneySchema = positiveMoneyStringSchema.refine(
  (value) => /[1-9]/.test(value),
  "目标金额必须大于 0",
);

const annualRateSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?$/, "年化收益率格式不正确");

export const savingsGoalSchema = z.object({
  targetAmount: strictlyPositiveMoneySchema,
  currentAmount: positiveMoneyStringSchema,
  monthlySaving: positiveMoneyStringSchema,
  annualRate: annualRateSchema,
  months: z.number().int().positive().max(1200),
});

export type SavingsGoalRequest = z.infer<typeof savingsGoalSchema>;