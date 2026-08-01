import * as z from "zod";

const calculationValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

const calculationStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  formula: z.string(),
  inputs: z.record(
    z.string(),
    calculationValueSchema,
  ),
  outputs: z.record(
    z.string(),
    calculationValueSchema,
  ),
});

const savingsGoalCalculationSchema = z.object({
  targetAmount: z.string(),
  currentAmount: z.string(),
  monthlySaving: z.string(),
  annualRate: z.string(),
  months: z.number().int().positive(),
  projectedAmount: z.string(),
  reached: z.boolean(),
  gap: z.string(),
  excess: z.string(),
  requiredMonthlySaving: z.string(),
  steps: z.array(calculationStepSchema),
});

const savingsGoalIntentSchema = z.object({
  type: z.literal("savings_goal"),
  targetAmount: z.string(),
  deadlineMonths: z.number().int().positive(),
});

const savingsGoalAssumptionsSchema = z.object({
  dataMonth: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  currentAmountSource: z.literal(
    "cash_and_bank_accounts",
  ),
  monthlySavingSource: z.literal(
    "current_month_surplus",
  ),
  annualRate: z.string(),
});

export const chatSuccessResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    reply: z.string().min(1),
    historyId: z.string().min(1),
    intent: savingsGoalIntentSchema,
    calculation: savingsGoalCalculationSchema,
    assumptions: savingsGoalAssumptionsSchema,
  }),
});

const apiIssueSchema = z.object({
  path: z.string(),
  message: z.string(),
});

export const chatErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    issues: z.array(apiIssueSchema).optional(),
  }),
});

export const chatApiResponseSchema =
  z.discriminatedUnion("ok", [
    chatSuccessResponseSchema,
    chatErrorResponseSchema,
  ]);

export type ChatSuccessData = z.infer<
  typeof chatSuccessResponseSchema
>["data"];

export type ChatErrorData = z.infer<
  typeof chatErrorResponseSchema
>["error"];