import * as z from "zod";
import { moneyStringSchema, positiveMoneyStringSchema } from "./finance";

const strictlyPositiveMoneySchema = positiveMoneyStringSchema.refine(
  (value) => /[1-9]/.test(value),
  "目标金额必须大于 0",
);

const annualRateSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?$/, "年化收益率格式不正确");

export const createWhatIfScenarioSchema = z.object({
  name: z.string().trim().min(1, "场景名称不能为空"),
  description: z.string().trim().optional(),
  baseline: z.object({
    currentAmount: positiveMoneyStringSchema,
    targetAmount: strictlyPositiveMoneySchema,
    monthlyIncome: positiveMoneyStringSchema,
    monthlyExpense: positiveMoneyStringSchema,
    annualRate: annualRateSchema,
    horizonMonths: z.number().int().min(1).max(1200),
  }),
  changes: z.object({
    monthlyIncomeChange: moneyStringSchema,
    monthlyExpenseChange: moneyStringSchema,
  }),
});

export type CreateWhatIfScenarioInput = z.infer<
  typeof createWhatIfScenarioSchema
>;