import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { transactions } from "@/lib/db/schema";
import type { CreateTransactionInput } from "@/schemas/finance";

export async function listTransactions() {
  return db
    .select()
    .from(transactions)
    .where(isNull(transactions.deletedAt));
}

export async function listTransactionsByAccountId(
  accountId: string
) {
  return db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.accountId, accountId),
        isNull(transactions.deletedAt)
      )
    );
}

export async function createTransaction(input: CreateTransactionInput) {
  const now = Date.now();

  const transaction = {
    id: crypto.randomUUID(),
    accountId: input.accountId,
    occurredAt: input.occurredAt,
    amount: input.amount,
    direction: input.direction,
    category: input.category,
    merchant: input.merchant,
    note: input.note,
    source: input.source,
    rawPayload: input.rawPayload,
    createdAt: now,
    updatedAt: now
  };

  await db.insert(transactions).values(transaction);

  return transaction;
}

export async function createTransactions(
  inputs: CreateTransactionInput[]
) {
  if (inputs.length === 0) {
    return [];
  }

  const now = Date.now();
  const newTransactions = inputs.map((input) => ({
    id: crypto.randomUUID(),
    accountId: input.accountId,
    occurredAt: input.occurredAt,
    amount: input.amount,
    direction: input.direction,
    category: input.category,
    merchant: input.merchant,
    note: input.note,
    source: input.source,
    rawPayload: input.rawPayload,
    createdAt: now,
    updatedAt: now
  }));

  await db.insert(transactions).values(newTransactions);

  return newTransactions;
}