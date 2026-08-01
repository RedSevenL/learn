import * as z from "zod";
import {
  positiveMoneyStringSchema,
  transactionDirectionSchema
} from "@/schemas/finance";

const optionalCsvTextSchema = z
  .string()
  .trim()
  .max(200, "文本字段不能超过 200 个字符")
  .optional();

export const csvImportCandidateSchema = z.object({
  rowNumber: z.number().int().min(2),
  occurredAt: z.number().int().positive(),
  amount: positiveMoneyStringSchema,
  direction: transactionDirectionSchema,
  category: optionalCsvTextSchema,
  merchant: optionalCsvTextSchema,
  note: z.string().trim().max(500).optional(),
  rawPayload: z.string().max(5000, "原始行内容过长")
});

export const csvImportRequestSchema = z.object({
  accountId: z.string().trim().min(1, "请选择账户"),
  rows: z
    .array(csvImportCandidateSchema)
    .min(1, "没有可处理的流水")
    .max(1000, "单次最多处理 1000 条流水")
});

export type CsvImportCandidate = z.infer<
  typeof csvImportCandidateSchema
>;

export type CsvImportRequest = z.infer<
  typeof csvImportRequestSchema
>;