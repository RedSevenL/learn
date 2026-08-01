import type { z } from "zod";
import { transactionDirectionSchema } from "@/schemas/finance";

type TransactionDirection = z.infer<
  typeof transactionDirectionSchema
>;

export type CsvRawRow = Record<string, string>;

export type CsvFieldMapping = {
  occurredAt: string;
  amount: string;
  direction?: string;
  category?: string;
  merchant?: string;
  note?: string;
};

export type CsvCandidate = {
  rowNumber: number;
  occurredAt: number;
  amount: string;
  direction: TransactionDirection;
  category?: string;
  merchant?: string;
  note?: string;
  rawPayload: string;
};

export type CsvRowIssue = {
  field: keyof CsvFieldMapping | "row";
  message: string;
};

export type CsvDraftRow =
  | {
      status: "valid";
      candidate: CsvCandidate;
    }
  | {
      status: "invalid";
      rowNumber: number;
      raw: CsvRawRow;
      issues: CsvRowIssue[];
    };