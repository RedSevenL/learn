import * as z from "zod";

export const chatRequestSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(1, "问题不能为空")
      .max(500, "问题不能超过 500 个字符"),
  })
  .strict();

export type ChatRequest = z.infer<typeof chatRequestSchema>;