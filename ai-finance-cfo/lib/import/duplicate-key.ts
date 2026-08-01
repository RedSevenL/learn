import Decimal from "decimal.js";

type DuplicateKeyInput = {
  accountId: string;
  occurredAt: number;
  amount: string;
  direction: string;
  merchant?: string | null;
};

function normalizeMerchant(merchant?: string | null) {
  return merchant?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
}

export function buildTransactionDuplicateKey(
  input: DuplicateKeyInput
) {
  return [
    input.accountId,
    input.occurredAt,
    new Decimal(input.amount).toFixed(2),
    input.direction,
    normalizeMerchant(input.merchant)
  ].join("|");
}