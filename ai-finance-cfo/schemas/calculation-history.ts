import * as z from "zod";
import { savingsGoalSchema } from "@/schemas/savings-goal";

export const calculationHistoryRowSchema = z.object({
  id: z.string().min(1),
  intentType: z.string().min(1),
  inputJson: z.string(),
  formulaJson: z.string(),
  outputJson: z.string(),
  modelTraceJson: z.string().nullable(),
  createdAt: z.number().int().positive(),
});

export const calculationHistoryResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    histories: z.array(calculationHistoryRowSchema),
  }),
});

export const calculationHistoryErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export const calculationHistoryApiResponseSchema =
  z.discriminatedUnion("ok", [
    calculationHistoryResponseSchema,
    calculationHistoryErrorResponseSchema,
  ]);

export type CalculationHistoryRow = z.infer<
  typeof calculationHistoryRowSchema
>;

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

const savingsGoalFormulaSchema = z.object({
  calculator: z.literal("savings_goal"),
  version: z.string(),
  assumptions: z.object({
    annualRateType: z.string(),
    contributionTiming: z.string(),
    moneyRounding: z.string(),
    requiredSavingRounding: z.string(),
  }),
  steps: z.array(calculationStepSchema),
});

const savingsGoalOutputSchema = z.object({
  targetAmount: z.string(),
  currentAmount: z.string(),
  monthlySaving: z.string(),
  annualRate: z.string(),
  months: z.number().int(),
  projectedAmount: z.string(),
  reached: z.boolean(),
  gap: z.string(),
  excess: z.string(),
  requiredMonthlySaving: z.string(),
});

const modelTraceSchema = z.object({
  provider: z.literal("deepseek"),
  model: z.string(),
  parsedIntent: z.literal("savings_goal"),
});

export type ParsedSavingsGoalHistory = {
  status: "valid";
  id: string;
  createdAt: number;
  input: z.infer<typeof savingsGoalSchema>;
  formula: z.infer<typeof savingsGoalFormulaSchema>;
  output: z.infer<typeof savingsGoalOutputSchema>;
  modelTrace: z.infer<typeof modelTraceSchema> | null;
};

export type InvalidCalculationHistory = {
  status: "invalid";
  id: string;
  createdAt: number;
  message: string;
};

export type ParsedCalculationHistory =
  | ParsedSavingsGoalHistory
  | InvalidCalculationHistory;

export function parseCalculationHistory(
  row: CalculationHistoryRow,
): ParsedCalculationHistory {
  if (row.intentType !== "savings_goal") {
    return {
      status: "invalid",
      id: row.id,
      createdAt: row.createdAt,
      message: `暂不支持展示 ${row.intentType} 历史`,
    };
  }

  try {
    const inputValue: unknown = JSON.parse(row.inputJson);
    const formulaValue: unknown = JSON.parse(row.formulaJson);
    const outputValue: unknown = JSON.parse(row.outputJson);
    const modelTraceValue: unknown =
      row.modelTraceJson === null
        ? null
        : JSON.parse(row.modelTraceJson);

    const input = savingsGoalSchema.safeParse(inputValue);
    const formula =
      savingsGoalFormulaSchema.safeParse(formulaValue);
    const output =
      savingsGoalOutputSchema.safeParse(outputValue);
    const modelTrace =
      modelTraceValue === null
        ? { success: true as const, data: null }
        : modelTraceSchema.safeParse(modelTraceValue);

    if (
      !input.success ||
      !formula.success ||
      !output.success ||
      !modelTrace.success
    ) {
      return {
        status: "invalid",
        id: row.id,
        createdAt: row.createdAt,
        message: "历史结构与当前版本不兼容",
      };
    }

    return {
      status: "valid",
      id: row.id,
      createdAt: row.createdAt,
      input: input.data,
      formula: formula.data,
      output: output.data,
      modelTrace: modelTrace.data,
    };
  } catch {
    return {
      status: "invalid",
      id: row.id,
      createdAt: row.createdAt,
      message: "历史 JSON 无法解析",
    };
  }
}
