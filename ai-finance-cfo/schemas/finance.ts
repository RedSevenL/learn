import * as z from "zod";

export const moneyStringSchema = z
  .string()
  .trim()
  .regex(/^-?\d+(\.\d{1,2})?$/, "金额格式不正确");

export const positiveMoneyStringSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "金额必须是非负数字");

export const accountTypeSchema = z.enum([
  "cash",
  "bank",
  "credit",
  "investment"
]);

export const transactionDirectionSchema = z.enum([
  "income",
  "expense",
  "transfer"
]);

export const transactionSourceSchema = z.enum(["manual", "csv", "api"]);

export const createAccountSchema = z.object({
    name: z.string().trim().min(1, "账户名称不能为空"),
    type: accountTypeSchema,
    currency: z.string().trim().length(3).default("CNY"),
    balance: moneyStringSchema
  });
  
  export type CreateAccountInput = z.infer<typeof createAccountSchema>;

  export const createTransactionSchema = z.object({
    accountId: z.string().trim().min(1, "账户 ID 不能为空"),
    occurredAt: z.number().int().positive("流水时间不能为空"),
    amount: moneyStringSchema,
    direction: transactionDirectionSchema,
    category: z.string().trim().optional(),
    merchant: z.string().trim().optional(),
    note: z.string().trim().optional(),
    source: transactionSourceSchema.default("manual"),
    rawPayload: z.string().optional()
  });
  
  export type CreateTransactionInput = z.infer<
    typeof createTransactionSchema
  >;

  export const createLiabilitySchema = z.object({
    name: z.string().trim().min(1, "负债名称不能为空"),
    principal: positiveMoneyStringSchema,
    remainingPrincipal: positiveMoneyStringSchema,
    annualRate: z
      .string()
      .trim()
      .regex(/^\d+(\.\d+)?$/, "年利率格式不正确"),
    minimumPayment: positiveMoneyStringSchema.optional(),
    dueDay: z.number().int().min(1).max(31).optional(),
    startDate: z.number().int().positive().optional(),
    endDate: z.number().int().positive().optional()
  });
  
  export type CreateLiabilityInput = z.infer<
    typeof createLiabilitySchema
  >;