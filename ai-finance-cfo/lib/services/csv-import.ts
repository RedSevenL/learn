import { buildTransactionDuplicateKey } from "@/lib/import/duplicate-key";
import {
  createTransactions,
  listTransactionsByAccountId
} from "@/lib/services/transactions";
import type {
  CsvImportCandidate,
  CsvImportRequest
} from "@/schemas/csv-import";

export type PreviewedCsvRow = CsvImportCandidate & {
  duplicate: boolean;
  duplicateReason?: "same_file" | "database";
  duplicateOfRowNumber?: number;
};

export async function previewCsvImport(
  input: CsvImportRequest
): Promise<PreviewedCsvRow[]> {
  const existingTransactions =
    await listTransactionsByAccountId(input.accountId);

  const databaseKeys = new Set(
    existingTransactions.map((transaction) =>
      buildTransactionDuplicateKey({
        accountId: input.accountId,
        occurredAt: transaction.occurredAt,
        amount: transaction.amount,
        direction: transaction.direction,
        merchant: transaction.merchant
      })
    )
  );

  const firstRowByKey = new Map<string, number>();

  return input.rows.map((row) => {
    const key = buildTransactionDuplicateKey({
      accountId: input.accountId,
      ...row
    });
    const firstRowNumber = firstRowByKey.get(key);

    if (firstRowNumber !== undefined) {
      return {
        ...row,
        duplicate: true,
        duplicateReason: "same_file",
        duplicateOfRowNumber: firstRowNumber
      };
    }

    firstRowByKey.set(key, row.rowNumber);

    if (databaseKeys.has(key)) {
      return {
        ...row,
        duplicate: true,
        duplicateReason: "database"
      };
    }

    return {
      ...row,
      duplicate: false
    };
  });
}

export async function confirmCsvImport(
  input: CsvImportRequest
) {
  const previewedRows = await previewCsvImport(input);
  const readyRows = previewedRows.filter((row) => !row.duplicate);
  const duplicateRows = previewedRows.filter((row) => row.duplicate);

  const created = await createTransactions(
    readyRows.map((row) => ({
      accountId: input.accountId,
      occurredAt: row.occurredAt,
      amount: row.amount,
      direction: row.direction,
      category: row.category,
      merchant: row.merchant,
      note: row.note,
      source: "csv" as const,
      rawPayload: row.rawPayload
    }))
  );

  return {
    created,
    skippedRows: duplicateRows.map((row) => ({
      rowNumber: row.rowNumber,
      reason: row.duplicateReason
    }))
  };
}